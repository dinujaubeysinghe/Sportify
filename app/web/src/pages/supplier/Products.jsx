import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form'; 
import { Helmet } from 'react-helmet-async';
import { Package, Plus, Edit, Trash2, Search, Image as ImageIcon, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const FormInput = ({ label, name, register, errors, type = 'text', rules, ...props }) => {
    const maxLengthValue = rules?.maxLength?.value; 

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                id={name}
                type={type}
                maxLength={maxLengthValue} 
                {...register(name, rules)}
                {...props}
                className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors[name] && <p className="text-sm text-red-600 mt-1">{errors[name].message}</p>}
        </div>
    );
};

const FormTextarea = ({ label, name, register, errors, rules, ...props }) => {
    const maxLengthValue = rules?.maxLength?.value; 

    return (
        <div className="md:col-span-2">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
                id={name}
                maxLength={maxLengthValue}
                {...register(name, rules)}
                {...props}
                className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors[name] && <p className="text-sm text-red-600 mt-1">{errors[name].message}</p>}
        </div>
    );
};

const FormSelect = ({ label, name, register, errors, rules, children, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            id={name}
            {...register(name, rules)}
            {...props}
            className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
        >
            {children}
        </select>
        {errors[name] && <p className="text-sm text-red-600 mt-1">{errors[name].message}</p>}
    </div>
);


const SupplierProducts = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const { data: categories } = useQuery('supplier-categories', async () => (await axios.get('/categories')).data.categories || []);
    const { data: brands } = useQuery('supplier-brands', async () => (await axios.get('/brands')).data.brands || []);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300); // Wait for 300ms after user stops typing to trigger the search

        // Cleanup function to clear the timer if the user types again
        return () => {
            clearTimeout(timerId);
        };
    }, [searchQuery]);

const { data: productsData, isLoading, isError } = useQuery(
        // ✨ CHANGED: Use the debounced search query in the query key
        ['supplier-products', user?._id, debouncedSearchQuery, selectedCategory, selectedBrand],
        async () => {
            // ✨ CHANGED: Use the debounced search query for the API call
            const params = new URLSearchParams({ search: debouncedSearchQuery, page: 1 });
            if (selectedCategory) params.append('category', selectedCategory);
            if (selectedBrand) params.append('brand', selectedBrand);
            const res = await axios.get(`/suppliers/${user._id}/products?${params.toString()}`);
            return res.data;
        },
        { enabled: !!user }
    );

    

    const processFormData = (data) => {
        const formData = new FormData();
        const toArray = (value) => (value && typeof value === 'string') ? value.split(',').map(item => item.trim()).filter(Boolean) : value || [];


        Object.entries(data).forEach(([key, value]) => {
            if (key === 'images' && value instanceof FileList) {
                for (let i = 0; i < value.length; i++) {
                    formData.append('images', value[i]);
                }
            } else if (['colors', 'sizes', 'tags'].includes(key)) {
                toArray(value).forEach(item => formData.append(`${key}[]`, item));
            }
            else if (typeof value === 'object' && value !== null && !(value instanceof FileList)) {
                Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                    if (nestedValue || nestedValue === 0) { 
                         formData.append(`${key}[${nestedKey}]`, nestedValue);
                    }
                });
            } else if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });
        return formData;
    };

    const { mutate: createProduct, isLoading: isCreating } = useMutation(
        async (data) => {
            const formData = processFormData(data);
            const res = await axios.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
        {
            onSuccess: () => {
                toast.success('Product created successfully! 🎉');
                queryClient.invalidateQueries('supplier-products');
                setIsAddOpen(false);
            },
            onError: (err) => toast.error(err.response?.data?.message || 'Failed to create product'),
        }
    );

    const { mutate: updateProduct, isLoading: isUpdating } = useMutation(
        async ({ id, data }) => {
            const formData = processFormData(data);
            const res = await axios.put(`/products/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
        {
            onSuccess: () => {
                toast.success('Product updated successfully! ✅');
                queryClient.invalidateQueries('supplier-products');
                setIsEditOpen(false);
                setEditingProduct(null);
            },
            onError: (err) => toast.error(err.response?.data?.message || 'Failed to update product'),
        }
    );

    const { mutate: deleteProduct } = useMutation(
        async (id) => {
            await axios.delete(`/products/${id}`);
        },
        {
            onSuccess: () => {
                toast.success('Product deleted successfully! 🗑️');
                queryClient.invalidateQueries('supplier-products');
            },
            onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete product'),
        }
    );

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        mode: 'onChange', 
        defaultValues: { weight: { unit: 'kg' }, dimensions: { unit: 'cm' } }
    });
    const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEdit, formState: { errors: editErrors } } = useForm({
        mode: 'onChange',
    });

    const onSubmitCreate = (data) => createProduct(data);
    
    const onSubmitEdit = (data) => {
        const payload = { ...data };
        
        // Only include the 'images' field if the user has selected new files.
        // An un-touched image input holds the original array of image objects, not a FileList.
        // An empty selection results in a FileList with length 0.
        if (!(payload.images instanceof FileList) || payload.images.length === 0) {
            delete payload.images;
        }
    
        updateProduct({ id: editingProduct._id, data: payload });
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        
        resetEdit({
            ...product,
            category: product.category?._id || product.category,
            brand: product.brand?._id || product.brand,
            colors: product.colors?.join(', ') || '',
            sizes: product.sizes?.join(', ') || '',
            tags: product.tags?.join(', ') || '',
            weight: {
                value: product.weight?.value || '',
                unit: product.weight?.unit || 'kg',
            },
            dimensions: {
                length: product.dimensions?.length || '',
                width: product.dimensions?.width || '',
                height: product.dimensions?.height || '',
                unit: product.dimensions?.unit || 'cm',
            },

        });
        setIsEditOpen(true);
    };
    
    useEffect(() => {
        if (!isAddOpen) reset({ weight: { unit: 'kg' }, dimensions: { unit: 'cm' } });
        if (!isEditOpen) {
            resetEdit();
            setEditingProduct(null);
        }
    }, [isAddOpen, isEditOpen, reset, resetEdit]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
    if (isError) return <div className="min-h-screen flex items-center justify-center text-gray-700">Failed to load products.</div>;

    const products = productsData?.products || [];

    const renderFormFields = (registerFn, errorsObj, isEditMode = false) => (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4"> 
            <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Core Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput 
                    label="Product Name" 
                    name="name" 
                    register={registerFn} 
                    errors={errorsObj} 
                    rules={{ 
                        required: "Product name is required", 
                        minLength: { value: 2, message: "Name must be at least 2 characters" }, 
                        maxLength: { value: 20, message: "Name must be less than 20 characters" } 
                    }} 
                    placeholder="e.g., Running Shoes" 
                />
                <FormInput 
                    label="SKU" 
                    name="sku" 
                    register={registerFn} 
                    errors={errorsObj} 
                    rules={{ 
                        required: "SKU is required", 
                        minLength: { value: 3, message: "SKU must be at least 3 characters" },
                        maxLength: { value: 20, message: "SKU must be less than 20 characters" },
                        pattern: { value: /^[A-Z0-9-]+$/, message: "SKU must be uppercase letters, numbers, and hyphens" } 
                    }} 
                    placeholder="e.g., RUN-SHOE-001" 
                />
                <FormSelect 
                    label="Category" 
                    name="category" 
                    register={registerFn} 
                    errors={errorsObj} 
                    rules={{ required: "Category is required" }}
                >
                    <option value="">Select a Category</option>
                    {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </FormSelect>
                <FormSelect 
                    label="Brand" 
                    name="brand" 
                    register={registerFn} 
                    errors={errorsObj} 
                    rules={{ required: "Brand is required" }}
                >
                    <option value="">Select a Brand</option>
                    {brands?.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </FormSelect>
                <div className="md:col-span-2">
                    <FormInput 
                        label="Subcategory" 
                        name="subcategory" 
                        register={registerFn} 
                        errors={errorsObj} 
                        rules={{ maxLength: { value: 50, message: "Subcategory must be less than 50 characters" } }}
                        placeholder="e.g., Trail Running" 
                    />
                </div>
                 <FormTextarea 
                    label="Description" 
                    name="description" 
                    register={registerFn} 
                    errors={errorsObj} 
                    rows="4" 
                    rules={{ 
                        required: "Description is required", 
                        minLength: { value: 10, message: "Description must be at least 10 characters" },
                        maxLength: { value: 1000, message: "Description cannot exceed 1000 characters" } 
                    }} 
                    placeholder="Detailed product description..." 
                />
            </div>

            <h4 className="text-md font-semibold text-gray-800 border-b pb-2 mt-6">Pricing & Inventory</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput 
                    label="Price (LKR)" 
                    name="price" 
                    type="number" 
                    step="0.01" 
                    register={registerFn} 
                    errors={errorsObj} 
                    rules={{ 
                        required: "Price is required", 
                        min: { value: 0.01, message: "Price must be greater than 0" }, 
                        max: { value: 9999999.99, message: "Price must be less than 8 digits (excluding decimals)" },
                        pattern: { value: /^\d{1,7}(\.\d{1,2})?$/, message: "Price must have at most 7 digits before and 2 digits after the decimal."}
                    }} 
                    placeholder="15000.00" 
                />
                <FormInput 
                    label="Original Price (Optional)" 
                    name="originalPrice" 
                    type="number" 
                    step="0.01" 
                    register={registerFn} 
                    errors={errorsObj} 
                    rules={{ 
                        min: { value: 0, message: "Price cannot be negative" }, 
                        max: { value: 99999999, message: "Price must be less than 8 digits" } 
                    }} 
                    placeholder="20000.00" 
                />
                <FormInput 
                    label="Stock Quantity" 
                    name="stock" 
                    type="number" 
                    register={registerFn} 
                    errors={errorsObj} 
                    rules={{ 
                        required: "Stock is required", 
                        min: { value: 0, message: "Stock cannot be negative" },
                        max: { value: 99999, message: "Stock must be less than 6 digits" }
                    }} 
                    placeholder="100" 
                />
                <FormInput 
                    label="Minimum Stock Level" 
                    name="minStockLevel" 
                    type="number" 
                    register={registerFn} 
                    errors={errorsObj} 
                    rules={{ 
                        min: { value: 0, message: "Minimum stock cannot be negative" },
                        max: { value: 9999, message: "Min Stock must be less than 5 digits" }
                    }} 
                    placeholder="5" 
                />
            </div>

            <h4 className="text-md font-semibold text-gray-800 border-b pb-2 mt-6">Attributes</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput 
                    label="Colors (comma-separated)" 
                    name="colors" 
                    register={registerFn} 
                    errors={errorsObj} 
                    rules={{ maxLength: { value: 200, message: "Input is too long" } }}
                    placeholder="e.g., Red, Blue, Black" 
                />
                <FormInput 
                    label="Sizes (comma-separated)" 
                    name="sizes" 
                    register={registerFn} 
                    errors={errorsObj} 
                    rules={{ maxLength: { value: 200, message: "Input is too long" } }}
                    placeholder="e.g., S, M, L, XL" 
                />
                 <div className="md:col-span-2">
                     <FormInput 
                        label="Tags (comma-separated)" 
                        name="tags" 
                        register={registerFn} 
                        errors={errorsObj} 
                        rules={{ maxLength: { value: 200, message: "Input is too long" } }}
                        placeholder="e.g., running, sports, footwear" 
                    />
                 </div>
            </div>

            <h4 className="text-md font-semibold text-gray-800 border-b pb-2 mt-6">Shipping Details</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-2">
                    <FormInput 
                        label="Weight (Value)" 
                        name="weight.value" 
                        type="number" 
                        step="0.01" 
                        register={registerFn} 
                        errors={errorsObj.weight || {}} 
                        rules={{ 
                            min: { value: 0, message: "Weight cannot be negative" },
                            max: { value: 1000, message: "Weight must be < 1000" }
                        }}
                        placeholder="1.2" 
                    />
                    <FormSelect label="Unit" name="weight.unit" register={registerFn} errors={errorsObj.weight || {}}>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                    </FormSelect>
                </div>
                 <div className="grid grid-cols-4 gap-2">
                     <FormInput 
                        label="L (cm/in)" 
                        name="dimensions.length" 
                        type="number" 
                        register={registerFn} 
                        errors={errorsObj.dimensions || {}} 
                        rules={{ min: { value: 1, message: "Min 1" }, max: { value: 500, message: "Max 500" } }}
                        placeholder="30" 
                    />
                     <FormInput 
                        label="W (cm/in)" 
                        name="dimensions.width" 
                        type="number" 
                        register={registerFn} 
                        errors={errorsObj.dimensions || {}} 
                        rules={{ min: { value: 1, message: "Min 1" }, max: { value: 500, message: "Max 500" } }}
                        placeholder="20" 
                    />
                     <FormInput 
                        label="H (cm/in)" 
                        name="dimensions.height" 
                        type="number" 
                        register={registerFn} 
                        errors={errorsObj.dimensions || {}} 
                        rules={{ min: { value: 1, message: "Min 1" }, max: { value: 500, message: "Max 500" } }}
                        placeholder="15" 
                    />
                    <FormSelect label="Unit" name="dimensions.unit" register={registerFn} errors={errorsObj.dimensions || {}}>
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                        <option value="m">m</option>
                        <option value="ft">ft</option>
                    </FormSelect>
                 </div>
            </div>
            

            <h4 className="text-md font-semibold text-gray-800 border-b pb-2 mt-6">Media</h4>
            <div>
                 <label className="text-sm font-medium text-gray-700 mb-1 flex items-center"><ImageIcon className="h-4 w-4 mr-2" /> {isEditMode ? 'Add/Replace Images' : 'Images'}</label>
                 {isEditMode && editingProduct?.images?.length > 0 && (
                     <p className="text-xs text-yellow-700 mb-2">Note: Selecting new images will replace all existing ones.</p>
                 )}
                 <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    {...registerFn("images", isEditMode ? {} : { required: "At least one image is required for a new product" })} 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                />
                 {errorsObj.images && <p className="text-sm text-red-600 mt-1">{errorsObj.images.message}</p>}
            </div>
        </div>
    );
    
    const renderModal = (isOpen, closeFn, title, handleSubmitFn, onSubmitFn, isLoadingState, errorsObj, registerFn, isEditMode = false) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl transform transition-all"> 
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                        <button onClick={closeFn} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSubmitFn(onSubmitFn)}>
                        {renderFormFields(registerFn, errorsObj, isEditMode)}
                        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                            <button type="button" onClick={closeFn} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                            <button type="submit" disabled={isLoadingState} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700">
                                {isLoadingState ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <>
            <Helmet>
                <title>My Products - Sportify Supplier</title>
                <meta name="description" content="Manage your products on Sportify." />
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                                <p className="text-gray-600 mt-2">Manage your product catalog</p>
                            </div>
                            <button onClick={() => setIsAddOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm">
                                <Plus className="h-5 w-5 mr-2" />
                                Add Product
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative md:col-span-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or SKU" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="">All Categories</option>
                                {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="">All Brands</option>
                                {brands?.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                 <tr>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                 </tr>
                             </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((p) => (
                                    <tr key={p._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img 
                                                    src={`${import.meta.env.VITE_SERVER_URL}${p.images?.[0]?.url || '/placeholder-product.jpg'}`} 
                                                    alt={p.name} 
                                                    className="h-10 w-10 object-cover rounded mr-4 flex-shrink-0" 
                                                    onError={(e) => {
                                                        e.target.onerror = null; 
                                                        e.target.src = '/placeholder-product.jpg'; 
                                                    }}
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                                    <div className="text-xs text-gray-500">{p.category?.name || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{p.sku}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">LKR {Number(p.price).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm">
                                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                  p.stock <= (p.minStockLevel || 5) ? 'bg-red-100 text-red-800' : 
                                                  p.stock < 20 ? 'bg-yellow-100 text-yellow-800' : 
                                                  'bg-green-100 text-green-800'
                                              }`}>
                                                  {p.stock}
                                             </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal(p)} className="text-blue-600 hover:text-blue-900 mr-4 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit Product"><Edit className="h-5 w-5" /></button>
                                            <button onClick={() => window.confirm('Are you sure you want to delete this product?') && deleteProduct(p._id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors" title="Delete Product"><Trash2 className="h-5 w-5" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length === 0 && (
                            <div className="py-12 text-center text-gray-600">
                                <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                No products found. Try adjusting your filters or add a new product.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {renderModal(
                isAddOpen, 
                () => setIsAddOpen(false), 
                "Add New Product", 
                handleSubmit, 
                onSubmitCreate, 
                isCreating, 
                errors, 
                register
            )}

            {renderModal(
                isEditOpen, 
                () => setIsEditOpen(false), 
                `Edit Product: ${editingProduct?.name || ''}`, 
                handleEditSubmit, 
                onSubmitEdit, 
                isUpdating, 
                editErrors, 
                registerEdit,
                true 
            )}
        </>
    );
};

export default SupplierProducts;