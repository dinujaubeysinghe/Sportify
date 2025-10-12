import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  // Load initial discount state from local storage
  discountCode: localStorage.getItem('discountCode') || null,
  discountAmount: parseFloat(localStorage.getItem('discountAmount')) || 0,
  isLoading: false,
  error: null
};

// --- Reducer (Kept simple and correct) ---
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'CART_START':
      return { ...state, isLoading: true, error: null };

    case 'CART_SUCCESS':
      // CART_SUCCESS now ONLY uses the final totals provided by the server.
      return {
        ...state,
        items: action.payload.items || [],
        total: action.payload.total || 0,
        itemCount: action.payload.itemCount || 0,
        // Update discount from server response if available (e.g., from applyDiscount)
        discountCode: action.payload.discountCode || state.discountCode,
        discountAmount: action.payload.discountAmount || state.discountAmount,
        isLoading: false,
        error: null
      };

    case 'CART_FAILURE':
      return { ...state, isLoading: false, error: action.payload };

    case 'CLEAR_CART':
      localStorage.removeItem('discountCode');
      localStorage.removeItem('discountAmount');
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
        discountCode: null,
        discountAmount: 0,
        isLoading: false
      };

    case 'APPLY_DISCOUNT':
      // Used only to persist discount code/amount locally until next full CART_SUCCESS
      return {
        ...state,
        discountCode: action.payload.code,
        discountAmount: action.payload.amount,
        isLoading: false
      };

    case 'REMOVE_DISCOUNT':
      return {
        ...state,
        discountCode: null,
        discountAmount: 0,
        total: action.payload.total,
        isLoading: false
      };

    default:
      return state;
  }
};
// --- End Reducer ---

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Removed processCartResponse helper entirely as it was the source of client-side miscalculation.

  // --- Async Actions (Wrapped in useCallback) ---

  // Load cart from server (FIXED: Trusts server's cart.total and discount fields)
  const loadCart = useCallback(async () => {
    try {
      dispatch({ type: 'CART_START' });
      const response = await axios.get('/cart');
      const { cart } = response.data;
      
      const serverDiscount = cart.appliedDiscount || {};

      // Dispatch server-calculated totals directly
      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: cart.items || [],
          total: cart.total || 0, // <-- FINAL AUTHORITATIVE TOTAL
          itemCount: cart.items?.reduce((total, item) => total + item.quantity, 0) || 0,
          discountCode: serverDiscount.code,
          discountAmount: serverDiscount.amount,
        }
      });
    } catch (error) {
      console.error('Load cart error:', error);
      dispatch({ type: 'CART_FAILURE', payload: error.message });
    }
  }, [dispatch]); 

  // Add item (FIXED: Trusts server's cart.total)
  const addToCart = useCallback(async (productId, quantity = 1, options = {}) => {
    try {
      dispatch({ type: 'CART_START' });
      const response = await axios.post('/cart/items', {
        productId,
        quantity,
        selectedSize: options.size,
        selectedColor: options.color
      });
      const { cart } = response.data;
      
      const serverDiscount = cart.appliedDiscount || {};

      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: cart.items || [],
          total: cart.total || 0, // <-- FINAL AUTHORITATIVE TOTAL
          itemCount: cart.items?.reduce((total, item) => total + item.quantity, 0) || 0,
          discountCode: serverDiscount.code,
          discountAmount: serverDiscount.amount,
        }
      });

      toast.success('Item added to cart!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item';
      dispatch({ type: 'CART_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, [dispatch]);

  // Apply discount code (FIXED: Simplest, fastest update based on server response)
  const applyDiscount = useCallback(async (code) => {
    try {
      dispatch({ type: 'CART_START' });

      // 1. Send code to server (which applies discount, triggers pre-save, and updates cart.total)
      const response = await axios.post('/cart/discount', { code });
      const { cart } = response.data; // Server returns the final, discounted cart

      const discountAmount = cart.appliedDiscount?.amount || 0;
      const discountCode = cart.appliedDiscount?.code;

      // 2. Dispatch APLLY_DISCOUNT to update the discount code and amount in state/localStorage
      dispatch({
        type: 'APPLY_DISCOUNT',
        payload: { code: discountCode, amount: discountAmount }
      });

      // 3. Dispatch CART_SUCCESS to update the final total and items
      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: cart.items || [],
          total: cart.total || 0, // <-- USE SERVER'S FINAL TOTAL
          itemCount: cart.items?.reduce((total, item) => total + item.quantity, 0) || 0,
          discountCode: discountCode,
          discountAmount: discountAmount,
        }
      });

      localStorage.setItem('discountCode', discountCode);
      localStorage.setItem('discountAmount', discountAmount.toString());

      // Use a formatter if available, otherwise rely on the frontend Cart component's formatter
      toast.success(`Discount applied! You saved $${discountAmount.toFixed(2)}`);
      return { success: true, discountAmount, finalAmount: cart.total || 0 };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid discount code';
      dispatch({ type: 'CART_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, [dispatch]);

  // Remove discount (FIXED: Trusts server's cart.total)
  const removeDiscount = useCallback(async () => {
    try {
      dispatch({ type: 'CART_START' });
      const response = await axios.delete('/cart/discount'); // Assuming a dedicated API endpoint for removal
      const { cart } = response.data;

      // Total from server is now the base total (or new calculated total)
      const newTotal = cart.total || 0;

      dispatch({
        type: 'REMOVE_DISCOUNT',
        payload: { total: newTotal }
      });

      localStorage.removeItem('discountCode');
      localStorage.removeItem('discountAmount');

      toast.success('Discount removed');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove discount';
      dispatch({ type: 'CART_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, [dispatch]);

  // Update item quantity (FIXED: Trusts server's cart.total)
  const updateItemQuantity = useCallback(async (itemId, quantity) => {
    try {
      dispatch({ type: 'CART_START' });

      const response = await axios.put(`/cart/items/${itemId}`, { quantity });
      const { cart } = response.data;
      
      const serverDiscount = cart.appliedDiscount || {};

      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: cart.items || [],
          total: cart.total || 0, // <-- FINAL AUTHORITATIVE TOTAL
          itemCount: cart.items?.reduce((total, item) => total + item.quantity, 0) || 0,
          discountCode: serverDiscount.code,
          discountAmount: serverDiscount.amount,
        }
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update item quantity';
      dispatch({ type: 'CART_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, [dispatch]);

  // Remove item from cart (FIXED: Trusts server's cart.total)
  const removeFromCart = useCallback(async (itemId) => {
    try {
      dispatch({ type: 'CART_START' });

      const response = await axios.delete(`/cart/items/${itemId}`);
      const { cart } = response.data;
      
      const serverDiscount = cart.appliedDiscount || {};

      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: cart.items || [],
          total: cart.total || 0, // <-- FINAL AUTHORITATIVE TOTAL
          itemCount: cart.items?.reduce((total, item) => total + item.quantity, 0) || 0,
          discountCode: serverDiscount.code,
          discountAmount: serverDiscount.amount,
        }
      });

      toast.success('Item removed from cart!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item from cart';
      dispatch({ type: 'CART_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, [dispatch]);

  // Clear cart (unchanged)
  const clearCart = useCallback(async () => {
    try {
      dispatch({ type: 'CART_START' });
      await axios.delete('/cart/clear');

      dispatch({ type: 'CLEAR_CART' });
      toast.success('Cart cleared!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      dispatch({ type: 'CART_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, [dispatch]);

  // Update shipping address (FIXED: Trusts server's cart.total)
  const updateShippingAddress = useCallback(async (address) => {
    try {
      dispatch({ type: 'CART_START' });

      const response = await axios.put('/cart/shipping', address);
      const { cart } = response.data;
      
      const serverDiscount = cart.appliedDiscount || {};

      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: cart.items || [],
          total: cart.total || 0, // <-- FINAL AUTHORITATIVE TOTAL
          itemCount: cart.items?.reduce((total, item) => total + item.quantity, 0) || 0,
          discountCode: serverDiscount.code,
          discountAmount: serverDiscount.amount,
        }
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update shipping address';
      dispatch({ type: 'CART_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, [dispatch]);

  // Get cart summary (unchanged)
  const getCartSummary = useCallback(async () => {
    try {
      const response = await axios.get('/cart/summary');
      return { success: true, summary: response.data.summary };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // --- Effects ---

  // 🧠 Load cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      const timeoutId = setTimeout(() => loadCart(), 200);
      return () => clearTimeout(timeoutId);
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated, loadCart, dispatch]);

  // 💾 Persist discount in localStorage
  useEffect(() => {
    if (state.discountCode) {
      localStorage.setItem('discountCode', state.discountCode);
      localStorage.setItem('discountAmount', state.discountAmount.toString());
    } else {
      localStorage.removeItem('discountCode');
      localStorage.removeItem('discountAmount');
    }
  }, [state.discountCode, state.discountAmount]);

  // --- Context Value ---
  const value = {
    ...state,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
    applyDiscount,
    removeDiscount,
    updateShippingAddress,
    getCartSummary,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;