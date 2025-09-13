import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,  // store file
    alt: '',
    isActive: true
  });

  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesData, isLoading, error } = useQuery(
    'admin-categories',
    async () => {
      const response = await axios.get('/categories');
      return response.data;
    }
  );

  // Create category mutation
  const createCategoryMutation = useMutation(
    async (categoryData) => {
      const response = await axios.post('/categories', categoryData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Category created successfully');
        queryClient.invalidateQueries('admin-categories');
        setShowAddModal(false);
        setFormData({ name: '', description: '', image: '', parentCategory: '' });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create category');
      }
    }
  );

  // Update category mutation
  const updateCategoryMutation = useMutation(
    async ({ categoryId, categoryData }) => {
      const response = await axios.put(`/categories/${categoryId}`, categoryData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Category updated successfully');
        queryClient.invalidateQueries('admin-categories');
        setShowEditModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', image: '', parentCategory: '' });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update category');
      }
    }
  );

  // Delete category mutation
  const deleteCategoryMutation = useMutation(
    async (categoryId) => {
      await axios.delete(`/categories/${categoryId}`);
    },
    {
      onSuccess: () => {
        toast.success('Category deleted successfully');
        queryClient.invalidateQueries('admin-categories');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("isActive", formData.isActive);
    if (formData.image) data.append("image", formData.image);
    if (formData.alt) data.append("alt", formData.alt);

    if (editingCategory) {
      updateCategoryMutation.mutate({ categoryId: editingCategory._id, categoryData: data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };


  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      parentCategory: category.parentCategory?._id || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '', parentCategory: '' });
    setShowAddModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Categories</h2>
          <p className="text-gray-600">{error.response?.data?.message || 'Failed to load categories'}</p>
        </div>
      </div>
    );
  }

  const categories = categoriesData?.categories || [];
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Manage Categories - Sportify Admin</title>
        <meta name="description" content="Manage product categories in the Sportify e-commerce platform." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
                <p className="text-gray-600 mt-2">Organize your products with categories</p>
              </div>
              <button 
                onClick={handleAddNew}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Category
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first category</p>
                <button
                  onClick={handleAddNew}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Category
                </button>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div key={category._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {category.image && (
                        <img
                          src={`${import.meta.env.VITE_SERVER_URL}/${category.image.url}`}
                          alt={category.image?.alt || categories.name}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        {category.parentCategory && (
                          <p className="text-sm text-gray-500">Parent: {category.parentCategory.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      Active
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
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
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Alt Text
                </label>
                <input
                  type="text"
                  value={formData.alt}
                  onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {createCategoryMutation.isLoading || updateCategoryMutation.isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingCategory(null);
                    setFormData({ name: '', description: '', image: '', parentCategory: '' });
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCategories;