import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Save,
  X,
  Package,
  Star,
  DollarSign,
  Tag
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminProductsManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    subcategory: '',
    sku: '',
    stock: '',
    minStockLevel: '5',
    weight: { value: '', unit: 'kg' },
    dimensions: { length: '', width: '', height: '', unit: 'cm' },
    colors: [],
    sizes: [],
    tags: [],
    isActive: true,
    isFeatured: false,
    discount: '0',
    images: []
  });

  const queryClient = useQueryClient();

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const response = await axios.get('/api/products?limit=100');
      return response.data;
    }
  });

  // Fetch categories and brands
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get('/api/categories');
      return response.data;
    }
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await axios.get('/api/brands');
      return response.data;
    }
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'images' && formData[key].length > 0) {
          formData[key].forEach((file, index) => {
            data.append('images', file);
          });
        } else if (key === 'colors' || key === 'sizes' || key === 'tags') {
          data.append(key, JSON.stringify(formData[key]));
        } else if (key === 'weight' || key === 'dimensions') {
          data.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      const response = await axios.post('/api/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast.success('Product created successfully!');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    }
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'images' && formData[key].length > 0) {
          formData[key].forEach((file, index) => {
            data.append('images', file);
          });
        } else if (key === 'colors' || key === 'sizes' || key === 'tags') {
          data.append(key, JSON.stringify(formData[key]));
        } else if (key === 'weight' || key === 'dimensions') {
          data.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      const response = await axios.put(`/api/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast.success('Product updated successfully!');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(`/api/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast.success('Product deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      brand: '',
      subcategory: '',
      sku: '',
      stock: '',
      minStockLevel: '5',
      weight: { value: '', unit: 'kg' },
      dimensions: { length: '', width: '', height: '', unit: 'cm' },
      colors: [],
      tags: [],
      isActive: true,
      isFeatured: false,
      discount: '0',
      images: []
    });
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.category || !formData.brand) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category?._id || '',
      brand: product.brand?._id || '',
      subcategory: product.subcategory || '',
      sku: product.sku || '',
      stock: product.stock?.toString() || '',
      minStockLevel: product.minStockLevel?.toString() || '5',
      weight: product.weight || { value: '', unit: 'kg' },
      dimensions: product.dimensions || { length: '', width: '', height: '', unit: 'cm' },
      colors: product.colors || [],
      sizes: product.sizes || [],
      tags: product.tags || [],
      isActive: product.isActive !== false,
      isFeatured: product.isFeatured || false,
      discount: product.discount?.toString() || '0',
      images: []
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, images: files }));
  };

  const addArrayItem = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Filter products
  const filteredProducts = productsData?.products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || product.category?._id === filterCategory;
    const matchesBrand = filterBrand === 'all' || product.brand?._id === filterBrand;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && product.isActive) ||
                         (filterStatus === 'inactive' && !product.isActive) ||
                         (filterStatus === 'featured' && product.isFeatured);
    
    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600">Manage all products in the system</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {categoriesData?.categories?.map(category => (
            <option key={category._id} value={category._id}>{category.name}</option>
          ))}
        </select>

        <select
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Brands</option>
          {brandsData?.brands?.map(brand => (
            <option key={brand._id} value={brand._id}>{brand.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="featured">Featured</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Product Image */}
            <div className="h-48 bg-gray-100 flex items-center justify-center relative">
              {product.images?.[0]?.url ? (
                <img
                  src={product.images[0].url}
                  alt={product.images[0].alt || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400" />
              )}
              
              {/* Status badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isFeatured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Featured
                  </span>
                )}
                {!product.isActive && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Inactive
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {product.name}
              </h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SKU:</span>
                  <span className="text-sm font-mono text-gray-900">{product.sku}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <div className="flex items-center gap-2">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-gray-900">
                      ${product.price}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <span className={`text-sm font-semibold ${
                    product.stock <= product.minStockLevel 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {product.stock}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{product.category?.name || 'No Category'}</span>
                <div className="flex gap-2">
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
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Get started by creating your first product.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Enter product description"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Original Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select Category</option>
                          {categoriesData?.categories?.map(category => (
                            <option key={category._id} value={category._id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Brand *
                        </label>
                        <select
                          value={formData.brand}
                          onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select Brand</option>
                          {brandsData?.brands?.map(brand => (
                            <option key={brand._id} value={brand._id}>{brand.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Inventory & Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Inventory & Details</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU *
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="PRODUCT-SKU-001"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock *
                        </label>
                        <input
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Stock Level
                        </label>
                        <input
                          type="number"
                          value={formData.minStockLevel}
                          onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subcategory
                      </label>
                      <input
                        type="text"
                        value={formData.subcategory}
                        onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter subcategory"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Images
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.images.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          Selected: {formData.images.length} file(s)
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Featured</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      editingProduct ? 'Update Product' : 'Create Product'
                    )}
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

export default AdminProductsManagement;
