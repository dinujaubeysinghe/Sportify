import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'CART_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'CART_SUCCESS':
      return {
        ...state,
        items: action.payload.items || [],
        total: action.payload.total || 0,
        itemCount: action.payload.itemCount || 0,
        isLoading: false,
        error: null
      };
    case 'CART_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
        itemCount: state.itemCount + action.payload.quantity,
        isLoading: false
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item._id === action.payload._id ? action.payload : item
        ),
        isLoading: false
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload),
        itemCount: state.itemCount - 1,
        isLoading: false
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
        isLoading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load cart on authentication
  useEffect(() => {
    if (isAuthenticated) {
      // Add delay to prevent rapid requests
      const timeoutId = setTimeout(() => {
        loadCart();
      }, 200);
      return () => clearTimeout(timeoutId);
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated]);

  // Load cart from server
  const loadCart = async () => {
    try {
      dispatch({ type: 'CART_START' });
      const response = await axios.get('/cart');
      const { cart } = response.data;

      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: cart.items || [],
          total: cart.total || 0,
          itemCount: cart.items?.reduce((total, item) => total + item.quantity, 0) || 0
        }
      });
    } catch (error) {
      console.error('Load cart error:', error);
      dispatch({ type: 'CART_FAILURE', payload: error.message });
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1, options = {}) => {
    try {
      dispatch({ type: 'CART_START' });

      const response = await axios.post('/cart/items', {
        productId,
        quantity,
        selectedSize: options.size,
        selectedColor: options.color
      });

      const { cart } = response.data;

      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: cart.items || [],
          total: cart.total || 0,
          itemCount: cart.items?.reduce((total, item) => total + item.quantity, 0) || 0
        }
      });

      toast.success('Item added to cart!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      dispatch({ type: 'CART_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update item quantity
  const updateItemQuantity = async (itemId, quantity) => {
    try {
      dispatch({ type: 'CART_START' });

      const response = await axios.put(`/cart/items/${itemId}`, {
        quantity
      });

      const { cart } = response.data;

      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: cart.items || [],
          total: cart.total || 0,
          itemCount: cart.items?.reduce((total, item) => total + item.quantity, 0) || 0
        }
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update item quantity';
      dispatch({ type: 'CART_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      dispatch({ type: 'CART_START' });

      const response = await axios.delete(`/cart/items/${itemId}`);

      const { cart } = response.data;

      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: cart.items || [],
          total: cart.total || 0,
          itemCount: cart.items?.reduce((total, item) => total + item.quantity, 0) || 0
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
  };

  // Clear cart
  const clearCart = async () => {
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
  };

  // Apply discount code
  const applyDiscount = async (code) => {
    try {
      dispatch({ type: 'CART_START' });

      const response = await axios.post('/cart/discount', { code });

      const { cart } = response.data;

      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: cart.items || [],
          total: cart.total || 0,
          itemCount: cart.items?.reduce((total, item) => total + item.quantity, 0) || 0
        }
      });

      toast.success('Discount code applied!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid discount code';
      dispatch({ type: 'CART_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Remove discount code
  const removeDiscount = async () => {
    try {
      dispatch({ type: 'CART_START' });

      const response = await axios.delete('/cart/discount');

      const { cart } = response.data;

      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: cart.items || [],
          total: cart.total || 0,
          itemCount: cart.items?.reduce((total, item) => total + item.quantity, 0) || 0
        }
      });

      toast.success('Discount code removed!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove discount code';
      dispatch({ type: 'CART_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update shipping address
  const updateShippingAddress = async (address) => {
    try {
      dispatch({ type: 'CART_START' });

      const response = await axios.put('/cart/shipping', address);

      const { cart } = response.data;

      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: cart.items || [],
          total: cart.total || 0,
          itemCount: cart.items?.reduce((total, item) => total + item.quantity, 0) || 0
        }
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update shipping address';
      dispatch({ type: 'CART_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get cart summary
  const getCartSummary = async () => {
    try {
      const response = await axios.get('/cart/summary');
      return { success: true, summary: response.data.summary };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

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
