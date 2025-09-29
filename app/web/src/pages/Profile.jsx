import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Key,
  CreditCard,
  ShoppingBag,
  Heart,
  Settings,
  Bell,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import Orders from './Orders';


const Profile = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    dateOfBirth: '',
    gender: '',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Validation functions
  const validateField = (field, value) => {
    const errors = {};
    
    switch (field) {
      case 'firstName':
        if (!value.trim()) {
          errors.firstName = 'First name is required';
        } else if (value.trim().length < 2) {
          errors.firstName = 'First name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.firstName = 'First name can only contain letters and spaces';
        }
        break;
        
      case 'lastName':
        if (!value.trim()) {
          errors.lastName = 'Last name is required';
        } else if (value.trim().length < 2) {
          errors.lastName = 'Last name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.lastName = 'Last name can only contain letters and spaces';
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          errors.email = 'Please enter a valid email address';
        }
        break;
        
      case 'phone':
        if (value.trim()) {
          // Support multiple phone number formats
          const phoneRegex = /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
          const internationalRegex = /^\+[1-9]\d{1,14}$/;
          const sriLankanRegex = /^(\+94|0)?[0-9]{9}$/;
          
          if (!phoneRegex.test(value.trim()) && !internationalRegex.test(value.trim()) && !sriLankanRegex.test(value.trim())) {
            errors.phone = 'Please enter a valid phone number (e.g., +94-77-123-4567, 077-123-4567, or +1-555-123-4567)';
          }
        }
        break;
        
      case 'zipCode':
        if (value.trim()) {
          // Support multiple ZIP/Postal code formats
          const usZipRegex = /^\d{5}(-\d{4})?$/;
          const generalPostalRegex = /^[A-Za-z0-9\s-]{3,10}$/;
          
          if (!usZipRegex.test(value.trim()) && !generalPostalRegex.test(value.trim())) {
            errors.zipCode = 'Please enter a valid postal code (e.g., 12345, 12345-6789, or ABC 123)';
          }
        }
        break;
        
      case 'city':
        if (value.trim() && !/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.city = 'City name can only contain letters and spaces';
        }
        break;
        
      case 'state':
        if (value.trim() && !/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.state = 'State name can only contain letters and spaces';
        }
        break;
        
      case 'address':
        if (value.trim() && value.trim().length < 5) {
          errors.address = 'Address must be at least 5 characters long';
        }
        break;
        
      case 'bio':
        if (value.trim() && value.trim().length > 500) {
          errors.bio = 'Bio must be 500 characters or less';
        }
        break;
    }
    
    return errors;
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate all fields
    Object.keys(profileData).forEach(field => {
      const fieldErrors = validateField(field, profileData[field]);
      Object.assign(errors, fieldErrors);
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'United States',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Real-time validation for certain fields
    if (['firstName', 'lastName', 'email', 'phone', 'zipCode', 'city', 'state', 'address', 'bio'].includes(field)) {
      const fieldErrors = validateField(field, value);
      setFormErrors(prev => ({
        ...prev,
        ...fieldErrors
      }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    // Validate form before saving
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsUpdating(true);
    try {
      // In a real app, you would call your change password API here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsUpdating(false);
    }
  };

  // Define tabs based on user role
  const getTabs = () => {
    const baseTabs = [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'security', label: 'Security', icon: Shield },
      { id: 'settings', label: 'Settings', icon: Settings }
    ];

    // Only add Orders and Wishlist for customers
    if (user?.role === 'customer') {
      return [
        ...baseTabs,
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'wishlist', label: 'Wishlist', icon: Heart }
      ];
    }

    return baseTabs;
  };

  const tabs = getTabs();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Profile - Sportify</title>
        <meta name="description" content="Manage your account settings and preferences." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* User Info */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-3" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </button>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            disabled={isUpdating}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => handleProfileChange('firstName', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${
                            formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.firstName && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => handleProfileChange('lastName', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${
                            formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.lastName && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                          disabled={!isEditing}
                          placeholder="+94-77-123-4567 or 077-123-4567"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${
                            formErrors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.phone && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={profileData.address}
                          onChange={(e) => handleProfileChange('address', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${
                            formErrors.address ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.address && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={profileData.city}
                          onChange={(e) => handleProfileChange('city', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${
                            formErrors.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.city && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          value={profileData.state}
                          onChange={(e) => handleProfileChange('state', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${
                            formErrors.state ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.state && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={profileData.zipCode}
                          onChange={(e) => handleProfileChange('zipCode', e.target.value)}
                          disabled={!isEditing}
                          placeholder="12345, 12345-6789, or ABC 123"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${
                            formErrors.zipCode ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.zipCode && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <select
                          value={profileData.country}
                          onChange={(e) => handleProfileChange('country', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => handleProfileChange('bio', e.target.value)}
                          disabled={!isEditing}
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${
                            formErrors.bio ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Tell us about yourself... (max 500 characters)"
                        />
                        {formErrors.bio && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.bio}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {profileData.bio.length}/500 characters
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                    
                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        {isUpdating ? 'Updating...' : 'Change Password'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Orders Tab - Only for customers */}
                {activeTab === 'orders' && user?.role === 'customer' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
                    
                    <Orders/>
                  </div>
                )}

                {/* Wishlist Tab - Only for customers */}
                {activeTab === 'wishlist' && user?.role === 'customer' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Wishlist</h2>
                    
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No items in wishlist</h3>
                      <p className="text-gray-600 mb-6">Save items you love for later.</p>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Browse Products
                      </button>
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Email Notifications</h3>
                          <p className="text-sm text-gray-600">Receive updates about your orders and promotions</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                          <p className="text-sm text-gray-600">Receive text messages about important updates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;