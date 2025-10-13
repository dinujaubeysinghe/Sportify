import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form'; 
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Image as ImageIcon,
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
  
  const [logoFile, setLogoFile] = useState(null); 
  
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    mode: 'onChange', 
    defaultValues: { name: '' }
  });
  
  const watchedLogo = watch('logo'); 
  
  // Fetch brands
  const { data: brandsData, isLoading } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const response = await axios.get('/brands');
      return response.data;
    }
  });

  // Helper function to process form data into FormData object
  const createFormData = (data, logoFileObject) => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (logoFileObject) {
      formData.append('logo', logoFileObject);
    }
    return formData;
  };

  // Create brand mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const formData = createFormData(data, logoFile);
      
      const response = await axios.post('/brands', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-brands']);
      toast.success('Brand created successfully! 🎉');
      closeModalAndResetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create brand');
    }
  });

  // Update brand mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const formData = createFormData(data, logoFile);
      
      const response = await axios.put(`/brands/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-brands']);
      toast.success('Brand updated successfully! ✅');
      closeModalAndResetForm();
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
      toast.success('Brand deleted successfully! 🗑️');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete brand');
    }
  });

  // Activate brand handler
  const handleActivate = async (id) => {
    try {
      await axios.put(`/brands/activate/${id}`);
      toast.success('Brand activated successfully! ✨');
      queryClient.invalidateQueries(['admin-brands']);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate brand');
    }
  };


  const closeModalAndResetForm = () => {
    reset({ name: '' }); 
    setLogoFile(null); 
    setEditingBrand(null);
    setIsModalOpen(false);
  };
  
  const onSubmit = (data) => {
    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    reset({ name: brand.name }); 
    setLogoFile(null); 
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
      setLogoFile(file);
      setValue('logo', file); 
    } else {
      setLogoFile(null);
      setValue('logo', null); 
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

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600">Manage product brands</p>
        </div>
        <button
          onClick={() => {
            closeModalAndResetForm(); 
            setIsModalOpen(true);
          }}
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
                    title="Edit Brand"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                    
                  {/* Action Button: Delete (if active) or Activate (if inactive) */}
                  {brand.isActive ? (
                    <button
                      onClick={() => handleDelete(brand._id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Delete/Deactivate Brand"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(brand._id)}
                      className="px-2 py-1 text-xs text-green-600 hover:bg-green-100 rounded"
                      title="Activate Brand"
                    >
                      Activate
                    </button>
                  )}
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
                  onClick={closeModalAndResetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    maxLength={20} 
                    {...register('name', {
                      required: 'Brand name is required',
                      minLength: { value: 2, message: 'Must be at least 2 characters' },
                      maxLength: { value: 20, message: 'Must be less than 20 characters' }
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter brand name"
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Logo
                  </label>
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"

                    onChange={handleLogoChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  
                  {/* Display existing logo or selected file name */}
                  {(editingBrand?.logo?.url && !logoFile) && (
                    <p className="text-sm text-gray-600 mt-1">
                      Current Logo: <span className='font-semibold text-blue-600'>({editingBrand.logo.alt || 'Existing file'})</span>
                    </p>
                  )}
                  {logoFile && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: <span className='font-semibold text-green-600'>{logoFile.name}</span>
                    </p>
                  )}
                  {errors.logo && <p className="text-sm text-red-600 mt-1">{errors.logo.message}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModalAndResetForm}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    {isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        {editingBrand ? 'Update' : 'Create'}
                      </>
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