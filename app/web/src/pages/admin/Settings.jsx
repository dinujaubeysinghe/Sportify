import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { Settings, Save, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// List of common currency codes for the dropdown
const currencyOptions = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'LKR', name: 'Sri Lankan Rupee' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
];

const AdminSettings = () => {
    const queryClient = useQueryClient();

    // ===== Fetch Settings =====
    const { data: settings, isLoading, error, refetch } = useQuery(
        'adminSettings',
        async () => {
            const res = await axios.get('/admin/settings');
            return res.data.settings;
        },
        { 
            // Use onSuccess to initialize the form once data is loaded
            onSuccess: (data) => {
                reset(data); // Set the form fields with fetched data
            }
        }
    );

    // ===== Form Setup =====
    const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
        defaultValues: settings, // Initial setup with data or empty object
    });

    // ===== Update Settings Mutation =====
    const updateSettingsMutation = useMutation(
        (newSettings) => axios.put('/admin/settings', newSettings),
        {
            onSuccess: () => {
                toast.success('Settings updated successfully! ✅');
                queryClient.invalidateQueries('adminSettings'); // Invalidate and refetch data
            },
            onError: (err) => {
                const message = err.response?.data?.message || 'Failed to update settings.';
                toast.error(message);
            }
        }
    );

    const onSubmit = (data) => {
        // Ensure numbers are converted back to numeric types before sending
        const payload = {
            ...data,
            taxRate: parseFloat(data.taxRate),
            lowStockThreshold: parseInt(data.lowStockThreshold, 10),
        };
        updateSettingsMutation.mutate(payload);
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
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-red-600">Error Loading Settings</h2>
                <p className="text-gray-600">Failed to fetch site configurations. Please check the network connection.</p>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Site Settings - Admin</title>
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div className="flex items-center">
                            <Settings className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
                                <p className="text-gray-600 mt-1">Configure global e-commerce and system parameters.</p>
                            </div>
                        </div>
                        <button
                            onClick={refetch}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                            disabled={updateSettingsMutation.isLoading}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                        </button>
                    </div>

                    {/* Settings Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-xl">
                        
                        {/* General Settings */}
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">General Configuration</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Site Name */}
                            <div>
                                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">Site Name</label>
                                <input
                                    id="siteName"
                                    type="text"
                                    {...register('siteName', { required: 'Site name is required' })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.siteName && <p className="text-red-500 text-xs mt-1">{errors.siteName.message}</p>}
                            </div>

                            {/* Currency (FIXED: Converted to Dropdown) */}
                            <div>
                                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency (3-letter code)</label>
                                <select
                                    id="currency"
                                    {...register('currency', { required: 'Currency is required' })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {currencyOptions.map(option => (
                                        <option key={option.code} value={option.code}>
                                            {option.code} - {option.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency.message}</p>}
                            </div>
                        </div>

                        {/* Financial/Inventory Settings */}
                        <h2 className="text-xl font-semibold text-gray-800 border-b pt-4 pb-2 mb-4">Financial & Inventory</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Tax Rate */}
                            <div>
                                <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                                <input
                                    id="taxRate"
                                    type="number"
                                    step="0.01"
                                    {...register('taxRate', { 
                                        required: 'Tax rate is required',
                                        min: { value: 0, message: 'Must be non-negative' },
                                        max: { value: 100, message: 'Cannot exceed 100%' }
                                    })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.taxRate && <p className="text-red-500 text-xs mt-1">{errors.taxRate.message}</p>}
                            </div>
                            
                            {/* Low Stock Threshold */}
                            <div>
                                <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                                <input
                                    id="lowStockThreshold"
                                    type="number"
                                    step="1"
                                    {...register('lowStockThreshold', { 
                                        required: 'Threshold is required',
                                        min: { value: 0, message: 'Must be non-negative' }
                                    })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.lowStockThreshold && <p className="text-red-500 text-xs mt-1">{errors.lowStockThreshold.message}</p>}
                            </div>
                        </div>

                        {/* Feature Toggles */}
                        <h2 className="text-xl font-semibold text-gray-800 border-b pt-4 pb-2 mb-4">Feature Toggles</h2>
                        <div className="space-y-4">

                            {/* Auto Approve Suppliers */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="autoApproveSuppliers"
                                        type="checkbox"
                                        {...register('autoApproveSuppliers')}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="autoApproveSuppliers" className="font-medium text-gray-700">Auto Approve Suppliers</label>
                                    <p className="text-gray-500">Automatically approve new supplier registrations without manual review.</p>
                                </div>
                            </div>

                            {/* Require Email Verification */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="requireEmailVerification"
                                        type="checkbox"
                                        {...register('requireEmailVerification')}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="requireEmailVerification" className="font-medium text-gray-700">Require Email Verification</label>
                                    <p className="text-gray-500">Users must click a link in an email to activate their account.</p>
                                </div>
                            </div>
                            
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={updateSettingsMutation.isLoading || !isDirty}
                                className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updateSettingsMutation.isLoading ? <LoadingSpinner size="sm" /> : <Save className="h-5 w-5 mr-2" />}
                                {updateSettingsMutation.isLoading ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AdminSettings;