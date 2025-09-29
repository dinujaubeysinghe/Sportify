import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Package, ShoppingCart, DollarSign,
  AlertTriangle, CheckCircle, Eye, Plus, Edit3, BarChart3, Truck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ----------------------------
  // Fetch Supplier Summary
  // ----------------------------
  const { data: summary, isLoading: summaryLoading } = useQuery(
    'supplier-summary',
    async () => {
      const res = await axios.get('/inventory/supplier/summary');
      return res.data;
    }
  );

  // ----------------------------
  // Fetch Low Stock Products
  // ----------------------------
  const { data: lowStock, isLoading: lowStockLoading } = useQuery(
    'supplier-low-stock',
    async () => {
      const res = await axios.get('/inventory/supplier/low-stock');
      return res.data.products;
    }
  );

  // ----------------------------
  // Fetch Supplier Orders
  // ----------------------------
  const { data: orders, isLoading: ordersLoading } = useQuery(
    'supplier-orders',
    async () => {
      const res = await axios.get('/orders/supplier/my');
      console.log('Supplier Orders:', res.data.orders); // <--- console log
      return res.data.orders;
    }
  );

  if (summaryLoading || lowStockLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(price);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate total revenue from supplier orders
  const totalRevenue = orders.reduce((acc, order) => {
    const orderTotal = order.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    return acc + orderTotal;
  }, 0);
  console.log('Total Revenue:', totalRevenue);


  return (
    <>
      <Helmet>
        <title>Supplier Dashboard - Sportify</title>
        <meta name="description" content="Manage your products and track your sales performance." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.firstName}! Here's your business overview.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-semibold text-gray-900">{summary.summary.totalProducts}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatPrice(totalRevenue)}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Products</p>
                  <p className="text-2xl font-semibold text-gray-900">{lowStock.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <button
                onClick={() => navigate('/supplier/orders')} 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </button>            </div>
            <div className="p-6 space-y-4">
              {orders.map(order => (
                <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.items.length} items</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-900">{formatPrice(order.subtotal)}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            </div>
            <div className="p-6 space-y-4">
              {lowStock.length ? lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-600">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{p.currentStock}</p>
                    <p className="text-sm text-gray-500">min: {p.minStock}</p>
                  </div>
                </div>
              )) : (
                <div className="flex items-center justify-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-2" />
                  <p className="text-gray-600">All products are well stocked</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupplierDashboard;
