import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { DollarSign, CreditCard, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import useSettings from '../../hooks/useSettings'; 

const SupplierPayments = () => {
  const { user } = useAuth();
  
  const { settings } = useSettings();
  const currencyCode = settings?.currency || 'LKR';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode 
    }).format(price || 0);
  };

  // --------------------------------------------------------------------
  // Removed payoutMutation and handlePayoutAll
  // --------------------------------------------------------------------

  const { data, isLoading, error, refetch } = useQuery(
    ['supplier-balance', user?._id],
    async () => {
      const res = await axios.get(`/suppliers/${user._id}/balance`);
      return res.data;
    },
    { enabled: !!user }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Payments</h2>
          <p className="text-gray-600 mb-4">{error.response?.data?.message || 'Failed to load payments'}</p>
          <button 
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { totalEarned = 0, totalPaid = 0, pendingAmount = 0, pendingItems = [] } = data || {};

  return (
    <>
      <Helmet>
        <title>My Payments - Sportify Supplier</title>
        <meta name="description" content="View your earnings and payment history." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Earnings Report</h1>
              <p className="text-gray-600 mt-2">Track your total revenue and payout status</p>
            </div>
             <button 
                onClick={() => refetch()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earned</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatPrice(totalEarned)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatPrice(totalPaid)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Payout</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatPrice(pendingAmount)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Items */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pending Items for Payout</h2>
              {/* The "Request Payout for All" button is intentionally removed */}
            </div>
            <div className="p-6 overflow-x-auto">
              {pendingItems.length === 0 ? (
                <div className="text-center py-8 text-gray-600">No pending items. All delivered items have been paid out.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Net)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (Net)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingItems.map((item) => (
                      <tr key={`${item.orderId}-${item.itemId}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{item.orderNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(item.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{formatPrice(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupplierPayments;