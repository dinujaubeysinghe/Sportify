import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { Users, DollarSign, Eye, CreditCard, CheckCircle, Clock, X, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner'; // Assuming component path
import useSettings from '../../hooks/useSettings'; // Assuming component path
import { useAuth } from '../../contexts/AuthContext';

// ----------------------
// MODAL: Supplier Payments Detail & Payout Action
// ----------------------
const SupplierPayoutModal = ({ supplier, closeModal, formatPrice }) => {
    const { user } = useAuth(); // Assuming useAuth is accessible for the admin user ID
    const queryClient = useQueryClient();
    
    // Fetch detailed balance for the specific supplier when the modal opens
    const { data: balanceData, isLoading: isBalanceLoading, error: balanceError, refetch: refetchBalance } = useQuery(
        ['supplier-balance-admin', supplier._id],
        async () => {
            // Re-use the existing backend route for balance details
            const res = await axios.get(`/suppliers/${supplier._id}/balance`);
            return res.data;
        },
        { enabled: !!supplier._id }
    );

    const payoutMutation = useMutation(
        async (itemsToPay) => {
            // Route: POST /suppliers/:id/pay (Admin route in your backend config)
            const res = await axios.post(`/suppliers/${supplier._id}/pay`, { itemsToPay });
            return res.data;
        },
        {
            onSuccess: (res) => {
                toast.success(res.message || 'Payout processed successfully!');
                queryClient.invalidateQueries('suppliers'); // Refresh main list status
                queryClient.invalidateQueries(['supplier-balance-admin', supplier._id]); // Refresh modal data
                // In a real app, you would contact the payment gateway here.
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || 'Failed to process payout');
            },
        }
    );

    const handleProcessPayout = () => {
        if (!balanceData?.pendingItems?.length) return;

        const confirm = window.confirm(`Confirm payout of ${formatPrice(balanceData.pendingAmount)} to ${supplier.businessName}?`);
        if (!confirm) return;

        // Payload structure required by exports.paySupplier
        const itemsToPay = balanceData.pendingItems.map((i) => ({ 
            orderId: i.orderId, 
            itemId: i.itemId, 
            amount: i.total, // Sending net total (server should validate this securely)
            orderNumber: i.orderNumber 
        }));
        
        payoutMutation.mutate(itemsToPay);
    };

    const { totalEarned = 0, totalPaid = 0, pendingAmount = 0, pendingItems = [] } = balanceData || {};
    
    const isProcessing = payoutMutation.isLoading;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 relative transform transition-all scale-100">
                <div className="flex justify-between items-start border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                        Payout Details: {supplier.businessName || `${supplier.firstName} ${supplier.lastName}`}
                    </h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {isBalanceLoading || isProcessing ? (
                    <div className="py-12 flex justify-center"><LoadingSpinner size="md" /></div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <SummaryCard title="Total Earned (Net)" value={formatPrice(totalEarned)} icon={<DollarSign />} color="bg-green-100" text="text-green-600" />
                            <SummaryCard title="Total Paid" value={formatPrice(totalPaid)} icon={<CheckCircle />} color="bg-blue-100" text="text-blue-600" />
                            <SummaryCard title="Pending Payout" value={formatPrice(pendingAmount)} icon={<CreditCard />} color="bg-yellow-100" text="text-yellow-600" />
                        </div>

                        {/* Pending Items Table */}
                        <div className="mt-6">
                            <h4 className="text-xl font-semibold text-gray-900 mb-3">Items Due ({pendingItems.length})</h4>
                            
                            {pendingItems.length === 0 ? (
                                <div className="text-center py-8 border rounded-lg bg-gray-50 text-gray-600">No pending items. All delivered orders have been paid.</div>
                            ) : (
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount Due (Net)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {pendingItems.map((item) => (
                                                <tr key={item.itemId}>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">#{item.orderNumber}</td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{item.name}</td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{item.quantity}</td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">{formatPrice(item.total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Payout Action */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleProcessPayout}
                                disabled={pendingItems.length === 0 || isProcessing}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                            >
                                {isProcessing ? (
                                    <>Processing...<LoadingSpinner size="sm" /></>
                                ) : (
                                    `Process Payout of ${formatPrice(pendingAmount)}`
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ----------------------
// Helper Components
// ----------------------
const SummaryCard = ({ title, value, icon, color, text }) => (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center border border-gray-100">
        <div className={`p-3 rounded-full ${color}`}>
            {React.cloneElement(icon, { className: `h-6 w-6 ${text}` })}
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);


// ----------------------
// Main Component
// ----------------------
export default function AdminPayments() {
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { user } = useAuth();
    const { settings } = useSettings();
    const currencyCode = settings?.currency || 'LKR';

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode 
        }).format(price || 0);
    };

    // Assuming we fetch ALL suppliers here for the admin view
    const { data: suppliersData, isLoading, error, refetch } = useQuery(
        'adminSuppliersList',
        async () => {
            // Admin gets all suppliers, including those not approved
            const res = await axios.get('/suppliers'); 
            return res.data.suppliers;
        },
        { enabled: !!user && user.role === 'admin' } // Only fetch if admin is logged in
    );

    const handleViewPayments = (supplier) => {
        setSelectedSupplier(supplier);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedSupplier(null);
        refetch(); // Refresh main list after closing the modal in case a payout was done
    };
    
    // Filter to only show active, approved suppliers with a business name for clarity
    const payableSuppliers = (suppliersData || [])
        .filter(s => s.role === 'supplier' && s.isApproved === true && s.isActive === true)
        .sort((a, b) => (a.businessName || a.lastName).localeCompare(b.businessName || b.lastName));


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }
    
    if (error) {
        return <div className="text-center py-12 text-red-600">Error loading supplier list.</div>;
    }


    return (
        <>
            <Helmet>
                <title>Payout Control - Admin</title>
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Supplier Payout Control</h1>
                        <button
                            onClick={refetch}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {payableSuppliers.length === 0 ? (
                            <div className="text-center py-12 text-gray-600">No active, approved suppliers to process payments for.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payableSuppliers.map((supplier) => (
                                            <tr key={supplier._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {supplier.businessName || `${supplier.firstName} ${supplier.lastName}`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {supplier.firstName} {supplier.lastName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {supplier.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <button 
                                                        onClick={() => handleViewPayments(supplier)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 flex items-center mx-auto"
                                                        title="View Pending Payouts"
                                                    >
                                                        <DollarSign className="h-4 w-4" />
                                                        <span className='ml-2'>Pay</span>
                                                    </button>
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
            
            {/* Modal */}
            {showModal && selectedSupplier && (
                <SupplierPayoutModal 
                    supplier={selectedSupplier} 
                    closeModal={closeModal} 
                    formatPrice={formatPrice}
                />
            )}
        </>
    );
}