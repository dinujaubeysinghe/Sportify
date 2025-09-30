import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  Tag,
  Truck,
  CreditCard,
  ArrowRight,
  Shield  
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Cart = () => {
  const { 
    items, 
    total, 
    itemCount, 
    isLoading, 
    updateItemQuantity, 
    removeFromCart, 
    applyDiscount, 
    removeDiscount,
    getCartSummary 
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [summary, setSummary] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(price);
  };

  useEffect(() => {
    const fetchSummary = async () => {
      if (items.length > 0) {
        const newSummary = await getCartSummary();
        if (newSummary.success) {
          setSummary(newSummary.summary);
        }
      }
    };

    fetchSummary();
  }, [items]); 

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const result = await updateItemQuantity(itemId, newQuantity);
    if (result.success) {
      // Update local summary
      const newSummary = await getCartSummary();
      if (newSummary.success) {
        setSummary(newSummary.summary);
      }
    }
  };

  const handleRemoveItem = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      // Update local summary
      const newSummary = await getCartSummary();
      if (newSummary.success) {
        setSummary(newSummary.summary);
      }
    }
  };

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    if (!discountCode.trim()) return;

    setIsApplyingDiscount(true);
    const result = await applyDiscount(discountCode.trim());
    setIsApplyingDiscount(false);

    if (result.success) {
      setDiscountCode('');
      // Update local summary
      const newSummary = await getCartSummary();
      if (newSummary.success) {
        setSummary(newSummary.summary);
      }
    }
  };

  const handleRemoveDiscount = async () => {
    const result = await removeDiscount();
    if (result.success) {
      // Update local summary
      const newSummary = await getCartSummary();
      if (newSummary.success) {
        setSummary(newSummary.summary);
      }
    }
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

  return (
    <>
    {/* Cart Page */}
      <Helmet>
        <title>Cart - Sportify</title>
        <meta name="description" content="Review your cart items and proceed to checkout." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
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
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Cart Items</h2>
                  
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item._id} className="flex items-center space-x-4 border-b border-gray-200 pb-6 last:border-b-0 group hover:bg-gray-50 p-4 -mx-4 rounded-lg transition-colors">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={`${import.meta.env.VITE_SERVER_URL}${item.product.images?.[0]?.url || '/placeholder-product.jpg'}`}
                            alt={item.product?.name}
                            className="w-20 h-20 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {item.product?.name}
                          </h3>
                          <p className="text-sm text-gray-600">{item.product?.brand.name}</p>
                          {item.selectedSize && (
                            <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                          )}
                          {item.selectedColor && (
                            <p className="text-sm text-gray-500">Color: {item.selectedColor}</p>
                          )}
                          <p className="text-lg font-semibold text-gray-900 mt-2">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-1 border border-gray-300 rounded min-w-[50px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm sticky top-8">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

                  {/* Discount Code */}
                  <div className="mb-6">
                    <form onSubmit={handleApplyDiscount} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Discount Code
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          placeholder="Enter code"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="submit"
                          disabled={isApplyingDiscount || !discountCode.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {isApplyingDiscount ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Tag className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Summary */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">
                        {formatPrice(summary?.subtotal || items.reduce((total, item) => total + (item.price * item.quantity), 0))}
                      </span>
                    </div>
                    
                    {summary?.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Discount</span>
                        <span className="text-green-600">-{formatPrice(summary.discount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">
                        {summary?.shipping > 0 ? formatPrice(summary.shipping) : 'Free'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">
                        {formatPrice(summary?.tax || 0)}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(summary?.total || total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </button>

                  {/* Security Badge */}
                  <div className="mt-6 text-center">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4" />
                      <span>Secure checkout</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-8 text-center">
            <Link
              to="/products"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
            >
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
