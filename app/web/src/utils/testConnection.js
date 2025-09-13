// Test script to verify frontend-backend connection
export const testConnection = async () => {
  try {
    const response = await fetch('/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });


    if (response.ok) {
      console.log('✅ Backend connection successful:', response);
      return { success: true, response };
    } else {
      console.error('❌ Backend connection failed:', response.status, response.statusText);
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    console.error('❌ Backend connection error:', error);
    return { success: false, error: error.message };
  }
};

// Test API endpoints
export const testEndpoints = async () => {
  const endpoints = [
    '/auth/me',
    '/products',
    '/categories',
    '/brands'
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      results.push({
        endpoint,
        status: response.status,
        success: response.ok,
        message: response.ok ? 'OK' : response.statusText
      });
    } catch (error) {
      results.push({
        endpoint,
        status: 'ERROR',
        success: false,
        message: error.message
      });
    }
  }

  console.log('🔍 API Endpoints Test Results:', results);
  return results;
};

// Test role-based access
export const testRoleAccess = (user) => {
  if (!user) {
    console.log('❌ No user logged in');
    return false;
  }

  const role = user.role;
  console.log(`👤 Testing access for role: ${role}`);

  const accessMatrix = {
    admin: ['/admin', '/admin/products', '/admin/orders', '/admin/users'],
    supplier: ['/supplier', '/supplier/products', '/supplier/orders', '/supplier/inventory'],
    staff: ['/staff', '/staff/orders', '/staff/support'],
    customer: ['/profile', '/orders', '/cart', '/checkout']
  };

  const allowedRoutes = accessMatrix[role] || [];
  console.log(`✅ Allowed routes for ${role}:`, allowedRoutes);
  
  return { role, allowedRoutes };
};
