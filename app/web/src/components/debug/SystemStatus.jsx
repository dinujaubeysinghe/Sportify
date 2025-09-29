import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

const SystemStatus = () => {
  const [status, setStatus] = useState({
    backend: 'checking',
    endpoints: 'checking',
    auth: 'checking',
    roleAccess: 'checking'
  });
  const [results, setResults] = useState({});
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    runTests();
  }, [user, isAuthenticated]);

  // Test backend connection
  const testConnection = async () => {
    try {
      const response = await axios.get('/auth/me', {
        withCredentials: true
      });
      return { success: true, response: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Test API endpoints
  const testEndpoints = async () => {
    const endpoints = [
      { endpoint: '/categories', method: 'GET' },
      { endpoint: '/brands', method: 'GET' },
      { endpoint: '/products', method: 'GET' }
    ];

    const results = [];
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint.endpoint);
        results.push({
          endpoint: endpoint.endpoint,
          success: true,
          status: response.status,
          message: 'OK'
        });
      } catch (error) {
        results.push({
          endpoint: endpoint.endpoint,
          success: false,
          status: error.response?.status || 0,
          message: error.message
        });
      }
    }
    return results;
  };

  // Test role access
  const testRoleAccess = (user) => {
    if (!user) {
      return { role: null, allowedRoutes: [] };
    }

    const roleRoutes = {
      admin: ['/admin', '/admin/products', '/admin/orders', '/admin/users'],
      staff: ['/staff', '/staff/orders', '/staff/management', '/staff/support'],
      supplier: ['/supplier', '/supplier/products', '/supplier/orders'],
      customer: ['/profile', '/orders', '/cart']
    };

    return {
      role: user.role,
      allowedRoutes: roleRoutes[user.role] || []
    };
  };

  const runTests = async () => {
    // Test backend connection
    const backendTest = await testConnection();
    setStatus(prev => ({ ...prev, backend: backendTest.success ? 'success' : 'error' }));
    setResults(prev => ({ ...prev, backend: backendTest }));

    // Test API endpoints
    const endpointsTest = await testEndpoints();
    setStatus(prev => ({ ...prev, endpoints: 'success' }));
    setResults(prev => ({ ...prev, endpoints: endpointsTest }));

    // Test authentication
    setStatus(prev => ({ 
      ...prev, 
      auth: isAuthenticated ? 'success' : 'warning' 
    }));
    setResults(prev => ({ 
      ...prev, 
      auth: { 
        isAuthenticated, 
        user: user ? { role: user.role, email: user.email } : null 
      } 
    }));

    // Test role access
    const roleTest = testRoleAccess(user);
    setStatus(prev => ({ ...prev, roleAccess: 'success' }));
    setResults(prev => ({ ...prev, roleAccess: roleTest }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Loader className="w-5 h-5 text-gray-500 animate-spin" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Working';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      default:
        return 'Checking...';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Status</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend Connection */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Backend Connection</h3>
            {getStatusIcon(status.backend)}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {getStatusText(status.backend)}
          </p>
          {results.backend && (
            <div className="text-xs text-gray-500">
              {results.backend.success ? (
                <span className="text-green-600">✅ Connected to API server</span>
              ) : (
                <span className="text-red-600">❌ {results.backend.error}</span>
              )}
            </div>
          )}
        </div>

        {/* API Endpoints */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">API Endpoints</h3>
            {getStatusIcon(status.endpoints)}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {getStatusText(status.endpoints)}
          </p>
          {results.endpoints && (
            <div className="text-xs text-gray-500">
              {results.endpoints.filter(r => r.success).length} / {results.endpoints.length} endpoints working
            </div>
          )}
        </div>

        {/* Authentication */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Authentication</h3>
            {getStatusIcon(status.auth)}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {getStatusText(status.auth)}
          </p>
          {results.auth && (
            <div className="text-xs text-gray-500">
              {results.auth.isAuthenticated ? (
                <span className="text-green-600">
                  ✅ Logged in as {results.auth.user?.email} ({results.auth.user?.role})
                </span>
              ) : (
                <span className="text-yellow-600">⚠️ Not logged in</span>
              )}
            </div>
          )}
        </div>

        {/* Role Access */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Role Access</h3>
            {getStatusIcon(status.roleAccess)}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {getStatusText(status.roleAccess)}
          </p>
          {results.roleAccess && (
            <div className="text-xs text-gray-500">
              {results.roleAccess.role ? (
                <span className="text-green-600">
                  ✅ {results.roleAccess.allowedRoutes.length} routes available for {results.roleAccess.role}
                </span>
              ) : (
                <span className="text-gray-500">No role assigned</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Results */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Results</h3>
        
        {results.endpoints && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">API Endpoints Status:</h4>
            <div className="space-y-1">
              {results.endpoints.map((result, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{result.endpoint}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status} - {result.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.roleAccess && results.roleAccess.role && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Available Routes for {results.roleAccess.role}:</h4>
            <div className="flex flex-wrap gap-2">
              {results.roleAccess.allowedRoutes.map((route, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {route}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={runTests}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Tests
        </button>
      </div>
    </div>
  );
};

export default SystemStatus;
