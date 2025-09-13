import { useQuery } from 'react-query';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  Eye
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../ui/LoadingSpinner';

const InventoryDashboardWidget = ({ userRole = 'admin', compact = false }) => {
  // Fetch inventory summary based on user role
  const { data: summary, isLoading } = useQuery(
    `inventory-summary-${userRole}`,
    async () => {
      const endpoint = userRole === 'supplier' ? '/inventory/supplier/summary' : '/inventory/summary';
      const response = await axios.get(endpoint);
      return response.data.summary;
    }
  );

  // Fetch low stock alerts
  const { data: lowStockData } = useQuery(
    `low-stock-${userRole}`,
    async () => {
      const endpoint = userRole === 'supplier' ? '/inventory/supplier/low-stock' : '/inventory/low-stock';
      const response = await axios.get(endpoint);
      return response.data.products;
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const metrics = [
    {
      title: userRole === 'supplier' ? 'My Products' : 'Total Products',
      value: summary?.totalProducts || 0,
      icon: Package,
      color: 'blue',
      change: summary?.productChange || 0,
      changeType: summary?.productChange >= 0 ? 'increase' : 'decrease'
    },
    {
      title: 'Total Stock',
      value: summary?.totalStock || 0,
      icon: TrendingUp,
      color: 'green',
      change: summary?.stockChange || 0,
      changeType: summary?.stockChange >= 0 ? 'increase' : 'decrease'
    },
    {
      title: 'Low Stock',
      value: summary?.lowStockCount || 0,
      icon: AlertTriangle,
      color: 'yellow',
      change: summary?.lowStockChange || 0,
      changeType: summary?.lowStockChange >= 0 ? 'increase' : 'decrease'
    },
    {
      title: 'Out of Stock',
      value: summary?.outOfStockCount || 0,
      icon: Package,
      color: 'red',
      change: summary?.outOfStockChange || 0,
      changeType: summary?.outOfStockChange >= 0 ? 'increase' : 'decrease'
    }
  ];

  if (userRole !== 'supplier') {
    metrics.push({
      title: 'Inventory Value',
      value: `$${(summary?.totalValue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'purple',
      change: summary?.valueChange || 0,
      changeType: summary?.valueChange >= 0 ? 'increase' : 'decrease'
    });
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200'
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        border: 'border-yellow-200'
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-200'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200'
      }
    };
    return colors[color] || colors.blue;
  };

  const getChangeIcon = (changeType) => {
    return changeType === 'increase' ? TrendingUp : TrendingDown;
  };

  const getChangeColor = (changeType) => {
    return changeType === 'increase' ? 'text-green-600' : 'text-red-600';
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Inventory Overview</h3>
          <button
            onClick={() => window.location.href = userRole === 'supplier' ? '/supplier/inventory' : '/admin/inventory'}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {metrics.slice(0, 4).map((metric, index) => {
            const colors = getColorClasses(metric.color);
            const ChangeIcon = getChangeIcon(metric.changeType);
            
            return (
              <div key={index} className="text-center">
                <div className={`inline-flex p-2 rounded-lg ${colors.bg} mb-2`}>
                  <metric.icon className={`h-5 w-5 ${colors.text}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.title}</div>
                {metric.change !== 0 && (
                  <div className={`text-xs flex items-center justify-center mt-1 ${getChangeColor(metric.changeType)}`}>
                    <ChangeIcon className="h-3 w-3 mr-1" />
                    {Math.abs(metric.change)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {lowStockData && lowStockData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-900">
                  {lowStockData.length} Low Stock Alert{lowStockData.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => window.location.href = `${userRole === 'supplier' ? '/supplier' : '/admin'}/inventory?tab=alerts`}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                View All
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {metrics.map((metric, index) => {
          const colors = getColorClasses(metric.color);
          const ChangeIcon = getChangeIcon(metric.changeType);
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${colors.bg}`}>
                  <metric.icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                  {metric.change !== 0 && (
                    <p className={`text-sm flex items-center ${getChangeColor(metric.changeType)}`}>
                      <ChangeIcon className="h-4 w-4 mr-1" />
                      {Math.abs(metric.change)} from last period
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Alerts */}
      {lowStockData && lowStockData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                  {lowStockData.length}
                </span>
              </div>
              <button
                onClick={() => window.location.href = `${userRole === 'supplier' ? '/supplier' : '/admin'}/inventory?tab=alerts`}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All Alerts
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockData.slice(0, 6).map((item) => (
                <div key={item._id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {item.product?.name}
                    </h4>
                    <span className="text-sm font-semibold text-red-600">
                      {item.currentStock}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">SKU: {item.product?.sku}</p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Min: {item.minStockLevel}</span>
                    <span className="text-red-600 font-medium">
                      {((item.currentStock / item.minStockLevel) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-red-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min((item.currentStock / item.minStockLevel) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => window.location.href = `${userRole === 'supplier' ? '/supplier' : '/admin'}/inventory?tab=products`}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Package className="h-6 w-6 text-blue-600 mb-2" />
            <div className="font-medium text-gray-900">View All Products</div>
            <div className="text-sm text-gray-600">Manage inventory items</div>
          </button>
          
          <button
            onClick={() => window.location.href = `${userRole === 'supplier' ? '/supplier' : '/admin'}/inventory?tab=analytics`}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Activity className="h-6 w-6 text-green-600 mb-2" />
            <div className="font-medium text-gray-900">View Analytics</div>
            <div className="text-sm text-gray-600">Stock reports & insights</div>
          </button>
          
          {userRole !== 'supplier' && (
            <button
              onClick={() => window.location.href = '/admin/inventory?tab=reports'}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
              <div className="font-medium text-gray-900">Generate Reports</div>
              <div className="text-sm text-gray-600">Export inventory data</div>
            </button>
          )}
          
          <button
            onClick={() => window.location.href = `${userRole === 'supplier' ? '/supplier' : '/admin'}/products`}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Package className="h-6 w-6 text-orange-600 mb-2" />
            <div className="font-medium text-gray-900">Manage Products</div>
            <div className="text-sm text-gray-600">Add or edit products</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboardWidget;

