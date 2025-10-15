import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Search, Truck, Package, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

const SupplierOrders = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updateModal, setUpdateModal] = useState({ open: false, orderId: null, item: null });
  const [form, setForm] = useState({ trackingNumber: '', carrier: '', shipmentStatus: 'processing', shipmentNotes: '' });

  // Fetch supplier orders
  const { data, isLoading, error } = useQuery(['supplier-orders', statusFilter], async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    const res = await axios.get(`/orders/supplier/my?${params.toString()}`);
    return res.data;
  });

  // Update shipment mutation
  const updateShipment = useMutation(
    async ({ orderId, itemId, values }) => {
      const res = await axios.put(`/orders/${orderId}/shipment`, { itemId, ...values });
      console.log('order sts: ',res.data)
      return res.data;

    },
    {
      onSuccess: () => {
        toast.success('Shipment updated');
        queryClient.invalidateQueries('supplier-orders');
        setUpdateModal({ open: false, orderId: null, item: null });
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Failed to update shipment');
      }
    }
  );

  const openUpdate = (orderId, item) => {
    setUpdateModal({ open: true, orderId, item });
    setForm({
      trackingNumber: item.trackingNumber || '',
      carrier: item.carrier || '',
      shipmentStatus: item.shipmentStatus || 'processing',
      shipmentNotes: item.shipmentNotes || ''
    });
  };

  const submitUpdate = (e) => {
    e.preventDefault();
    if (!updateModal.item) return;
    updateShipment.mutate({ orderId: updateModal.orderId, itemId: updateModal.item._id, values: form });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-gray-700">Failed to load orders</div>;
  }

  // Filter items by search
  const orders = (data?.orders || []).map(o => {
    const filteredItems = o.items.filter(it =>
      search ? it.name?.toLowerCase().includes(search.toLowerCase()) || it._id?.toString().includes(search) : true
    );
    return { ...o, items: filteredItems };
  });

  const totalItems = orders.reduce((acc, o) => acc + o.items.length, 0);

  return (
    <>
      <Helmet>
        <title>My Orders - Sportify Supplier</title>
        <meta name="description" content="View orders for your products on Sportify." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-2">Orders containing your products</p>
            </div>
            <div className="text-sm text-gray-600">{totalItems} items</div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search item name or ID"
                  className="w-full pl-9 pr-3 py-2 border rounded-lg"
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
                <option value="">All Statuses</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {orders.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm py-16 text-center text-gray-600">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                No orders found
              </div>
            )}

            {orders.map(o => (
              <div key={o._id} className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Order</div>
                    <div className="font-semibold">{o.orderNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Placed</div>
                    <div className="font-semibold">{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  {o.paymentStatus === 'paid' ? (
                    <div className="flex items-center gap-6">
                      <div className="text-sm">
                        <div className="text-gray-500">Shipment</div>
                        <div className="font-medium capitalize">
                          {o.shipmentStatus || 'pending'}
                        </div>
                        {o.trackingNumber && (
                          <div className="text-xs text-gray-500">#{o.trackingNumber}</div>
                        )}
                      </div>
                      <button
                        onClick={() => openUpdate(o._id, o)}
                        className="px-3 py-2 bg-blue-600 text-white rounded flex items-center"
                      >
                        <Truck className="h-4 w-4 mr-2" /> Update
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <div className="text-gray-500">Payment</div>
                      <div className="font-medium capitalize">{o.paymentStatus}</div>
                    </div>
                  )}
                </div>
                <div className="divide-y">
                  {o.items.map(it => (
                    <div key={it._id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={`${import.meta.env.VITE_SERVER_URL}${it.image || '/placeholder-product.jpg'}`} alt={it.name} className="h-12 w-12 rounded object-cover" />
                        <div>
                          <div className="font-medium">{it.name}</div>
                          <div className="text-sm text-gray-500">Qty: {it.quantity} • LKR {Number(it.price).toFixed(2)}</div>
                          <div className="text-xs text-gray-500">Item ID: {it._id}</div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {updateModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Truck className="h-5 w-5 mr-2" /> Update Shipment
              </h3>
            </div>
            <form onSubmit={submitUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Tracking Number</label>
                <input
                  value={form.trackingNumber}
                  onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Carrier</label>
                <input
                  value={form.carrier}
                  onChange={(e) => setForm({ ...form, carrier: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Status</label>
                <select
                  value={form.shipmentStatus}
                  onChange={(e) => setForm({ ...form, shipmentStatus: e.target.value })}
                  className="w-full border rounded px-3 py-2 capitalize"
                 >
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={form.shipmentNotes}
                  onChange={(e) => setForm({ ...form, shipmentNotes: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setUpdateModal({ open: false, orderId: null, item: null })} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" disabled={updateShipment.isLoading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex items-center">
                  {updateShipment.isLoading ? 'Saving...' : (<><CheckCircle2 className="h-4 w-4 mr-2" /> Save</>)}
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

