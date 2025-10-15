import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Truck, Package, CheckCircle2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

// Define status options outside the component for better performance and readability
const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

const SupplierOrders = () => {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [updateModal, setUpdateModal] = useState({ open: false, orderId: null });
    
    // State for the update form and its validation errors
    const [form, setForm] = useState({ 
        trackingNumber: '', 
        carrier: '', 
        shipmentStatus: 'processing', 
        shipmentNotes: '' 
    });
    const [errors, setErrors] = useState({});

    // --- Data Fetching ---
    const { data, isLoading, error } = useQuery(['supplier-orders', statusFilter], async () => {
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        // Ensure you are using the correct API endpoint
        const res = await axios.get(`/orders/supplier/my?${params.toString()}`);
        return res.data;
    });

    // --- Data Mutation ---
    const updateShipment = useMutation(
        async ({ orderId, values }) => {
            const res = await axios.put(`/orders/${orderId}/shipment`, values);
            return res.data;
        },
        {
            onSuccess: () => {
                toast.success('Shipment updated successfully!');
                queryClient.invalidateQueries('supplier-orders');
                setUpdateModal({ open: false, orderId: null });
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || 'Failed to update shipment');
            }
        }
    );

    // --- Modal and Form Handlers ---
    const openUpdateModal = (order) => {
        setUpdateModal({ open: true, orderId: order._id });
        setForm({
            trackingNumber: order.trackingNumber || '',
            carrier: order.carrier || '',
            shipmentStatus: order.shipmentStatus || 'processing',
            shipmentNotes: order.shipmentNotes || ''
        });
        setErrors({}); // Clear any previous errors
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        const requiredStatuses = ['shipped', 'in_transit', 'delivered'];

        // Only require tracking info if the order is being shipped or is already in transit/delivered
        if (requiredStatuses.includes(form.shipmentStatus)) {
            if (!form.trackingNumber.trim()) {
                newErrors.trackingNumber = "Tracking number is required for this status.";
            } else if (/\s/.test(form.trackingNumber.trim())) {
                newErrors.trackingNumber = "Tracking number cannot contain spaces.";
            }
            if (!form.carrier.trim()) {
                newErrors.carrier = "Carrier is required for this status.";
            }
        }
        return newErrors;
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            toast.error("Please fix the validation errors.");
            return;
        }
        updateShipment.mutate({ orderId: updateModal.orderId, values: form });
    };

    // --- Render Logic ---
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-red-600">Failed to load orders. Please try again.</div>;
    }

    // Filter orders based on search query after fetching
    const filteredOrders = (data?.orders || [])
        .map(order => ({
            ...order,
            items: order.items.filter(item => 
                search ? 
                item.name?.toLowerCase().includes(search.toLowerCase()) || 
                order.orderNumber?.toLowerCase().includes(search.toLowerCase()) : 
                true
            )
        }))
        .filter(order => order.items.length > 0);

    return (
        <>
            <Helmet>
                <title>My Orders - Sportify Supplier</title>
                <meta name="description" content="View and manage orders for your products on Sportify." />
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                        <p className="text-gray-600 mt-1">View and manage orders containing your products.</p>
                    </div>

                    {/* Search and Filter */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative w-full md:flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by item name or order number..."
                                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)} 
                                className="w-full md:w-auto px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 capitalize"
                            >
                                <option value="">All Statuses</option>
                                {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-6">
                        {filteredOrders.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm py-16 text-center text-gray-600">
                                <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                No orders found matching your criteria.
                            </div>
                        ) : (
                            filteredOrders.map(order => (
                                <div key={order._id} className="bg-white rounded-lg shadow-sm">
                                    <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <div className="text-sm text-gray-500">Order #</div>
                                            <div className="font-semibold text-gray-900">{order.orderNumber}</div>
                                        </div>
                                        <div className="text-sm">
                                            <div className="text-gray-500">Placed On</div>
                                            <div className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleString()}</div>
                                        </div>
                                        <div className="text-sm">
                                            <div className="text-gray-500">Payment</div>
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => openUpdateModal(order)} 
                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg flex items-center hover:bg-blue-700 transition disabled:opacity-50"
                                            disabled={order.paymentStatus !== 'paid'}
                                        >
                                            <Truck className="h-4 w-4 mr-2" /> Update Shipment
                                        </button>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {order.items.map(item => (
                                            <div key={item._id} className="px-6 py-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <img src={`${import.meta.env.VITE_SERVER_URL}${item.image || '/placeholder-product.jpg'}`} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{item.name}</div>
                                                        <div className="text-sm text-gray-500">Qty: {item.quantity} • LKR {Number(item.price).toFixed(2)}</div>
                                                        <div className="text-xs text-gray-500 mt-1">Item ID: {item._id}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Update Modal with Validation */}
            {updateModal.open && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                <Truck className="h-6 w-6 mr-3 text-blue-600" /> Update Shipment
                            </h3>
                            <button onClick={() => setUpdateModal({ open: false, orderId: null })} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={submitUpdate} className="space-y-4">
                            <div>
                                <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                                <input id="trackingNumber" name="trackingNumber" value={form.trackingNumber} onChange={handleFormChange} className={`w-full border rounded-lg px-3 py-2 transition ${errors.trackingNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
                                {errors.trackingNumber && <p className="text-red-600 text-xs mt-1">{errors.trackingNumber}</p>}
                            </div>
                            <div>
                                <label htmlFor="carrier" className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                                <input id="carrier" name="carrier" value={form.carrier} onChange={handleFormChange} className={`w-full border rounded-lg px-3 py-2 transition ${errors.carrier ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
                                {errors.carrier && <p className="text-red-600 text-xs mt-1">{errors.carrier}</p>}
                            </div>
                            <div>
                                <label htmlFor="shipmentStatus" className="block text-sm font-medium text-gray-700 mb-1">Shipment Status</label>
                                <select id="shipmentStatus" name="shipmentStatus" value={form.shipmentStatus} onChange={handleFormChange} className="w-full border rounded-lg px-3 py-2 capitalize border-gray-300 focus:ring-blue-500">
                                    {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="shipmentNotes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                <textarea id="shipmentNotes" name="shipmentNotes" rows={3} value={form.shipmentNotes} onChange={handleFormChange} className="w-full border rounded-lg px-3 py-2 border-gray-300 focus:ring-blue-500" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                                <button type="button" onClick={() => setUpdateModal({ open: false, orderId: null })} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                                <button type="submit" disabled={updateShipment.isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50 flex items-center hover:bg-blue-700">
                                    {updateShipment.isLoading ? 'Saving...' : (<><CheckCircle2 className="h-4 w-4 mr-2" /> Save Changes</>)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default SupplierOrders;