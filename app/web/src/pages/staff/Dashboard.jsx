import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  MessageCircle, 
  Clock,
  Truck,
  UserPlus,
  Calendar,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(price);
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load dashboard stats
        const statsResponse = await axios.get('/dashboard/stats');
        const statsData = statsResponse.data.stats;

        setDashboardData({
          stats: {
            pendingOrders: statsData.orders.pendingOrders || 0,
            completedOrders: statsData.orders.completedOrders || 0,
            totalCustomers: statsData.users.totalCustomers || 0,
            supportTickets: statsData.notifications.unreadNotifications || 0,
            todayOrders: statsData.today.todayOrders || 0,
            weeklyOrders: statsData.orders.totalOrders || 0,
            totalRevenue: statsData.orders.totalRevenue || 0,
            changes: statsData.changes || { orders: 0, revenue: 0 }
          }
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set mock data for development
        setDashboardData({
          stats: {
            pendingOrders: 1,
            completedOrders: 1,
            totalCustomers: 3,
            supportTickets: 4,
            todayOrders: 3,
            weeklyOrders: 15,
            totalRevenue: 2500,
            changes: { orders: 0, revenue: 0 }
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Handle task card clicks
  const handleTaskClick = (taskName) => {
    switch (taskName) {
      case 'Orders to Process':
        navigate('/staff/orders');
        break;
      case 'Orders Shipped Today':
        navigate('/staff/orders');
        break;
      case 'New Customers Today':
        navigate('/staff/customers');
        break;
      case 'Support Tickets':
        navigate('/staff/support');
        break;
      default:
        toast.info('Feature coming soon!');
    }
  };

  const stats = [
    {
      name: 'Orders to Process',
      value: dashboardData?.stats.pendingOrders || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      action: 'Review & process pending orders',
      actionType: 'urgent',
      clickable: true
    },
    {
      name: 'Orders Shipped Today',
      value: dashboardData?.stats.completedOrders || 0,
      icon: Truck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      action: 'Track shipment status',
      actionType: 'completed',
      clickable: true
    },
    {
      name: 'New Customers Today',
      value: dashboardData?.stats.todayOrders || 0,
      icon: UserPlus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: 'Welcome new customers',
      actionType: 'info',
      clickable: true
    },
    {
      name: 'Support Tickets',
      value: dashboardData?.stats.supportTickets || 0,
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      action: 'Respond to customer inquiries',
      actionType: 'attention',
      clickable: true
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Staff Dashboard - Sportify</title>
        <meta name="description" content="Manage orders and provide customer support." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Today's Tasks */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 border-b border-indigo-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Today's Tasks</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    onClick={() => stat.clickable && handleTaskClick(stat.name)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                      stat.clickable ? 'cursor-pointer hover:scale-105' : ''
                    } ${
                      stat.actionType === 'urgent' 
                        ? 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300' 
                        : stat.actionType === 'completed'
                        ? 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300'
                        : stat.actionType === 'attention'
                        ? 'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300'
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        stat.actionType === 'urgent' 
                          ? 'bg-red-500' 
                          : stat.actionType === 'completed'
                          ? 'bg-green-500'
                          : stat.actionType === 'attention'
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
                      }`}>
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className={`text-2xl font-bold ${
                        stat.actionType === 'urgent' ? 'text-red-600' : 
                        stat.actionType === 'completed' ? 'text-green-600' :
                        stat.actionType === 'attention' ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">{stat.name}</p>
                    <p className="text-xs text-gray-600">{stat.action}</p>
                    {stat.clickable && (
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>Click to {stat.action.toLowerCase()}</span>
                        <span className="ml-1">→</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/staff/orders')}
                  className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Orders</p>
                    <p className="text-sm text-gray-600">Process and track customer orders</p>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/staff/customers')}
                  className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Customer Management</p>
                    <p className="text-sm text-gray-600">View and manage customers</p>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/staff/support')}
                  className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Customer Support</p>
                    <p className="text-sm text-gray-600">Handle customer inquiries</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Dashboard Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Orders This Week</span>
                  <span className="font-semibold text-gray-900">{dashboardData?.stats.weeklyOrders || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(dashboardData?.stats.totalRevenue || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Customers</span>
                  <span className="font-semibold text-gray-900">{dashboardData?.stats.totalCustomers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Orders</span>
                  <span className="font-semibold text-red-600">{dashboardData?.stats.pendingOrders || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffDashboard;