import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { AlertTriangle, X, Bell, Package } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StockAlertNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  // Fetch low stock alerts
  const { data: alertsData, refetch } = useQuery(
    'stock-alerts-notification',
    async () => {
      const response = await axios.get('/inventory/low-stock');
      return response.data.products;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchOnWindowFocus: true,
    }
  );

  // Show notification if there are new alerts
  useEffect(() => {
    if (alertsData && alertsData.length > 0) {
      const newAlerts = alertsData.filter(alert => !dismissedAlerts.has(alert._id));
      if (newAlerts.length > 0 && !isOpen) {
        toast.error(`${newAlerts.length} product(s) are running low on stock!`, {
          duration: 6000,
          icon: '⚠️',
        });
      }
    }
  }, [alertsData, dismissedAlerts, isOpen]);

  const handleDismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const handleDismissAll = () => {
    if (alertsData) {
      const allAlertIds = alertsData.map(alert => alert._id);
      setDismissedAlerts(prev => new Set([...prev, ...allAlertIds]));
    }
    setIsOpen(false);
  };

  const activeAlerts = alertsData?.filter(alert => !dismissedAlerts.has(alert._id)) || [];

  if (!activeAlerts.length) {
    return null;
  }

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
        >
          <Bell className="h-6 w-6" />
          {activeAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeAlerts.length}
            </span>
          )}
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                    {activeAlerts.length}
                  </span>
                  <button
                    onClick={handleDismissAll}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {activeAlerts.map((alert) => (
                <div key={alert._id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <img
                        src={alert.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={alert.product?.name}
                        className="h-10 w-10 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {alert.product?.name}
                        </h4>
                        <button
                          onClick={() => handleDismissAlert(alert._id)}
                          className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        SKU: {alert.product?.sku}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Package className="h-3 w-3 text-red-600" />
                          <span className="text-sm font-semibold text-red-600">
                            {alert.currentStock}
                          </span>
                          <span className="text-xs text-gray-500">left</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {alert.minStockLevel}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-red-500 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min((alert.currentStock / alert.minStockLevel) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/admin/inventory?tab=alerts';
                  }}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  View All Alerts
                </button>
                <button
                  onClick={handleDismissAll}
                  className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-400 transition-colors"
                >
                  Dismiss All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default StockAlertNotification;

