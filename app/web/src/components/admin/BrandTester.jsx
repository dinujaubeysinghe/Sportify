import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2, Plus, Edit, Trash2, Eye } from 'lucide-react';

const BrandTester = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    logo: ''
  });

  const testBrandAPI = async () => {
    setLoading(true);
    const results = {
      create: false,
      read: false,
      update: false,
      delete: false,
      list: false
    };

    try {
      // Test 1: Create Brand
      console.log('Testing brand creation...');
      const createResponse = await axios.post('/api/brands', {
        name: 'Test Brand ' + Date.now(),
        description: 'Test brand description',
        website: 'https://testbrand.com',
        logo: 'https://via.placeholder.com/150'
      });
      
      if (createResponse.data.success) {
        results.create = true;
        const newBrand = createResponse.data.brand;
        setBrands(prev => [newBrand, ...prev]);
        toast.success('Brand created successfully');
      }

      // Test 2: List Brands
      console.log('Testing brand listing...');
      const listResponse = await axios.get('/api/brands');
      if (listResponse.data.success) {
        results.list = true;
        setBrands(listResponse.data.brands);
        toast.success('Brands listed successfully');
      }

      // Test 3: Get Single Brand
      console.log('Testing single brand retrieval...');
      if (brands.length > 0) {
        const singleResponse = await axios.get(`/api/brands/${brands[0]._id}`);
        if (singleResponse.data.success) {
          results.read = true;
          toast.success('Single brand retrieved successfully');
        }
      }

      // Test 4: Update Brand
      console.log('Testing brand update...');
      if (brands.length > 0) {
        const updateResponse = await axios.put(`/api/brands/${brands[0]._id}`, {
          name: 'Updated Test Brand',
          description: 'Updated description',
          website: 'https://updatedtestbrand.com'
        });
        if (updateResponse.data.success) {
          results.update = true;
          setBrands(prev => prev.map(brand => 
            brand._id === brands[0]._id ? updateResponse.data.brand : brand
          ));
          toast.success('Brand updated successfully');
        }
      }

      // Test 5: Delete Brand
      console.log('Testing brand deletion...');
      if (brands.length > 0) {
        const deleteResponse = await axios.delete(`/api/brands/${brands[0]._id}`);
        if (deleteResponse.data.success) {
          results.delete = true;
          setBrands(prev => prev.filter(brand => brand._id !== brands[0]._id));
          toast.success('Brand deleted successfully');
        }
      }

    } catch (error) {
      console.error('Brand API test error:', error);
      toast.error(`Brand API test failed: ${error.response?.data?.message || error.message}`);
    }

    setTestResults(results);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingBrand) {
        // Update existing brand
        const response = await axios.put(`/api/brands/${editingBrand._id}`, formData);
        if (response.data.success) {
          setBrands(prev => prev.map(brand => 
            brand._id === editingBrand._id ? response.data.brand : brand
          ));
          toast.success('Brand updated successfully');
        }
      } else {
        // Create new brand
        const response = await axios.post('/api/brands', formData);
        if (response.data.success) {
          setBrands(prev => [response.data.brand, ...prev]);
          toast.success('Brand created successfully');
        }
      }
      
      setShowForm(false);
      setEditingBrand(null);
      setFormData({ name: '', description: '', website: '', logo: '' });
    } catch (error) {
      console.error('Brand operation error:', error);
      toast.error(`Operation failed: ${error.response?.data?.message || error.message}`);
    }

    setLoading(false);
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description,
      website: brand.website,
      logo: brand.logo
    });
    setShowForm(true);
  };

  const handleDelete = async (brandId) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;

    try {
      const response = await axios.delete(`/api/brands/${brandId}`);
      if (response.data.success) {
        setBrands(prev => prev.filter(brand => brand._id !== brandId));
        toast.success('Brand deleted successfully');
      }
    } catch (error) {
      console.error('Delete brand error:', error);
      toast.error(`Delete failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await axios.get('/api/brands');
      if (response.data.success) {
        setBrands(response.data.brands);
        toast.success('Brands loaded successfully');
      }
    } catch (error) {
      console.error('Load brands error:', error);
      toast.error(`Load failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Brand Management Tester</h2>
        <div className="flex gap-2">
          <button
            onClick={loadBrands}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load Brands
          </button>
          <button
            onClick={testBrandAPI}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test API'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Brand
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {Object.entries(testResults).map(([test, passed]) => (
          <div key={test} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
            {passed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium capitalize">{test}</span>
          </div>
        ))}
      </div>

      {/* Brand Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({...formData, logo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBrand(null);
                    setFormData({ name: '', description: '', website: '', logo: '' });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brands List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Brands ({brands.length})</h3>
        {brands.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No brands found. Click "Load Brands" or "Add Brand" to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <div key={brand._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {brand.logo && (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-800">{brand.name}</h4>
                      <p className="text-sm text-gray-600">{brand.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(brand)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand._id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandTester;
