import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  FolderPlus, 
  Edit, 
  Trash2, 
  Search, 
  Plus,
  Folder,
  Package,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const CategoryManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery(
    ['categories', searchQuery],
    async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await axios.get(`/admin/categories?${params.toString()}`);
      return response.data;
    }
  );

  // Category form
  const {
    register: registerCategory,
    handleSubmit: handleCategorySubmit,
    formState: { errors: categoryErrors },
    reset: resetCategory,
    setValue: setCategoryValue
  } = useForm();

  // Create/Update category mutation
  const categoryMutation = useMutation(
    async (data) => {
      if (editingCategory) {
        return axios.put(`/admin/categories/${editingCategory._id}`, data);
      } else {
        return axios.post('/admin/categories', data);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        setShowModal(false);
        setEditingCategory(null);
        resetCategory();
        toast.success(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to save category');
      }
    }
  );

  // Delete category mutation
  const deleteMutation = useMutation(
    async (categoryId) => {
      return axios.delete(`/admin/categories/${categoryId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        toast.success('Category deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  );

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryValue('name', category.name);
    setCategoryValue('description', category.description);
    setCategoryValue('parentCategory', category.parentCategory?._id || '');
    setCategoryValue('isActive', category.isActive);
    setShowModal(true);
  };

  const handleDelete = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      deleteMutation.mutate(categoryId);
    }
  };

  const onCategorySubmit = (data) => {
    categoryMutation.mutate(data);
  };

  const toggleExpanded = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const buildCategoryTree = (categories, parentId = null) => {
    return categories
      .filter(cat => cat.parentCategory?._id === parentId)
      .map(category => ({
        ...category,
        children: buildCategoryTree(categories, category._id)
      }));
  };

  const renderCategoryTree = (categories, level = 0) => {
    return categories.map((category) => (
      <div key={category._id} className="ml-4">
        <div className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2 ${
          level === 0 ? 'bg-gray-50' : 'bg-white'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {category.children && category.children.length > 0 && (
                <button
                  onClick={() => toggleExpanded(category._id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {expandedCategories.has(category._id) ? (
                    <EyeOff className="h-4 w-4 text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              )}
              <Folder className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-xs text-gray-500">
                  {category.productCount || 0} products
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  category.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEdit(category)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Edit Category"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(category._id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete Category"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {expandedCategories.has(category._id) && category.children && (
          <div className="ml-4">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const categoryTree = buildCategoryTree(categoriesData?.categories || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
          <p className="text-gray-600 mt-1">Organize your products into categories and subcategories</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            resetCategory();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Categories Tree */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          {categoryTree.length > 0 ? (
            <div className="space-y-2">
              {renderCategoryTree(categoryTree)}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? 'No categories match your search criteria.'
                  : 'Get started by creating your first category.'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    resetCategory();
                    setShowModal(true);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Category
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>

              <form onSubmit={handleCategorySubmit(onCategorySubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    {...registerCategory('name', { required: 'Category name is required' })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter category name"
                  />
                  {categoryErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{categoryErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...registerCategory('description')}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter category description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <select
                    {...registerCategory('parentCategory')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No parent (root category)</option>
                    {categoriesData?.categories
                      ?.filter(cat => !editingCategory || cat._id !== editingCategory._id)
                      ?.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    {...registerCategory('isActive')}
                    type="checkbox"
                    id="isActive"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={categoryMutation.isLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {categoryMutation.isLoading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingCategory(null);
                      resetCategory();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
