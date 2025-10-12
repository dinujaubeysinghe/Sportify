import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  CreditCard, 
  Truck, 
  Shield, 
  CheckCircle,
  ArrowLeft,
  Lock,
  ShoppingCart 
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import axios from 'axios';
import useSettings from '../hooks/useSettings'; // Adjust path as needed

const Checkout = () => {
  const { 
    items, 
    total, // Final discounted total
    itemCount, 
    discountAmount, // Discount amount
    clearCart,
    loadCart // To ensure fresh data on mount
  } = useCart();
    const { settings, isLoading: settingsLoading } = useSettings();

  const { user } = useAuth();
  const navigate = useNavigate();

  // --- State & Calculations ---
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // NOTE: Server is the source of truth, but we use these for client-side display.
  // Assuming simple/free shipping and no tax for initial display based on Order Model defaults.
  // The server will calculate the *actual* final values during order creation.
  const displaySubtotal = total + discountAmount;
  const displayShippingCost = 0; // The server will calculate the real shipping cost
  const displayTaxAmount = 0;    // The server will calculate the real tax

  // Form data initialization
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Sri Lanka'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    saveCard: false
  });

  const [billingInfo, setBillingInfo] = useState({
    sameAsShipping: true,
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Sri Lanka'
  });

  const [orderNotes, setOrderNotes] = useState('');

  // --- Effects ---
  useEffect(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty. Redirecting to cart.');
      navigate('/cart');
      return;
    }
    // Load cart to ensure the total is fresh and discount is applied
    loadCart();
  }, [items, navigate, loadCart]);

  // --- Helper Functions ---
    const currencyCode = settings?.currency || 'LKR'; 

    // FIX: Dynamic currency code
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode // <--- DYNAMICALLY USE SETTINGS CURRENCY
      }).format(price);
    };

  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleBillingChange = (field, value) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step) => {
    // Validation logic (unchanged)
    switch (step) {
      case 1:
        return shippingInfo.firstName && shippingInfo.lastName && 
              shippingInfo.email && shippingInfo.phone && 
              shippingInfo.address && shippingInfo.city && 
              shippingInfo.state && shippingInfo.zipCode;
      case 2:
        return paymentInfo.cardNumber && paymentInfo.expiryDate && 
              paymentInfo.cvv && paymentInfo.nameOnCard;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // --- Core Logic: Place Order (SECURELY) ---
  const handlePlaceOrder = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      // **SECURE FIX:** We only send the customer's choice and address data.
      // The server will look up the cart and calculate the price securely.
      const orderData = {
        paymentMethod: 'credit_card', 
        shippingAddress: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone
        },
        billingAddress: billingInfo.sameAsShipping
          ? { ...shippingInfo } // Copy shipping info as billing
          : {
              firstName: billingInfo.firstName,
              lastName: billingInfo.lastName,
              street: billingInfo.address,
              city: billingInfo.city,
              state: billingInfo.state,
              zipCode: billingInfo.zipCode,
              country: billingInfo.country
            },
        notes: orderNotes,
        // The items, subtotal, discount, tax, and total are calculated by the server
        // based on the user's Cart document.
      };


      // Send order via Axios
      const response = await axios.post(`/orders`, orderData, {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      clearCart(); // Clear cart state (and localStorage discount) on success
      toast.success(`Order #${response.data.order.orderNumber} placed successfully! 🎉`);
      navigate('/orders');
    } catch (error) {
      console.error('Place Order Error:', error);
      const message =
        error.response?.data?.message || error.message || 'Failed to place order. Please try again.';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };


  const steps = [
    { id: 1, title: 'Shipping', description: 'Delivery information' },
    { id: 2, title: 'Payment', description: 'Payment details' },
    { id: 3, title: 'Review', description: 'Confirm order' }
  ];

  // (Component render logic remains largely the same, focusing on the summary panel changes)

  if (items.length === 0) {
    // (Empty cart return block is unchanged)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Sportify</title>
        <meta name="description" content="Complete your purchase securely." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header and Progress Steps (unchanged) */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">Complete your purchase securely</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (<CheckCircle className="w-5 h-5" />) : (<span className="text-sm font-semibold">{step.id}</span>)}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'}`}>{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (<div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'}`} />)}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form (Step 1, 2, 3 content unchanged) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                {/* Step 1: Shipping Information (unchanged) */}
                {currentStep === 1 && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center"><Truck className="w-5 h-5 mr-2 text-blue-600" />Shipping Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* ... All shipping input fields ... */}
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label><input type="text" value={shippingInfo.firstName} onChange={(e) => handleShippingChange('firstName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label><input type="text" value={shippingInfo.lastName} onChange={(e) => handleShippingChange('lastName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Email *</label><input type="email" value={shippingInfo.email} onChange={(e) => handleShippingChange('email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label><input type="tel" value={shippingInfo.phone} onChange={(e) => handleShippingChange('phone', e.target.value.replace(/\D/g, ""))} maxLength={10} placeholder="0712345678" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/></div>
                      <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Address *</label><input type="text" value={shippingInfo.address} onChange={(e) => handleShippingChange('address', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">City *</label><input type="text" value={shippingInfo.city} onChange={(e) => handleShippingChange('city', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">State *</label><input type="text" value={shippingInfo.state} onChange={(e) => handleShippingChange('state', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label><input type="text" value={shippingInfo.zipCode} onChange={(e) => handleShippingChange('zipCode', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Country *</label><select value={shippingInfo.country} onChange={(e) => handleShippingChange('country', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"><option value="Sri Lanka">Sri Lanka</option></select></div>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment Information (unchanged) */}
                {currentStep === 2 && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center"><CreditCard className="w-5 h-5 mr-2 text-blue-600" />Payment Information</h2>
                    <div className="space-y-4">
                      {/* ... All payment input fields ... */}
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label><input type="text" value={paymentInfo.cardNumber} onChange={(e) => handlePaymentChange('cardNumber', e.target.value.replace(/\D/g, ""))} maxLength={16} placeholder="1234 5678 9012 3456" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label><input type="text" value={paymentInfo.expiryDate} onChange={(e) => handlePaymentChange('expiryDate', e.target.value)} placeholder="MM/YY" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label><input type="text" value={paymentInfo.cvv} onChange={(e) => handlePaymentChange('cvv', e.target.value.replace(/\D/g, ""))} maxLength={4} placeholder="123" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/></div>
                      </div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Name on Card *</label><input type="text" value={paymentInfo.nameOnCard} onChange={(e) => handlePaymentChange('nameOnCard', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/></div>
                      <div className="flex items-center"><input type="checkbox" id="saveCard" checked={paymentInfo.saveCard} onChange={(e) => handlePaymentChange('saveCard', e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/><label htmlFor="saveCard" className="ml-2 text-sm text-gray-700">Save card for future purchases</label></div>
                    </div>
                  </div>
                )}

                {/* Step 3: Review Order (unchanged) */}
                {currentStep === 3 && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-blue-600" />Review Your Order</h2>
                    <div className="space-y-4 mb-6">
                      <h3 className="font-medium text-gray-900">Order Items ({itemCount})</h3>
                      {items.map((item) => (
                        <div key={item._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <img src={`${import.meta.env.VITE_SERVER_URL}${item.product.images?.[0]?.url || '/placeholder-product.jpg'}`} alt={item.product?.name} className="w-16 h-16 object-cover rounded-lg"/>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                            {item.selectedSize && <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>}
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (Optional)</label>
                      <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Any special instructions for your order..."/>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons (unchanged) */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-between">
                  {currentStep > 1 && (<button onClick={prevStep} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Previous</button>)}
                  <div className="ml-auto">
                    {currentStep < 3 ? (<button onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Next</button>) : (
                      <button onClick={handlePlaceOrder} disabled={isProcessing || items.length === 0} className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center">
                        {isProcessing ? (<><LoadingSpinner size="sm" className="mr-2" />Processing...</>) : (<><Lock className="w-4 h-4 mr-2" />Place Order</>)}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary (FIXED: Uses context state for display) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm sticky top-8">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{formatPrice(displaySubtotal)}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Discount</span>
                        <span className="text-green-600">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">{displayShippingCost > 0 ? formatPrice(displayShippingCost) : 'Free'}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">{formatPrice(displayTaxAmount)}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total (LKR)</span>
                        <span>{formatPrice(total)}</span> {/* Final Total from CartContext */}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-4">
                    <Shield className="h-4 w-4" />
                    <span>Secure checkout</span>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">We accept</p>
                    <div className="flex justify-center space-x-2">
                      <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">VISA</div>
                      <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center">MC</div>
                      <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center">AMEX</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;