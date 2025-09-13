import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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
  X
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminBrands = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    logo: null
  });

  const queryClient = useQueryClient();

  // Fetch brands
  const { data: brandsData, isLoading } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const response = await axios.get('/brands');
      return response.data;
    }
  });

  // Create brand mutation
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.logo) {
        data.append('logo', formData.logo);
      }

      const response = await axios.post('/brands', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-brands']);
      toast.success('Brand created successfully!');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create brand');
    }
  });

  // Update brand mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.logo) {
        data.append('logo', formData.logo);
      }

      const response = await axios.put(`/brands/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-brands']);
      toast.success('Brand updated successfully!');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update brand');
    }
  });

  // Delete brand mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(`/brands/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-brands']);
      toast.success('Brand deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete brand');
    }
  });

  const resetForm = () => {
    setFormData({ name: '', logo: null });
    setEditingBrand(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand._id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo: null
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
    }
  };

  // Filter brands
  const filteredBrands = brandsData?.brands?.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterActive === 'active') return matchesSearch && brand.isActive;
    if (filterActive === 'inactive') return matchesSearch && !brand.isActive;
    return matchesSearch;
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
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600">Manage product brands</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Brand
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Brands</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBrands.map((brand) => (
          <div key={brand._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Brand Logo */}
            <div className="h-32 bg-gray-100 flex items-center justify-center p-4">
              {brand.logo?.url ? (
                <img
                  src={`${import.meta.env.VITE_SERVER_URL}/${brand.logo.url}`}
                  alt={brand.logo.alt || brand.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-500">No Logo</span>
                </div>
              )}
            </div>

            {/* Brand Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{brand.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${
                  brand.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {brand.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Created: {new Date(brand.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
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
            </div>
          </div>
        ))}
      </div>

      {filteredBrands.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
          <p className="text-gray-600">Get started by creating your first brand.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingBrand ? 'Edit Brand' : 'Add Brand'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter brand name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {formData.logo && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {formData.logo.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
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
                      editingBrand ? 'Update' : 'Create'
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

export default AdminBrands;
