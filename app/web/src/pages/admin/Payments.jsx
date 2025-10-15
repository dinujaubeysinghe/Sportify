import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { Users, DollarSign, Eye, CreditCard, CheckCircle, Clock, X, RefreshCw, BarChart3 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useSettings from '../../hooks/useSettings'; 
import { useAuth } from '../../contexts/AuthContext';

// Import Charting Libraries and Components
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Register Chart.js components globally for the report
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);


// ----------------------
// MODAL: Supplier Payments Detail & Payout Action
// ----------------------
const SupplierPayoutModal = ({ supplier, closeModal, formatPrice }) => {
    const queryClient = useQueryClient();
    
    // Fetch detailed balance for the specific supplier when the modal opens
    const { data: balanceData, isLoading: isBalanceLoading, error: balanceError, refetch: refetchBalance } = useQuery(
        ['supplier-balance-admin', supplier._id],
        async () => {
            const res = await axios.get(`/suppliers/${supplier._id}/balance`);
            return res.data;
        },
        { enabled: !!supplier._id }
    );

    const payoutMutation = useMutation(
        async (itemsToPay) => {
            const res = await axios.post(`/suppliers/${supplier._id}/pay`, { itemsToPay });
            return res.data;
        },
        {
            onSuccess: (res) => {
                toast.success(res.message || 'Payout processed successfully!');
                queryClient.invalidateQueries('adminSuppliersList'); // Refresh main list status
                queryClient.invalidateQueries(['supplier-balance-admin', supplier._id]); // Refresh modal data
                queryClient.invalidateQueries('admin-payments-analysis'); // Refresh report data
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

        const itemsToPay = balanceData.pendingItems.map((i) => ({ 
            orderId: i.orderId, 
            itemId: i.itemId, 
            amount: i.total,
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
// Report Component (New Logic)
// ----------------------
const PaymentAnalysisPage = ({ formatPrice, currencyCode, switchView }) => {
    const reportRef = useRef(null);
    const { user } = useAuth();
    
    // Fetch summary data: total paid, total pending, and recent history
    // NOTE: This assumes a robust backend endpoint exists at /admin/payments/analysis
    const { data: financialData, isLoading } = useQuery(
        'admin-payments-analysis',
        async () => {
            const res = await axios.get('/admin/payments/analysis'); 
            return res.data;
        }
    );

    const { 
        totalPaid = 0, 
        totalPending = 0, 
        recentPayouts = [] 
    } = financialData || {};

    // --- PDF Download Handler ---
    const handleDownload = async () => {
        const input = reportRef.current;
        if (!input) return;

        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('payment-analysis-report.pdf');
    };

    if (isLoading) {
        return <div className="p-12 text-center"><LoadingSpinner size="lg" /></div>;
    }

    // --- Chart Data Preparation ---
    const totalPayouts = totalPaid + totalPending;
    
    // Chart 1: Payout Status Pie Chart (Paid vs. Pending)
    const statusPieData = {
        labels: ['Total Paid', 'Total Pending'],
        datasets: [
            {
                label: `Amount (${currencyCode})`,
                data: [totalPaid, totalPending],
                backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 206, 86, 0.8)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
                borderWidth: 1
            }
        ]
    };

    // Chart 2: Recent Payouts Bar Chart
    const recentData = recentPayouts.slice(0, 10).sort((a, b) => new Date(a.date) - new Date(b.date));
    const payoutBarData = {
        labels: recentData.map(p => new Date(p.date).toLocaleDateString()),
        datasets: [
            {
                label: `Amount (${currencyCode})`,
                data: recentData.map(p => p.amount),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }
        ]
    };
    
    const sortedPayouts = [...recentPayouts].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="p-4">
            
            {/* Header and Download Button */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Payment Analysis Report</h1>
                <div>
                    <button 
                        onClick={() => switchView('control')}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors mr-3"
                    >
                        Back to Payout Control
                    </button>
                    <button 
                        onClick={handleDownload} 
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Download PDF
                    </button>
                </div>
            </div>
            
            {/* REPORT CONTENT for PDF GENERATION */}
            <div ref={reportRef} className="report-content p-6 bg-white border border-gray-300 shadow-lg" style={{ minHeight: '297mm' }}>
                
                <header className="report-header text-center border-b pb-4 mb-6">
                    <div className='flex justify-center mb-3'>
                        {/* Use a placeholder path that might exist in your structure */}
                        <img src='/SportifyLogo.png' alt='Sportify Logo' className='w-48 h-auto'/> 
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Supplier Payment Analysis</h1>
                    <p className="text-gray-600 mt-2">Generated by {user?.firstName} {user?.lastName || 'Admin'} on: {new Date().toLocaleDateString()}</p>
                </header>

                {/* Section 1: Financial Summary */}
                <section className="grid grid-cols-3 gap-6 mb-8">
                    <SummaryCard title="Total Paid" value={formatPrice(totalPaid)} icon={<CheckCircle />} color="bg-green-100" text="text-green-600" />
                    <SummaryCard title="Total Pending" value={formatPrice(totalPending)} icon={<Clock />} color="bg-yellow-100" text="text-yellow-600" />
                    <SummaryCard title="Total Payouts" value={formatPrice(totalPayouts)} icon={<DollarSign />} color="bg-blue-100" text="text-blue-600" />
                </section>

                {/* Section 2: Charts */}
                <section className="grid grid-cols-2 gap-6 mb-8">
                    <div className="chart-container p-4 border rounded-lg shadow-sm" style={{ height: '300px' }}>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Paid vs. Pending Payouts</h3>
                        <Pie data={statusPieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                    <div className="chart-container p-4 border rounded-lg shadow-sm" style={{ height: '300px' }}>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Recent Payout History (Last 10)</h3>
                        <Bar data={payoutBarData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </section>

                {/* Section 3: Detailed Table */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Detailed Payout History</h2>
                    <div className="table-responsive border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount ({currencyCode})</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedPayouts.slice(0, 20).map((p, index) => (
                                    <tr key={index} className={p.status !== 'Paid' ? 'bg-yellow-50' : ''}>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(p.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{formatPrice(p.amount)}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">{p.supplierName || 'N/A'}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                            <span className={`px-2 py-1 text-xs rounded-full ${p.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {p.status || 'Paid'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {sortedPayouts.length === 0 && <div className="text-center py-4 text-gray-500 border rounded-lg mt-4">No recent payout data available.</div>}
                </section>

                {/* Footer: Signature and Date */}
                <footer className='sign mt-16 text-sm text-gray-700'>
                    <div className='flex justify-between'>
                        <div>
                            <p><strong>Prepared By:</strong> {user?.firstName} {user?.lastName || 'Admin'}</p>
                            <p><strong>Date :</strong> {new Date().toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="border-t border-gray-400 pt-1 w-48 text-center">Authorized Signature</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};


// ----------------------
// Main Component (AdminPayments)
// ----------------------
export default function AdminPayments() {
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState('control'); // 'control' or 'analysis'
    const { user } = useAuth();
    const { settings } = useSettings();
    const currencyCode = settings?.currency || 'LKR';

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode 
        }).format(price || 0);
    };

    // Fetch ALL suppliers for the payout control table
    const { data: suppliersData, isLoading, error, refetch } = useQuery(
        'adminSuppliersList',
        async () => {
            const res = await axios.get('/suppliers'); 
            return res.data.suppliers;
        },
        { enabled: !!user && user.role === 'admin' }
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
    
    // Filter to only show active, approved suppliers 
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

    if (viewMode === 'analysis') {
        return (
            <PaymentAnalysisPage 
                formatPrice={formatPrice} 
                currencyCode={currencyCode} 
                switchView={setViewMode} 
            />
        );
    }

    return (
        <>
            <Helmet>
                <title>Payout Control - Admin</title>
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header and Switch */}
                    <div className="mb-8 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Supplier Payout Control</h1>
                        <div className='flex gap-4'>
                            <button
                                onClick={() => setViewMode('analysis')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                                title="View Financial Charts and Report"
                            >
                                <BarChart3 className="h-4 w-4 mr-2" /> View Analysis Report
                            </button>
                            <button
                                onClick={refetch}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
                            </button>
                        </div>
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