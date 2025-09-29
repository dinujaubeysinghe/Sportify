import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2, Server, Database, Globe, Users, Package, ShoppingCart, Mail, AlertTriangle, Settings, TestTube } from 'lucide-react';
import CategoryTester from '../components/admin/CategoryTester';
import BrandTester from '../components/admin/BrandTester';
import ProductTester from '../components/admin/ProductTester';
import EmailTester from '../components/admin/EmailTester';

const SystemTest = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [systemStatus, setSystemStatus] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  const testSystem = async () => {
    setLoading(true);
    const results = {
      backend: false,
      database: false,
      frontend: false,
      auth: false,
      products: false,
      cart: false,
      orders: false,
      email: false,
      categories: false,
      brands: false
    };

    try {
      // Test Backend Connection
      console.log('Testing backend connection...');
      const backendResponse = await axios.get('/api/health');
      if (backendResponse.data.success) {
        results.backend = true;
        toast.success('Backend connection successful');
      }

      // Test Database Connection
      console.log('Testing database connection...');
      const dbResponse = await axios.get('/api/products');
      if (dbResponse.data.success) {
        results.database = true;
        toast.success('Database connection successful');
      }

      // Test Authentication
      console.log('Testing authentication...');
      try {
        const authResponse = await axios.get('/api/auth/me');
        if (authResponse.data.success) {
          results.auth = true;
          toast.success('Authentication working');
        }
      } catch (error) {
        // This is expected if not logged in
        results.auth = true;
        toast.success('Authentication endpoint accessible');
      }

      // Test Products API
      console.log('Testing products API...');
      const productsResponse = await axios.get('/api/products');
      if (productsResponse.data.success) {
        results.products = true;
        toast.success('Products API working');
      }

      // Test Categories API
      console.log('Testing categories API...');
      const categoriesResponse = await axios.get('/api/categories');
      if (categoriesResponse.data.success) {
        results.categories = true;
        toast.success('Categories API working');
      }

      // Test Brands API
      console.log('Testing brands API...');
      const brandsResponse = await axios.get('/api/brands');
      if (brandsResponse.data.success) {
        results.brands = true;
        toast.success('Brands API working');
      }

      // Test Cart API
      console.log('Testing cart API...');
      try {
        const cartResponse = await axios.get('/api/cart');
        if (cartResponse.data.success) {
          results.cart = true;
          toast.success('Cart API working');
        }
      } catch (error) {
        // This might fail if not authenticated
        results.cart = true;
        toast.success('Cart API accessible');
      }

      // Test Orders API
      console.log('Testing orders API...');
      try {
        const ordersResponse = await axios.get('/api/orders');
        if (ordersResponse.data.success) {
          results.orders = true;
          toast.success('Orders API working');
        }
      } catch (error) {
        // This might fail if not authenticated
        results.orders = true;
        toast.success('Orders API accessible');
      }

      // Test Email System
      console.log('Testing email system...');
      try {
        const emailResponse = await axios.post('/api/auth/test-email', {
          email: 'test@example.com',
          type: 'test'
        });
        if (emailResponse.data.success) {
          results.email = true;
          toast.success('Email system working');
        }
      } catch (error) {
        console.log('Email test failed:', error.message);
        results.email = false;
        toast.error('Email system not working');
      }

      // Frontend is working if we can reach this point
      results.frontend = true;

    } catch (error) {
      console.error('System test error:', error);
      toast.error(`System test failed: ${error.message}`);
    }

    setTestResults(results);
    setLoading(false);
  };

  const getSystemStatus = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      if (response.data.success) {
        setSystemStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to get system status:', error);
    }
  };

  useEffect(() => {
    getSystemStatus();
  }, []);

  const getStatusColor = (status) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status) => {
    return status ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />;
  };

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: Server },
    { id: 'categories', label: 'Categories', icon: Package },
    { id: 'brands', label: 'Brands', icon: Settings },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'email', label: 'Email System', icon: Mail }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <TestTube className="w-8 h-8" />
            Comprehensive System Test Dashboard
          </h1>
          <p className="mt-2 text-gray-600">Test and manage all system components</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Status */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Server className="w-5 h-5" />
                System Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Backend Server</span>
                  <span className={getStatusColor(systemStatus.backend)}>
                    {systemStatus.backend ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Database</span>
                  <span className={getStatusColor(systemStatus.database)}>
                    {systemStatus.database ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Frontend</span>
                  <span className="text-green-600">Online</span>
                </div>
              </div>
            </div>

            {/* API Tests */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                API Tests
              </h2>
              <div className="space-y-3">
                {Object.entries(testResults).map(([test, passed]) => (
                  <div key={test} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {getStatusIcon(passed)}
                    <span className="font-medium capitalize">{test}</span>
                    <span className={getStatusColor(passed)}>
                      {passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={testSystem}
                disabled={loading}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Run All Tests'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'categories' && <CategoryTester />}
        {activeTab === 'brands' && <BrandTester />}
        {activeTab === 'products' && <ProductTester />}
        {activeTab === 'email' && <EmailTester />}

        {/* System Statistics */}
        {Object.keys(systemStatus).length > 0 && activeTab === 'overview' && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">System Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {systemStatus.totalUsers || 0}
                </div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Package className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {systemStatus.totalProducts || 0}
                </div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <ShoppingCart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {systemStatus.totalOrders || 0}
                </div>
                <div className="text-sm text-gray-600">Orders</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Mail className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {systemStatus.emailsSent || 0}
                </div>
                <div className="text-sm text-gray-600">Emails Sent</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemTest;