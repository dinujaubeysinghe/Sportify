import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form'; // <-- IMPORT useForm
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
    
    // --- Removed manual formData useState and moved to useForm ---

    const queryClient = useQueryClient();
    
    // --- Initialize useForm ---
    const { 
        register, 
        handleSubmit, 
        reset, 
        formState: { errors, isValid } 
    } = useForm({
        mode: 'onChange', // Enable real-time validation
        defaultValues: { name: '', description: '', alt: '', image: null }
    });
    // --------------------------

    // Fetch categories
    const { data: categoriesData, isLoading, error } = useQuery(
        'admin-categories',
        async () => {
            const response = await axios.get('/categories');
            return response.data;
        }
    );
    
    // Helper function to build FormData
    const buildFormData = (data) => {
        const formData = new FormData();
        
        // Append simple fields
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("isActive", data.isActive ? 'true' : 'false'); // Ensure boolean is sent as string
        
        // Handle image file
        const imageFile = data.image?.[0]; // Access the File object from FileList
        if (imageFile) {
            formData.append("image", imageFile);
        } else if (editingCategory && !imageFile) {
            // This case handles submitting an edit without changing the image.
            // Depending on the backend, you might need to explicitly tell it NOT to delete the existing image.
            // For now, we just skip appending the image field.
        }
        
        // Handle alt text
        if (data.alt) formData.append("alt", data.alt);
        
        return formData;
    };


    // Create category mutation
    const createCategoryMutation = useMutation(
        async (data) => {
            const formData = buildFormData(data);
            const response = await axios.post('/categories', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        },
        {
            onSuccess: () => {
                toast.success('Category created successfully');
                queryClient.invalidateQueries('admin-categories');
                handleCloseModal();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to create category');
            }
        }
    );

    // Update category mutation
    const updateCategoryMutation = useMutation(
        async (data) => {
            const formData = buildFormData(data);
            // PUT request to update category, including multipart/form-data
            const response = await axios.put(`/categories/${editingCategory._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        },
        {
            onSuccess: () => {
                toast.success('Category updated successfully');
                queryClient.invalidateQueries('admin-categories');
                handleCloseModal();
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

    // --- RHF onSubmit Handler ---
    const onSubmit = (data) => {
        if (editingCategory) {
            updateCategoryMutation.mutate(data);
        } else {
            createCategoryMutation.mutate(data);
        }
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingCategory(null);
        reset({ name: '', description: '', image: null, alt: '', isActive: true }); // Reset form with RHF
    };


    const handleEdit = (category) => {
        setEditingCategory(category);
        
        // Reset and pre-populate the form using RHF reset()
        reset({
            name: category.name,
            description: category.description || '',
            alt: category.image?.alt || '',
            // We cannot pre-fill file inputs, so we set it to null
            image: null, 
            isActive: category.isActive ?? true
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
        reset({ name: '', description: '', image: null, alt: '', isActive: true }); // Reset form with RHF defaults
        setShowAddModal(true);
    };

    // Use a unified modal state check for loading
    const isSaving = createCategoryMutation.isPending || updateCategoryMutation.isPending;

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
    
    // Determine the current modal status (Add or Edit)
    const modalIsOpen = showAddModal || showEditModal;

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
                                            {category.image && category.image.url && (
                                                <img
                                                    src={`${import.meta.env.VITE_SERVER_URL}/${category.image.url}`}
                                                    alt={category.image?.alt || category.name}
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
                                                title="Edit Category"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category._id)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Delete Category"
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
                                        <span className={`flex items-center ${category.isActive ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {category.isActive ? (
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                            )}
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {modalIsOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </h2>
                        
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Category Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    maxLength={50} // Enforce max length
                                    {...register('name', {
                                        required: 'Category name is required',
                                        minLength: { value: 3, message: 'Name must be at least 3 characters' },
                                        maxLength: { value: 50, message: 'Name must be less than 50 characters' }
                                    })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                            </div>
                            
                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    maxLength={250} // Enforce max length
                                    {...register('description', {
                                        maxLength: { value: 250, message: 'Description cannot exceed 250 characters' }
                                    })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                    rows="3"
                                />
                                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
                            </div>
                            
                            {/* Image Upload */}
                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload Image {editingCategory && editingCategory.image ? '(Optional - will replace existing)' : '*'}
                                </label>
                                <input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    {...register('image', {
                                        // Image is required only for new categories if no existing image is present
                                        required: !editingCategory || !editingCategory.image ? 'Image is required for new categories' : false
                                    })}
                                    className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${errors.image ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.image && <p className="text-sm text-red-600 mt-1">{errors.image.message}</p>}
                                
                                {editingCategory?.image && (
                                    <p className="text-sm text-gray-500 mt-1">Current Image: {editingCategory.image.url}</p>
                                )}
                            </div>

                            {/* Image Alt Text */}
                            <div>
                                <label htmlFor="alt" className="block text-sm font-medium text-gray-700 mb-1">
                                    Image Alt Text *
                                </label>
                                <input
                                    id="alt"
                                    type="text"
                                    maxLength={20} // Enforce max length
                                    {...register('alt', {
                                        required: 'Alt text is required for accessibility',
                                        maxLength: { value: 20, message: 'Alt text must be under 20 characters' }
                                    })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.alt ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.alt && <p className="text-sm text-red-600 mt-1">{errors.alt.message}</p>}
                            </div>
                            
                            {/* Active Status Toggle (For Edit Mode only) */}
                            {editingCategory && (
                                <div>
                                    <label htmlFor="isActive" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                        <input
                                            id="isActive"
                                            type="checkbox"
                                            {...register('isActive')}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                        />
                                        <span>Category is Active</span>
                                    </label>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isSaving ? <LoadingSpinner size="sm" /> : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
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