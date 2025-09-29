import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { Package, Plus, Edit, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const SupplierProducts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  // Fetch categories and brands (for selects)
  const { data: categories } = useQuery('supplier-categories', async () => {
    const res = await axios.get('/categories');
    return res.data.categories || [];
  });

  const { data: brands } = useQuery('supplier-brands', async () => {
    const res = await axios.get('/brands');
    return res.data.brands || [];
  });

  // Fetch supplier products
  const { data: productsData, isLoading, error } = useQuery(
    ['supplier-products', user?._id, searchQuery, selectedCategory, selectedBrand],
    async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);
      // server-side supports paging; for now we fetch page 1
      const res = await axios.get(`/suppliers/${user._id}/products?${params.toString()}`);
      return res.data;
    },
    { enabled: !!user }
  );

  // Form: Add product
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const createMutation = useMutation(
    async (formValues) => {
      const formData = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        if (key === 'images' && value && value.length) {
          for (let i = 0; i < value.length; i++) formData.append('images', value[i]);
        } else {
          formData.append(key, value);
        }
      });
      const res = await axios.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      const productId = res.data.product._id;

      console.log('stock', res.data.product.stock);
      const InventoryData = {
        quantity: res.data.product.stock,
        reason: 'Adding New Product',
        cost: res.data.product.stock * res.data.product.price,
        notes: ''
      };
      const inventory = await axios.post(`/inventory/supplier/${productId}/add-stock`, InventoryData);
      console.log('inventory: ', inventory);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Product created');
        queryClient.invalidateQueries('supplier-products');
        setIsAddOpen(false);
        reset();
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to create product')
    }
  );

  // Edit
  const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEdit, formState: { errors: editErrors }, setValue } = useForm();

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
        queryClient.invalidateQueries('supplier-products');
        setIsEditOpen(false);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to update product')
    }
  );

  // Delete (soft delete)
  const deleteMutation = useMutation(
    async (id) => {
      const res = await axios.delete(`/products/${id}`);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Product deleted');
        queryClient.invalidateQueries('supplier-products');
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete product')
    }
  );

  const onSubmitCreate = (data) => {
    createMutation.mutate(data);
  };

  const onSubmitEdit = (data) => {
    if (!editingProduct) return;
    updateMutation.mutate({ id: editingProduct._id, values: data });
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    // initialize form values
    resetEdit({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?._id || product.category,
      brand: product.brand?._id || product.brand,
      stock: product.stock,
      sku: product.sku
    });
    setIsEditOpen(true);
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
      <div className="min-h-screen flex items-center justify-center text-gray-700">Failed to load products</div>
    );
  }

  const products = productsData?.products || [];

  return (
    <>
      <Helmet>
        <title>My Products - Sportify Supplier</title>
        <meta name="description" content="Manage your products on Sportify." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                <p className="text-gray-600 mt-2">Manage your product catalog</p>
              </div>
              <button onClick={() => setIsAddOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or SKU"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2 border rounded-lg">
                <option value="">All Categories</option>
                {categories?.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="px-3 py-2 border rounded-lg">
                <option value="">All Brands</option>
                {brands?.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={`${import.meta.env.VITE_SERVER_URL}${p.images?.[0]?.url || '/placeholder-product.jpg'}`} alt={p.name} className="h-10 w-10 object-cover rounded mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.category?.name || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">LKR {Number(p.price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-900 mr-3"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => deleteMutation.mutate(p._id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="py-12 text-center text-gray-600">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                No products found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Add Product</h3>
            <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input {...register('name', { required: 'Required' })} className="w-full border rounded px-3 py-2" />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input type="number" step="0.01" min="0" {...register('price', { required: 'Required' })} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select {...register('category', { required: 'Required' })} className="w-full border rounded px-3 py-2">
                    <option value="">Select</option>
                    {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <select {...register('brand', { required: 'Required' })} className="w-full border rounded px-3 py-2">
                    <option value="">Select</option>
                    {brands?.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" min="0" {...register('stock', { required: 'Required' })} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input {...register('sku', { required: 'Required' })} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} {...register('description', { required: 'Required' })} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center"><ImageIcon className="h-4 w-4 mr-2" /> Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      // Save raw FileList into form state
                      const files = e.target.files;
                      if (files?.length) {
                        // convert FileList to array for easier iteration
                        setValue("images", Array.from(files));
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" disabled={createMutation.isLoading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                  {createMutation.isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Edit Product</h3>
            <form onSubmit={handleEditSubmit(onSubmitEdit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input {...registerEdit('name', { required: 'Required' })} className="w-full border rounded px-3 py-2" />
                  {editErrors.name && <p className="text-sm text-red-600 mt-1">{editErrors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input type="number" step="0.01" min="0" {...registerEdit('price', { required: 'Required' })} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select {...registerEdit('category', { required: 'Required' })} className="w-full border rounded px-3 py-2">
                    <option value="">Select</option>
                    {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <select {...registerEdit('brand', { required: 'Required' })} className="w-full border rounded px-3 py-2">
                    <option value="">Select</option>
                    {brands?.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} {...registerEdit('description', { required: 'Required' })} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center"><ImageIcon className="h-4 w-4 mr-2" /> Add Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files?.length) {
                        setValue("images", Array.from(files));
                      }
                    }}
                  />

                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" disabled={updateMutation.isLoading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                  {updateMutation.isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SupplierProducts;
