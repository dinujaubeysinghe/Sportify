import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2, Plus, Edit, Trash2, Package, Star } from 'lucide-react';

const ProductTester = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    sku: '',
    stock: '',
    images: [],
    features: [],
    specifications: {}
  });

  useEffect(() => {
    loadCategories();
    loadBrands();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Load categories error:', error);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await axios.get('/api/brands');
      if (response.data.success) {
        setBrands(response.data.brands);
      }
    } catch (error) {
      console.error('Load brands error:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Load products error:', error);
    }
  };

  const testProductAPI = async () => {
    setLoading(true);
    const results = {
      create: false,
      read: false,
      update: false,
      delete: false,
      list: false,
      categories: false,
      brands: false
    };

    try {
      // Test 1: Get Categories and Brands
      console.log('Testing categories and brands...');
      const [catResponse, brandResponse] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/brands')
      ]);
      
      if (catResponse.data.success) {
        results.categories = true;
        setCategories(catResponse.data.categories);
      }
      if (brandResponse.data.success) {
        results.brands = true;
        setBrands(brandResponse.data.brands);
      }

      // Test 2: Create Product
      console.log('Testing product creation...');
      const createResponse = await axios.post('/api/products', {
        name: 'Test Product ' + Date.now(),
        description: 'Test product description',
        price: 99.99,
        category: categories[0]?._id || 'test-category',
        brand: brands[0]?._id || 'test-brand',
        sku: 'TEST-' + Date.now(),
        stock: 100,
        images: ['https://via.placeholder.com/300x300'],
        features: ['Feature 1', 'Feature 2'],
        specifications: {
          weight: '1kg',
          dimensions: '10x10x10cm'
        }
      });
      
      if (createResponse.data.success) {
        results.create = true;
        const newProduct = createResponse.data.product;
        setProducts(prev => [newProduct, ...prev]);
        toast.success('Product created successfully');
      }

      // Test 3: List Products
      console.log('Testing product listing...');
      const listResponse = await axios.get('/api/products');
      if (listResponse.data.success) {
        results.list = true;
        setProducts(listResponse.data.products);
        toast.success('Products listed successfully');
      }

      // Test 4: Get Single Product
      console.log('Testing single product retrieval...');
      if (products.length > 0) {
        const singleResponse = await axios.get(`/api/products/${products[0]._id}`);
        if (singleResponse.data.success) {
          results.read = true;
          toast.success('Single product retrieved successfully');
        }
      }

      // Test 5: Update Product
      console.log('Testing product update...');
      if (products.length > 0) {
        const updateResponse = await axios.put(`/api/products/${products[0]._id}`, {
          name: 'Updated Test Product',
          description: 'Updated description',
          price: 149.99
        });
        if (updateResponse.data.success) {
          results.update = true;
          setProducts(prev => prev.map(product => 
            product._id === products[0]._id ? updateResponse.data.product : product
          ));
          toast.success('Product updated successfully');
        }
      }

      // Test 6: Delete Product
      console.log('Testing product deletion...');
      if (products.length > 0) {
        const deleteResponse = await axios.delete(`/api/products/${products[0]._id}`);
        if (deleteResponse.data.success) {
          results.delete = true;
          setProducts(prev => prev.filter(product => product._id !== products[0]._id));
          toast.success('Product deleted successfully');
        }
      }

    } catch (error) {
      console.error('Product API test error:', error);
      toast.error(`Product API test failed: ${error.response?.data?.message || error.message}`);
    }

    setTestResults(results);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: formData.images.filter(img => img.trim() !== ''),
        features: formData.features.filter(feature => feature.trim() !== '')
      };

      if (editingProduct) {
        // Update existing product
        const response = await axios.put(`/api/products/${editingProduct._id}`, productData);
        if (response.data.success) {
          setProducts(prev => prev.map(product => 
            product._id === editingProduct._id ? response.data.product : product
          ));
          toast.success('Product updated successfully');
        }
      } else {
        // Create new product
        const response = await axios.post('/api/products', productData);
        if (response.data.success) {
          setProducts(prev => [response.data.product, ...prev]);
          toast.success('Product created successfully');
        }
      }
      
      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        brand: '',
        sku: '',
        stock: '',
        images: [],
        features: [],
        specifications: {}
      });
    } catch (error) {
      console.error('Product operation error:', error);
      toast.error(`Operation failed: ${error.response?.data?.message || error.message}`);
    }

    setLoading(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category?._id || '',
      brand: product.brand?._id || '',
      sku: product.sku,
      stock: product.stock.toString(),
      images: product.images || [],
      features: product.features || [],
      specifications: product.specifications || {}
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await axios.delete(`/api/products/${productId}`);
      if (response.data.success) {
        setProducts(prev => prev.filter(product => product._id !== productId));
        toast.success('Product deleted successfully');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error(`Delete failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const updateImage = (index, value) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Product Management Tester</h2>
        <div className="flex gap-2">
          <button
            onClick={loadProducts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load Products
          </button>
          <button
            onClick={testProductAPI}
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
            Add Product
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        {Object.entries(testResults).map(([test, passed]) => (
          <div key={test} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
            {passed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium capitalize text-sm">{test}</span>
          </div>
        ))}
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
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
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
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
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images
                </label>
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => updateImage(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Image URL"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Add Image
                </button>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features
                </label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Feature description"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Add Feature
                </button>
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
                    setEditingProduct(null);
                    setFormData({
                      name: '',
                      description: '',
                      price: '',
                      category: '',
                      brand: '',
                      sku: '',
                      stock: '',
                      images: [],
                      features: [],
                      specifications: {}
                    });
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

      {/* Products List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Products ({products.length})</h3>
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No products found. Click "Load Products" or "Add Product" to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {product.images && product.images.length > 0 && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold text-green-600">${product.price}</span>
                        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        SKU: {product.sku}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {product.category?.name && <span>Category: {product.category.name}</span>}
                  {product.brand?.name && <span className="ml-2">Brand: {product.brand.name}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTester;
