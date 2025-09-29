import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  MoreVertical,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useForm } from 'react-hook-form';

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const queryClient = useQueryClient();

  // Forms
  const { register, handleSubmit, reset: resetCreate, formState: { errors: createErrors } } = useForm();
  const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEdit, formState: { errors: editErrors } } = useForm();

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery(
    'admin-products',
    async () => {
      const response = await axios.get('/products', {
        params: {
          page: 1,
          limit: 100,
          search: searchTerm,
          category: selectedCategory,
          brand: selectedBrand
        }
      });
      return response.data;
    },
    {
      enabled: true
    }
  );

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get('/brands');
        setBrands(response.data.brands || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, []);

  // Create product mutation
  const createMutation = useMutation(
    async (values) => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'images' && value && value.length) {
          for (let i = 0; i < value.length; i++) formData.append('images', value[i]);
        } else {
          formData.append(key, value);
        }
      });
      const res = await axios.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Product created');
        queryClient.invalidateQueries('admin-products');
        setShowAddModal(false);
        resetCreate();
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to create product')
    }
  );

  // Update product mutation
  const updateMutation = useMutation(
    async ({ id, values }) => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'images' && value && value.length) {
          for (let i = 0; i < value.length; i++) formData.append('images', value[i]);
        } else {
          formData.append(key, value);
        }
      });
      const res = await axios.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Product updated');
        queryClient.invalidateQueries('admin-products');
        setShowEditModal(false);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to update product')
    }
  );

  // Delete product mutation
  const deleteProductMutation = useMutation(
    async (productId) => {
      await axios.delete(`/products/${productId}`);
    },
    {
      onSuccess: () => {
        toast.success('Product deleted successfully');
        queryClient.invalidateQueries('admin-products');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  );

  // Toggle product status mutation
  const toggleStatusMutation = useMutation(
    async ({ productId, isActive }) => {
      await axios.put(`/products/${productId}`, { isActive });
    },
    {
      onSuccess: () => {
        toast.success('Product status updated');
        queryClient.invalidateQueries('admin-products');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update product');
      }
    }
  );

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleToggleStatus = (productId, currentStatus) => {
    toggleStatusMutation.mutate({ productId, isActive: !currentStatus });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    resetEdit({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?._id || product.category,
      brand: product.brand?._id || product.brand,
      stock: product.stock,
      sku: product.sku
    });
    setShowEditModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(price);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Products</h2>
          <p className="text-gray-600">{error.response?.data?.message || 'Failed to load products'}</p>
        </div>
      </div>
    );
  }

  const products = productsData?.products || [];

  return (
    <>
      <Helmet>
        <title>Manage Products - Sportify Admin</title>
        <meta name="description" content="Manage products in the Sportify e-commerce platform." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
                <p className="text-gray-600 mt-2">Add, edit, and manage your product catalog</p>
              </div>
              {/* <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </button> */}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedBrand('');
                  }}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Products ({products.length})
              </h2>
            </div>
            
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                {/* <p className="text-gray-600 mb-4">Get started by adding your first product</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Product
                </button> */}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={`${import.meta.env.VITE_SERVER_URL}${product.images[0].url || product.images[0]}`}
                                  alt={product.name}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.brand?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(product.isActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(product._id, product.isActive)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              {product.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProducts;

// Add Modal
// We append the modals at the end to avoid cluttering the main render