import { useQuery } from 'react-query';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  DollarSign,
  Activity
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../ui/LoadingSpinner';

const InventoryAnalytics = () => {
  // Fetch inventory analytics data
  const { data: analyticsData, isLoading } = useQuery(
    'inventory-analytics',
    async () => {
      const response = await axios.get('/admin/reports?type=inventory');
      return response.data.report;
    }
  );

  // Sample data for charts (replace with real data from API)
  const stockLevelData = [];

  const categoryStockData = [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
              <p className="text-2xl font-semibold text-gray-900">$67,000</p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12% from last month
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Turnover</p>
              <p className="text-2xl font-semibold text-gray-900">4.2x</p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +0.3 from last month
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
              <p className="text-sm text-red-600 flex items-center">
                <TrendingDown className="h-4 w-4 mr-1" />
                +3 from last week
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Stock Movement</p>
              <p className="text-2xl font-semibold text-gray-900">156</p>
              <p className="text-sm text-gray-600">units/day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock Level Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockLevelData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {stockLevelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {stockLevelData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Movement Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Movement Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stockMovementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="stockIn" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Stock In"
              />
              <Line 
                type="monotone" 
                dataKey="stockOut" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Stock Out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Stock Analysis */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryStockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Bar yAxisId="left" dataKey="stock" fill="#3B82F6" name="Stock Units" />
            <Bar yAxisId="right" dataKey="value" fill="#10B981" name="Value ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products by Stock Value */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Stock Value</h3>
        <div className="space-y-4">
          {topProductsData.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.stock} units in stock</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${product.value.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Value</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Low Stock Alert</p>
              <p className="text-sm text-gray-600">12 products are running low on stock</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View Details
            </button>
          </div>
          
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <Package className="h-5 w-5 text-red-600 mr-3" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Out of Stock</p>
              <p className="text-sm text-gray-600">3 products are completely out of stock</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View Details
            </button>
          </div>
          
          <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">High Movement</p>
              <p className="text-sm text-gray-600">5 products have high stock movement this week</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalytics;
