import { Helmet } from 'react-helmet-async';
import { ShoppingCart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminOrders = () => {
  const queryClient = useQueryClient();

  // Fetch all orders
  const { data: orders, isLoading } = useQuery('all-orders', async () => {
    const response = await axios.get('/orders/admin/all');
    return response.data.orders;
  });

  // Mutation to update order status
  const updateStatusMutation = useMutation(
    async ({ orderId, paymentStatus }) => {
      await axios.put(`/orders/${orderId}/payment`, { paymentStatus });
    },
    {
      onSuccess: () => queryClient.invalidateQueries('all-orders'),
    }
  );

  const statusOptions = [
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
  ];

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, paymentStatus: newStatus });
  };

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
        <title>Manage Orders - Sportify Admin</title>
        <meta name="description" content="Manage orders in the Sportify e-commerce platform." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
            <p className="text-gray-600 mt-2">Process and track customer orders</p>
          </div>

          {orders && orders.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      {console.log('order: ', order)}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user?.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          {statusOptions.map((paymentStatus) => (
                            <option key={paymentStatus} value={paymentStatus}>{paymentStatus.replace('_', ' ').toUpperCase()}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => window.location.href = `orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
              <p className="text-gray-600 mb-6">There are no orders at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminOrders;
