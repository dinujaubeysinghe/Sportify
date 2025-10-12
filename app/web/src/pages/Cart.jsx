import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Tag,
  CreditCard,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import useSettings from '../hooks/useSettings'; // Adjust path as needed

const Cart = () => {
  const {
    items,
    total,
    itemCount,
    discountCode,
    discountAmount,
    isLoading,
    updateItemQuantity,
    removeFromCart,
    applyDiscount,
    removeDiscount,
    // REMOVED: getCartSummary is no longer needed
    loadCart
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
    const { settings, isLoading: settingsLoading } = useSettings();

  const [codeInput, setCodeInput] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  // REMOVED: [summary, setSummary] is no longer needed

  // *** CALCULATE SUBSTOTAL LOCALLY ***
  // Subtotal is the sum of item costs *before* discount/shipping/tax.
  // We can calculate this using the items array and the known discountAmount.
  const subtotal = total + discountAmount;

  const currencyCode = settings?.currency || 'LKR'; 

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(price);
  };

  // REMOVED: useEffect for fetching summary is no longer needed

  // Ensure cart is loaded on mount (for persistent discount)
  useEffect(() => {
    // Only load the cart if it's currently empty or if it hasn't been loaded after login
    // The previous implementation in CartContext already handles clearing the cart on logout
    if (isAuthenticated) loadCart();
  }, [isAuthenticated, loadCart]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    // The CartContext already handles setting the new state (items, total, itemCount)
    await updateItemQuantity(itemId, newQuantity);
    // REMOVED: No need to call getCartSummary()
  };

  const handleRemoveItem = async (itemId) => {
    // The CartContext already handles setting the new state (items, total, itemCount)
    await removeFromCart(itemId);
    // REMOVED: No need to call getCartSummary()
  };

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    setIsApplyingDiscount(true);
    await applyDiscount(codeInput.trim());
    setIsApplyingDiscount(false);
    // The CartContext already updates discountCode, discountAmount, and total
    setCodeInput('');
    // REMOVED: No need to call getCartSummary()
  };

  const handleRemoveDiscount = async () => {
    await removeDiscount();
    // The CartContext already updates discountCode, discountAmount, and total
    // REMOVED: No need to call getCartSummary()
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed to checkout');
      navigate('/login');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // The login check is fine, no changes needed here
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your cart.</p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  // The empty cart check is fine, no changes needed here
  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Cart - Sportify</title>
          <meta name="description" content="Your shopping cart is empty. Browse our products to add items." />
        </Helmet>

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
              </p>
              <Link
                to="/products"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main Cart View
  return (
    <>
      <Helmet>
        <title>Cart - Sportify</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 space-y-6">
                  {items.map((item) => (
                    <div key={item._id} className="flex items-center space-x-4 border-b border-gray-200 pb-6 last:border-b-0 group hover:bg-gray-50 p-4 -mx-4 rounded-lg transition-colors">
                      <img
                        src={`${import.meta.env.VITE_SERVER_URL}${item?.product?.images?.[0]?.url || '/placeholder-product.jpg'}`}
                        alt={item.product?.name}
                        className="w-20 h-20 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{item.product?.name}</h3>
                        <p className="text-sm text-gray-600">{item?.product?.brand?.name}</p>
                        {item.selectedSize && <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>}
                        {item.selectedColor && <p className="text-sm text-gray-500">Color: {item.selectedColor}</p>}
                        <p className="text-lg font-semibold text-gray-900 mt-2">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)} disabled={isLoading} className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-1 border border-gray-300 rounded min-w-[50px] text-center">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)} disabled={isLoading} className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      <button onClick={() => handleRemoveItem(item._id)} disabled={isLoading} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm sticky top-8 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

                {/* Discount Section */}
                {!discountCode ? (
                  <form onSubmit={handleApplyDiscount} className="mb-6 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Discount Code</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingDiscount || !codeInput.trim() || isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                      >
                        {(isApplyingDiscount || isLoading) ? <LoadingSpinner size="sm" /> : <Tag className="h-4 w-4" />}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-green-700 font-medium">
                        Applied: <span className="font-semibold">{discountCode}</span>
                      </p>
                      <p className="text-green-600 text-sm">Saved {formatPrice(discountAmount)}</p>
                    </div>
                    <button
                      onClick={handleRemoveDiscount}
                      disabled={isLoading}
                      className="text-red-600 text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    {/* Subtotal is now calculated locally based on context state */}
                    <span className="text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({discountCode})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  {/* Additional breakdown (Shipping/Tax) would go here if fetched */}
                  
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-semibold">
                    <span>Order Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading || items.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : <CreditCard className="h-5 w-5 mr-2" />}
                  Proceed to Checkout
                </button>

                <div className="mt-6 text-center flex items-center justify-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-1" />
                  Secure checkout
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/products" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
              <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;