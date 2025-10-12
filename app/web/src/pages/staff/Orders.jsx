import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Truck, 
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';
import useSettings from '../../hooks/useSettings'; // Adjust path as needed

const OrdersPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [ordersData, setOrdersData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [orderFilters, setOrderFilters] = useState({
    status: 'all',
    priority: 'all',
    dateRange: 'all'
  });
  const [orderSearch, setOrderSearch] = useState('');
    const { settings, isLoading: settingsLoading } = useSettings();

  // Load orders data
  const loadOrdersData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/orders/admin/all?limit=100'); // Get more orders
      // Transform API data to match frontend expectations
      const transformedOrders = (response.data.orders || []).map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: {
          firstName: order.user?.firstName || 'Unknown',
          lastName: order.user?.lastName || 'Customer',
          email: order.user?.email || 'unknown@example.com',
          phone: order.shippingAddress?.phone || 'N/A'
        },
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: order.total,
        status: order.shipmentStatus || 'pending',
        priority: order.priority || 'medium',
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress
      }));
      setOrdersData(transformedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      // Mock data for development
      setOrdersData([
        {
          _id: '1',
          orderNumber: 'ORD-001',
          customer: {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john@example.com',
            phone: '+1 (555) 123-4567'
          },
          items: [
            { name: 'Nike Air Max', quantity: 2, price: 120 },
            { name: 'Adidas T-Shirt', quantity: 1, price: 25 }
          ],
          totalAmount: 265,
          status: 'pending',
          priority: 'high',
          createdAt: '2024-01-15T10:30:00Z',
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001'
          }
        },
        {
          _id: '2',
          orderNumber: 'ORD-002',
          customer: {
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah@example.com',
            phone: '+1 (555) 234-5678'
          },
          items: [
            { name: 'Puma Sneakers', quantity: 1, price: 80 },
            { name: 'Under Armour Hoodie', quantity: 1, price: 60 }
          ],
          totalAmount: 140,
          status: 'processing',
          priority: 'medium',
          createdAt: '2024-01-15T09:15:00Z',
          shippingAddress: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210'
          }
        },
        {
          _id: '3',
          orderNumber: 'ORD-003',
          customer: {
            firstName: 'Mike',
            lastName: 'Wilson',
            email: 'mike@example.com',
            phone: '+1 (555) 345-6789'
          },
          items: [
            { name: 'Jordan Retro', quantity: 1, price: 200 }
          ],
          totalAmount: 200,
          status: 'shipped',
          priority: 'low',
          createdAt: '2024-01-14T14:20:00Z',
          shippingAddress: {
            street: '789 Pine St',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601'
          }
        },
        {
          _id: '4',
          orderNumber: 'ORD-004',
          customer: {
            firstName: 'Emily',
            lastName: 'Davis',
            email: 'emily@example.com',
            phone: '+1 (555) 456-7890'
          },
          items: [
            { name: 'Reebok Classic', quantity: 1, price: 90 },
            { name: 'New Balance Shorts', quantity: 2, price: 35 }
          ],
          totalAmount: 160,
          status: 'delivered',
          priority: 'medium',
          createdAt: '2024-01-13T16:45:00Z',
          shippingAddress: {
            street: '321 Elm St',
            city: 'Miami',
            state: 'FL',
            zipCode: '33101'
          }
        },
        {
          _id: '5',
          orderNumber: 'ORD-005',
          customer: {
            firstName: 'David',
            lastName: 'Brown',
            email: 'david@example.com',
            phone: '+1 (555) 567-8901'
          },
          items: [
            { name: 'Converse Chuck Taylor', quantity: 1, price: 65 },
            { name: 'Vans Old Skool', quantity: 1, price: 70 }
          ],
          totalAmount: 135,
          status: 'cancelled',
          priority: 'low',
          createdAt: '2024-01-12T11:20:00Z',
          shippingAddress: {
            street: '654 Maple Ave',
            city: 'Seattle',
            state: 'WA',
            zipCode: '98101'
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrdersData();
  }, []);

    const currencyCode = settings?.currency || 'LKR'; 

    // FIX: Dynamic currency code
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode // <--- DYNAMICALLY USE SETTINGS CURRENCY
      }).format(price);
    };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/dashboard/orders/${orderId}/status`, { 
        shipmentStatus: newStatus 
      });
      setOrdersData(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleViewOrder = (order, editMode = false) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsEditMode(editMode);
    setShowOrderModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) {
      toast.error('Please select a status');
      return;
    }

    if (newStatus === selectedOrder.status) {
      toast.error('Status is already set to this value');
      return;
    }

    try {
      await updateOrderStatus(selectedOrder._id, newStatus);
      setShowOrderModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleExportOrders = () => {
    if (filteredOrders.length === 0) {
      toast.error('No orders to export');
      return;
    }

    // Prepare CSV data
    const csvHeaders = [
      'Order Number',
      'Customer Name',
      'Customer Email',
      'Items',
      'Total Amount',
      'Status',
      'Priority',
      'Order Date'
    ];

    const csvData = filteredOrders.map(order => [
      order.orderNumber,
      `${order.customer.firstName} ${order.customer.lastName}`,
      order.customer.email,
      order.items.map(item => `${item.name} (Qty: ${item.quantity})`).join('; '),
      `LKR ${order.totalAmount.toFixed(2)}`,
      order.status,
      order.priority,
      formatDate(order.createdAt)
    ]);

    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredOrders.length} orders successfully!`);
  };

  const filteredOrders = ordersData.filter(order => {
    const matchesSearch = !orderSearch || 
      order.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderFilters.status === 'all' || order.status === orderFilters.status;
    const matchesPriority = orderFilters.priority === 'all' || order.priority === orderFilters.priority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const orderStats = {
    total: ordersData.length,
    pending: ordersData.filter(o => o.status === 'pending').length,
    processing: ordersData.filter(o => o.status === 'processing').length,
    shipped: ordersData.filter(o => o.status === 'shipped').length,
    delivered: ordersData.filter(o => o.status === 'delivered').length
  };

  return (
    <>
      <Helmet>
        <title>Orders Management - Sportify Staff</title>
        <meta name="description" content="Manage and process customer orders." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
                <p className="text-gray-600 mt-2">
                  Process and manage customer orders
                </p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={loadOrdersData}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button 
                  onClick={handleExportOrders}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{orderStats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">{orderStats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-semibold text-gray-900">{orderStats.processing}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Shipped</p>
                  <p className="text-2xl font-semibold text-gray-900">{orderStats.shipped}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-semibold text-gray-900">{orderStats.delivered}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by order number, customer..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={orderFilters.status}
                  onChange={(e) => setOrderFilters({...orderFilters, status: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={orderFilters.priority}
                  onChange={(e) => setOrderFilters({...orderFilters, priority: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={orderFilters.dateRange}
                  onChange={(e) => setOrderFilters({...orderFilters, dateRange: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Orders ({filteredOrders.length})</h2>
                <div className="flex space-x-2">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    <Filter className="h-4 w-4 inline mr-1" />
                    Advanced Filter
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Order</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Customer</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Items</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Total</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Priority</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Date</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan="8" className="px-3 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <LoadingSpinner size="lg" />
                          <p className="mt-4 text-gray-600">Loading orders...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-3 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-600 text-lg font-medium">No orders found</p>
                          <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredOrders.map((order, index) => (
                    <tr key={order._id} className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}>
                      <td className="px-3 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2">
                            <ShoppingCart className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900 truncate">{order.orderNumber}</div>
                            <div className="text-xs text-gray-500">#{order._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div>
                          <div className="text-xs font-semibold text-gray-900 truncate">
                            {order.customer.firstName} {order.customer.lastName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{order.customer.email}</div>
                          <div className="text-xs text-gray-500">{order.customer.phone}</div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="text-xs text-gray-900">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="truncate">
                              <span className="truncate">{item.name}</span>
                              <span className="font-semibold ml-1">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="text-sm font-bold text-gray-900">{formatPrice(order.totalAmount)}</div>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(order.priority)}`}>
                          {order.priority}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-xs text-gray-900">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-3 py-4 text-sm font-medium">
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => handleViewOrder(order)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Order"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => handleViewOrder(order, true)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Edit Order"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          {order.status === 'pending' && (
                            <button 
                              onClick={() => updateOrderStatus(order._id, 'processing')}
                              className="text-orange-600 hover:text-orange-900 p-1"
                              title="Process Order"
                            >
                              <Truck className="h-3 w-3" />
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button 
                              onClick={() => updateOrderStatus(order._id, 'shipped')}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Ship Order"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Order' : 'Order Details'}
              </h2>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setIsEditMode(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-semibold">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold">{formatPrice(selectedOrder.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedOrder.priority)}`}>
                      {selectedOrder.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{selectedOrder.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{selectedOrder.customer.phone}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="font-medium">{item.name}</span>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        <span className="ml-2 font-semibold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                <div className="text-sm">
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                </div>
              </div>
            </div>

            {/* Status Update Section */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Update Order Status</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">
                    New Status
                  </label>
                  <select
                    id="status-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Current: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span></p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setIsEditMode(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button 
                onClick={handleUpdateStatus}
                disabled={!newStatus || newStatus === selectedOrder.status}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrdersPage;