import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff, Mail, Lock, User, Building, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('customer');
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on user role
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'supplier') {
        navigate('/supplier', { replace: true });
      } else if (user.role === 'staff') {
        navigate('/staff', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      // Get the actual user role from the response
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Validate that the selected role matches the user's actual role
      if (selectedRole !== user.role) {
        // Auto-correct the role selection and show helpful message
        setSelectedRole(user.role);
        toast.success(`Account type corrected to ${user.role}. Logging you in...`);
        
        // Continue with the login process after correcting the role
        setTimeout(() => {
          // Redirect based on user role
          if (user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else if (user.role === 'supplier') {
            navigate('/supplier', { replace: true });
          } else if (user.role === 'staff') {
            navigate('/staff', { replace: true });
          } else {
            navigate(from, { replace: true });
          }
        }, 1000);
        return;
      }
      
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'supplier') {
        navigate('/supplier', { replace: true });
      } else if (user.role === 'staff') {
        navigate('/staff', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Login - Sportify</title>
        <meta name="description" content="Sign in to your Sportify account to access your orders, wishlist, and more." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                create a new account
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'customer', label: 'Customer', icon: User, color: 'blue' },
                    { value: 'supplier', label: 'Supplier', icon: Building, color: 'purple' },
                    { value: 'staff', label: 'Staff', icon: Users, color: 'green' }
                  ].map((role) => {
                    const IconComponent = role.icon;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setSelectedRole(role.value)}
                        className={`p-3 text-sm font-medium rounded-lg border flex flex-col items-center space-y-1 ${
                          selectedRole === role.value
                            ? `border-${role.color}-500 bg-${role.color}-50 text-${role.color}-700`
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{role.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Select the account type that matches your registration. If you select the wrong type, we'll automatically correct it for you.
                </p>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    autoComplete="email"
                    className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="appearance-none rounded-lg relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedRole === 'customer' 
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    : selectedRole === 'supplier'
                    ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                )}
              </button>
            </div>

            {/* Role Information Panel */}
            <div className={`mt-6 p-4 rounded-lg ${
              selectedRole === 'customer' 
                ? 'bg-blue-50'
                : selectedRole === 'supplier'
                ? 'bg-purple-50'
                : 'bg-green-50'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {selectedRole === 'customer' && <User className="h-5 w-5 text-blue-400" />}
                  {selectedRole === 'supplier' && <Building className="h-5 w-5 text-purple-400" />}
                  {selectedRole === 'staff' && <Users className="h-5 w-5 text-green-400" />}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    selectedRole === 'customer' 
                      ? 'text-blue-800'
                      : selectedRole === 'supplier'
                      ? 'text-purple-800'
                      : 'text-green-800'
                  }`}>
                    {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Access Information
                  </h3>
                  <div className={`mt-2 text-sm ${
                    selectedRole === 'customer' 
                      ? 'text-blue-700'
                      : selectedRole === 'supplier'
                      ? 'text-purple-700'
                      : 'text-green-700'
                  }`}>
                    <p>
                      {selectedRole === 'customer' && 'Customer accounts provide access to:'}
                      {selectedRole === 'supplier' && 'Supplier accounts provide access to:'}
                      {selectedRole === 'staff' && 'Staff accounts provide access to:'}
                    </p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      {selectedRole === 'customer' && (
                        <>
                          <li>Shopping cart and wishlist</li>
                          <li>Order history and tracking</li>
                          <li>Product reviews and ratings</li>
                          <li>Account settings and preferences</li>
                        </>
                      )}
                      {selectedRole === 'supplier' && (
                        <>
                          <li>Product management and listing</li>
                          <li>Order fulfillment and tracking</li>
                          <li>Inventory management</li>
                          <li>Sales analytics and reports</li>
                        </>
                      )}
                      {selectedRole === 'staff' && (
                        <>
                          <li>Order management and processing</li>
                          <li>Customer support tools</li>
                          <li>Inventory assistance</li>
                          <li>Staff dashboard and reports</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
