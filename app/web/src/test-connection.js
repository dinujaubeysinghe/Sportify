// Test script to verify frontend-backend connection
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const testConnection = async () => {
  try {
    console.log('🧪 Testing Frontend-Backend Connection...\n');

    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check:', healthResponse.data.message);

    // 2. Test categories endpoint
    console.log('\n2. Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${API_BASE}/categories`);
    console.log('✅ Categories accessible:', categoriesResponse.data.categories?.length || 0, 'categories');

    // 3. Test brands endpoint
    console.log('\n3. Testing brands endpoint...');
    const brandsResponse = await axios.get(`${API_BASE}/brands`);
    console.log('✅ Brands accessible:', brandsResponse.data.brands?.length || 0, 'brands');

    // 4. Test products endpoint
    console.log('\n4. Testing products endpoint...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    console.log('✅ Products accessible:', productsResponse.data.products?.length || 0, 'products');

    console.log('\n🎉 Frontend-Backend connection test passed!');
    return true;

  } catch (error) {
    console.error('❌ Connection test failed:', error.response?.data || error.message);
    return false;
  }
};

export default testConnection;
