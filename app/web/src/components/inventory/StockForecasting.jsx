import { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Package,
  AlertTriangle,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import axios from 'axios';
import LoadingSpinner from '../ui/LoadingSpinner';

const StockForecasting = () => {
  const [forecastPeriod, setForecastPeriod] = useState('30');
  const [selectedProduct, setSelectedProduct] = useState('all');

  // Fetch forecasting data
  const { data: forecastData, isLoading } = useQuery(
    ['stock-forecasting', forecastPeriod, selectedProduct],
    async () => {
      const params = new URLSearchParams();
      params.append('period', forecastPeriod);
      if (selectedProduct !== 'all') params.append('productId', selectedProduct);
      
      const response = await axios.get(`/inventory/forecasting?${params.toString()}`);
      return response.data;
    }
  );

  // Fetch products for selection
  const { data: productsData } = useQuery(
    'products-for-forecasting',
    async () => {
      const response = await axios.get('/products?limit=100');
      return response.data.products;
    }
  );

  // Sample data for demonstration (replace with real API data)
  const sampleForecastData = [
    { date: '2024-01-01', current: 100, predicted: 95, demand: 5 },
    { date: '2024-01-02', current: 95, predicted: 88, demand: 7 },
    { date: '2024-01-03', current: 88, predicted: 82, demand: 6 },
    { date: '2024-01-04', current: 82, predicted: 75, demand: 7 },
    { date: '2024-01-05', current: 75, predicted: 68, demand: 7 },
    { date: '2024-01-06', current: 68, predicted: 60, demand: 8 },
    { date: '2024-01-07', current: 60, predicted: 52, demand: 8 },
    { date: '2024-01-08', current: 52, predicted: 45, demand: 7 },
    { date: '2024-01-09', current: 45, predicted: 38, demand: 7 },
    { date: '2024-01-10', current: 38, predicted: 30, demand: 8 }
  ];

  const sampleProductForecasts = [
    {
      product: { name: 'Nike Air Max', sku: 'NIKE001' },
      currentStock: 45,
      predictedStock: 12,
      daysUntilLowStock: 8,
      recommendedOrder: 50,
      confidence: 85
    },
    {
      product: { name: 'Adidas Football', sku: 'ADIDAS001' },
      currentStock: 23,
      predictedStock: 5,
      daysUntilLowStock: 5,
      recommendedOrder: 30,
      confidence: 92
    },
    {
      product: { name: 'Wilson Tennis Racket', sku: 'WILSON001' },
      currentStock: 67,
      predictedStock: 45,
      daysUntilLowStock: 15,
      recommendedOrder: 25,
      confidence: 78
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stock Forecasting</h2>
          <p className="text-gray-600 mt-1">Predict future stock levels and demand patterns</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Forecast
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Period</label>
            <select
              value={forecastPeriod}
              onChange={(e) => setForecastPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Next 7 days</option>
              <option value="14">Next 14 days</option>
              <option value="30">Next 30 days</option>
              <option value="60">Next 60 days</option>
              <option value="90">Next 90 days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Products</option>
              {productsData?.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Model</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="moving-average">Moving Average</option>
              <option value="exponential-smoothing">Exponential Smoothing</option>
              <option value="seasonal">Seasonal Decomposition</option>
              <option value="arima">ARIMA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Daily Demand</p>
              <p className="text-2xl font-semibold text-gray-900">7.2</p>
              <p className="text-sm text-green-600">+12% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Products at Risk</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
              <p className="text-sm text-red-600">+3 from last week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Days to Reorder</p>
              <p className="text-2xl font-semibold text-gray-900">8.5</p>
              <p className="text-sm text-gray-600">days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Forecast Accuracy</p>
              <p className="text-2xl font-semibold text-gray-900">87%</p>
              <p className="text-sm text-green-600">+2% improvement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Level Forecast</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={sampleForecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Current Stock"
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#EF4444" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Predicted Stock"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Demand Pattern Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand Pattern Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sampleForecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="demand" fill="#10B981" name="Daily Demand" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Product Forecasts Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Product Forecasts</h3>
          <p className="text-gray-600 mt-1">Individual product stock predictions and recommendations</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Predicted Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Until Low
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recommended Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleProductForecasts.map((forecast, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{forecast.product.name}</div>
                      <div className="text-sm text-gray-500">{forecast.product.sku}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {forecast.currentStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {forecast.predictedStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      forecast.daysUntilLowStock <= 7 
                        ? 'bg-red-100 text-red-800' 
                        : forecast.daysUntilLowStock <= 14 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {forecast.daysUntilLowStock} days
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {forecast.recommendedOrder} units
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            forecast.confidence >= 90 
                              ? 'bg-green-500' 
                              : forecast.confidence >= 75 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${forecast.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{forecast.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Create PO
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forecast Insights */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">High Demand Products</h4>
              </div>
              <p className="text-sm text-blue-800">
                Nike Air Max and Adidas Football are showing increased demand patterns. 
                Consider increasing safety stock levels by 20%.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">Seasonal Trends</h4>
              </div>
              <p className="text-sm text-yellow-800">
                Tennis equipment shows 15% higher demand during summer months. 
                Plan inventory accordingly for the upcoming season.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">Optimization Opportunities</h4>
              </div>
              <p className="text-sm text-green-800">
                Golf equipment has low turnover. Consider reducing stock levels 
                and implementing just-in-time ordering.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">Forecast Accuracy</h4>
              </div>
              <p className="text-sm text-purple-800">
                Overall forecast accuracy is 87%. Machine learning models are 
                performing well with current data patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockForecasting;

