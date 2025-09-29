import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  UserCheck
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PayrollManagement from '../../components/staff/PayrollManagement';
import StaffManagement from '../../components/staff/StaffManagement';

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading } = useQuery(
    'admin-dashboard',
    async () => {
      const response = await axios.get('/admin/dashboard');
      return response.data.dashboard;
    }
  );

  // --- Approve / Reject mutations ---
  const updateSupplierStatus = useMutation(
    async ({ supplierId, isApproved }) => {
      const response = await axios.put(`/admin/supplier/${supplierId}/status`, { isApproved });
      return response.data;
    },
    {
      onSuccess: (_, variables) => {
        toast.success(
          variables.isApproved ? 'Supplier approved successfully' : 'Supplier rejected successfully'
        );
        queryClient.invalidateQueries('admin-dashboard'); // refresh data
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update supplier status');
      }
    }
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Users',
      value: dashboard?.userStats?.reduce((sum, stat) => sum + stat.count, 0) || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Total Products',
      value: dashboard?.productStats?.totalProducts || 0,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Total Orders',
      value: dashboard?.orderStats?.overview?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Total Revenue',
      value: formatPrice(dashboard?.orderStats?.overview?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Sportify</title>
        <meta name="description" content="Admin dashboard for managing the Sportify e-commerce platform." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              </div>
              <div className="p-6">
                {dashboard?.recentOrders && dashboard.recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {dashboard.recentOrders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">
                            {order.user?.firstName} {order.user?.lastName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No recent orders</p>
                )}
              </div>
            </div>

            {/* Low Stock Products */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
                </div>
              </div>
              <div className="p-6">
                {dashboard?.lowStockProducts && dashboard.lowStockProducts.length > 0 ? (
                  <div className="space-y-4">
                    {dashboard.lowStockProducts.slice(0, 5).map((item) => (
                      <div key={item._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.product?.name}</p>
                          <p className="text-sm text-gray-600">SKU: {item.product?.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">{item.currentStock}</p>
                          <p className="text-sm text-gray-600">in stock</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-600 mr-2" />
                    <p className="text-gray-600">All products are well stocked</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pending Supplier Approvals */}
          {dashboard?.pendingSuppliers && dashboard.pendingSuppliers.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Pending Supplier Approvals</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboard.pendingSuppliers.map((supplier) => (
                    <div
                      key={supplier._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{supplier.businessName}</p>
                        <p className="text-sm text-gray-600">
                          {supplier.firstName} {supplier.lastName} • {supplier.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          Applied on {new Date(supplier.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            updateSupplierStatus.mutate({ supplierId: supplier._id, isApproved: true })
                          }
                          disabled={updateSupplierStatus.isLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {updateSupplierStatus.isLoading ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() =>
                            updateSupplierStatus.mutate({ supplierId: supplier._id, isApproved: false })
                          }
                          disabled={updateSupplierStatus.isLoading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {updateSupplierStatus.isLoading ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/admin/products"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Manage Products</p>
                  <p className="text-sm text-gray-600">Add, edit, or remove products</p>
                </div>
              </a>
              
              <a
                href="/admin/orders"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShoppingCart className="h-6 w-6 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Manage Orders</p>
                  <p className="text-sm text-gray-600">Process and track orders</p>
                </div>
              </a>
              
              <a
                href="/admin/users"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-600">View and manage user accounts</p>
                </div>
              </a>
            </div>
          </div>

          {/* Staff Management Section */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <UserCheck className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">Staff Management</h2>
            </div>
            <StaffManagement />
          </div>

          {/* Payroll Management Section */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">Payroll Management</h2>
            </div>
            <PayrollManagement />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
