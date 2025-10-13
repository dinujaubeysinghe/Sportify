import { useState } from 'react';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { Users, CheckCircle, XCircle, Clock, Eye, RefreshCw, Mail, Phone, MapPin, Building } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

// Status filter options
const statusFilters = {
    all: { label: 'All', icon: Users, color: 'bg-gray-600', filter: {} },
    // Using string booleans for clarity for the backend
    pending: { label: 'Pending Review', icon: Clock, color: 'bg-yellow-600', filter: { isApproved: 'false', isActive: 'true' } }, 
    approved: { label: 'Approved', icon: CheckCircle, color: 'bg-green-600', filter: { isApproved: 'true', isActive: 'true' } }, 
    rejected: { label: 'Rejected / Disabled', icon: XCircle, color: 'bg-red-600', filter: { isActive: 'false' } }, 
};

// ----------------------
// Supplier Details Modal (No changes needed)
// ----------------------
const SupplierDetailsModal = ({ supplier, closeModal }) => {
    if (!supplier) return null;

    const address = supplier.address || {};

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative transform transition-all scale-100">
                <div className="flex justify-between items-start border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Building className="h-6 w-6 mr-2 text-blue-600" />
                        {supplier.businessName || `${supplier.firstName} ${supplier.lastName}`}
                    </h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-800 capitalize">{supplier.role} Account</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Contact Info */}
                        <div className="space-y-2 p-3 border rounded-lg">
                            <h4 className="text-md font-semibold text-gray-700 border-b pb-1 mb-2">Contact Info</h4>
                            <p className="flex items-center text-sm text-gray-700"><Mail className="h-4 w-4 mr-2 text-blue-500" /> {supplier.email}</p>
                            <p className="flex items-center text-sm text-gray-700"><Phone className="h-4 w-4 mr-2 text-blue-500" /> {supplier.phone || 'N/A'}</p>
                            <p className="text-sm text-gray-700">Name: {supplier.firstName} {supplier.lastName}</p>
                        </div>
                        
                        {/* Business Info */}
                        <div className="space-y-2 p-3 border rounded-lg">
                            <h4 className="text-md font-semibold text-gray-700 border-b pb-1 mb-2">Business Details</h4>
                            <p className="text-sm text-gray-700">License: {supplier.businessLicense || 'N/A'}</p>
                            <p className="text-sm text-gray-700">Tax ID: {supplier.taxId || 'N/A'}</p>
                            <p className="text-sm text-gray-700">Created: {new Date(supplier.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    {/* Address */}
                    <div className="p-3 border rounded-lg bg-gray-50">
                        <h4 className="text-md font-semibold text-gray-700 flex items-center mb-2">
                            <MapPin className="h-5 w-5 mr-2 text-blue-500" /> Business Address
                        </h4>
                        <p className="text-sm text-gray-700">{address.street || 'N/A'}</p>
                        <p className="text-sm text-gray-700">{address.city}, {address.state} {address.zipCode}</p>
                        <p className="text-sm text-gray-700">{address.country || 'Sri Lanka'}</p>
                    </div>
                </div>

                <div className="mt-6 text-right">
                    <button onClick={closeModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Close</button>
                </div>
            </div>
        </div>
    );
};

// ----------------------
// Main AdminSuppliers Component
// ----------------------
const AdminSuppliers = () => {
    const [currentStatus, setCurrentStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const limit = 10;

    const currentFilter = statusFilters[currentStatus];

    const handleStatusChange = (statusKey) => {
        setCurrentStatus(statusKey);
        setCurrentPage(1); // Reset page when changing filters
    };

    // ===== Fetch Suppliers with Debug Logging =====
    const { data: suppliersData, isLoading, error, refetch } = useQuery(
        ['suppliers', currentStatus, currentPage],
        async () => {
            const params = new URLSearchParams();
            
            Object.entries(currentFilter.filter).forEach(([key, value]) => {
                params.append(key, value);
            });
            
            params.append('page', currentPage);
            params.append('limit', limit);

            const requestUrl = `/suppliers?${params.toString()}`;
            


            const res = await axios.get(requestUrl);
                        // 🐛 DEBUG CODE: Log the request URL to the console
            console.log("------------------------------------------");
            console.log(`API Call for Status: ${currentStatus}`);
            console.log("Request URL:", requestUrl);
            console.log("------------------------------------------");
            console.log("Request Data:", res.data.suppliers);
            console.log("------------------------------------------");
            
            // ------------------------------------------
            return res.data;
            
        },
        { keepPreviousData: true }
    );
    
    // --- Data Processing ---
    const suppliers = suppliersData?.suppliers || [];
    const totalCount = suppliersData?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    // --- Logic Helpers ---
    const getApprovalStatus = (supplier) => {
        if (supplier.isActive === false) return 'Rejected/Disabled'; 
        if (supplier.isApproved === true) return 'Approved';
        return 'Pending'; 
    };

    const getStatusBadge = (supplier) => {
        const status = getApprovalStatus(supplier);
        const colorMap = {
            'Approved': 'bg-green-100 text-green-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Rejected/Disabled': 'bg-red-100 text-red-800',
        };
        return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorMap[status]}`}>{status}</span>;
    };
    
    const handleApproveReject = async (supplierId, approveStatus) => {
        try {
            const action = approveStatus ? 'approved' : 'disabled';
            
            const updatePayload = {
                isApproved: approveStatus,
                isActive: approveStatus // Set isActive to true if approving, false if rejecting/disabling
            };
            
            await axios.put(`/admin/supplier/${supplierId}/status`, updatePayload);
            toast.success(`Supplier ${action} successfully!`);
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to update approval status.`);
        }
    };
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    
    const handleViewDetails = (supplier) => {
        setSelectedSupplier(supplier);
        setShowModal(true);
    };
    
    const closeModal = () => {
        setShowModal(false);
        setSelectedSupplier(null);
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
            <div className="min-h-screen flex items-center justify-center text-red-600">
                Error fetching data. Try refreshing.
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Manage Suppliers - Sportify Admin</title>
                <meta name="description" content="Approve and manage supplier accounts in the Sportify e-commerce platform." />
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Manage Suppliers</h1>
                            <p className="text-gray-600 mt-2">Approve and manage supplier accounts ({totalCount} total)</p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
                        </button>
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Status</h3>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(statusFilters).map(([key, item]) => (
                                <button
                                    key={key}
                                    onClick={() => handleStatusChange(key)} 
                                    className={`px-4 py-2 rounded-lg text-white font-medium flex items-center transition-all ${item.color} ${currentStatus === key ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : 'opacity-80 hover:opacity-100'}`}
                                >
                                    <item.icon className="h-4 w-4 mr-2" />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Supplier Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {suppliers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {suppliers.map((supplier) => (
                                            <tr key={supplier._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {supplier.businessName || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {supplier.firstName} {supplier.lastName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {supplier.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {getStatusBadge(supplier)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="flex justify-center space-x-2">
                                                        <button 
                                                            onClick={() => handleViewDetails(supplier)} 
                                                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        
                                                        {/* Approve Button (Only visible if Pending) */}
                                                        {getApprovalStatus(supplier) === 'Pending' && (
                                                            <button
                                                                onClick={() => handleApproveReject(supplier._id, true)}
                                                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                                                title="Approve Supplier"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </button>
                                                        )}

                                                        {/* Reject/Disable Button (Visible if approved or pending) */}
                                                        {(getApprovalStatus(supplier) === 'Approved' || getApprovalStatus(supplier) === 'Pending') && (
                                                            <button
                                                                onClick={() => handleApproveReject(supplier._id, false)}
                                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                                title="Reject/Disable Supplier"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-gray-900">No Suppliers Found</h2>
                                <p className="text-gray-600">Adjust your status filter or check back later.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Pagination (Basic implementation) */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6 space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-gray-700">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Render Modal */}
            {showModal && <SupplierDetailsModal supplier={selectedSupplier} closeModal={closeModal} />}
        </>
    );
};

export default AdminSuppliers;