import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2, Plus, Edit, Trash2, Eye } from 'lucide-react';

const CategoryTester = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    parentCategory: ''
  });

  const testCategoryAPI = async () => {
    setLoading(true);
    const results = {
      create: false,
      read: false,
      update: false,
      delete: false,
      list: false
    };

    try {
      // Test 1: Create Category
      console.log('Testing category creation...');
      const createResponse = await axios.post('/api/categories', {
        name: 'Test Category ' + Date.now(),
        description: 'Test category description',
        image: 'https://via.placeholder.com/300x200'
      });
      
      if (createResponse.data.success) {
        results.create = true;
        const newCategory = createResponse.data.category;
        setCategories(prev => [newCategory, ...prev]);
        toast.success('Category created successfully');
      }

      // Test 2: List Categories
      console.log('Testing category listing...');
      const listResponse = await axios.get('/api/categories');
      if (listResponse.data.success) {
        results.list = true;
        setCategories(listResponse.data.categories);
        toast.success('Categories listed successfully');
      }

      // Test 3: Get Single Category
      console.log('Testing single category retrieval...');
      if (categories.length > 0) {
        const singleResponse = await axios.get(`/api/categories/${categories[0]._id}`);
        if (singleResponse.data.success) {
          results.read = true;
          toast.success('Single category retrieved successfully');
        }
      }

      // Test 4: Update Category
      console.log('Testing category update...');
      if (categories.length > 0) {
        const updateResponse = await axios.put(`/api/categories/${categories[0]._id}`, {
          name: 'Updated Test Category',
          description: 'Updated description'
        });
        if (updateResponse.data.success) {
          results.update = true;
          setCategories(prev => prev.map(category => 
            category._id === categories[0]._id ? updateResponse.data.category : category
          ));
          toast.success('Category updated successfully');
        }
      }

      // Test 5: Delete Category
      console.log('Testing category deletion...');
      if (categories.length > 0) {
        const deleteResponse = await axios.delete(`/api/categories/${categories[0]._id}`);
        if (deleteResponse.data.success) {
          results.delete = true;
          setCategories(prev => prev.filter(category => category._id !== categories[0]._id));
          toast.success('Category deleted successfully');
        }
      }

    } catch (error) {
      console.error('Category API test error:', error);
      toast.error(`Category API test failed: ${error.response?.data?.message || error.message}`);
    }

    setTestResults(results);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCategory) {
        // Update existing category
        const response = await axios.put(`/api/categories/${editingCategory._id}`, formData);
        if (response.data.success) {
          setCategories(prev => prev.map(category => 
            category._id === editingCategory._id ? response.data.category : category
          ));
          toast.success('Category updated successfully');
        }
      } else {
        // Create new category
        const response = await axios.post('/api/categories', formData);
        if (response.data.success) {
          setCategories(prev => [response.data.category, ...prev]);
          toast.success('Category created successfully');
        }
      }
      
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', image: '', parentCategory: '' });
    } catch (error) {
      console.error('Category operation error:', error);
      toast.error(`Operation failed: ${error.response?.data?.message || error.message}`);
    }

    setLoading(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image || '',
      parentCategory: category.parentCategory || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await axios.delete(`/api/categories/${categoryId}`);
      if (response.data.success) {
        setCategories(prev => prev.filter(category => category._id !== categoryId));
        toast.success('Category deleted successfully');
      }
    } catch (error) {
      console.error('Delete category error:', error);
      toast.error(`Delete failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
        toast.success('Categories loaded successfully');
      }
    } catch (error) {
      console.error('Load categories error:', error);
      toast.error(`Load failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Category Management Tester</h2>
        <div className="flex gap-2">
          <button
            onClick={loadCategories}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load Categories
          </button>
          <button
            onClick={testCategoryAPI}
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
            Add Category
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

      {/* Category Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
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
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={formData.parentCategory}
                  onChange={(e) => setFormData({...formData, parentCategory: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No Parent Category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
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
                    setEditingCategory(null);
                    setFormData({ name: '', description: '', image: '', parentCategory: '' });
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

      {/* Categories List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Categories ({categories.length})</h3>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No categories found. Click "Load Categories" or "Add Category" to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-800">{category.name}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {category.parentCategory && (
                  <div className="text-xs text-gray-500">
                    Parent: {category.parentCategory.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTester;
