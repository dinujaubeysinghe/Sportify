import { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Download, 
  Calendar, 
  Filter, 
  FileText, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../ui/LoadingSpinner';

const InventoryReports = () => {
  const [reportType, setReportType] = useState('stock-summary');
  const [dateRange, setDateRange] = useState('30');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch report data
  const { data: reportData, isLoading } = useQuery(
    ['inventory-report', reportType, dateRange, categoryFilter, statusFilter],
    async () => {
      const params = new URLSearchParams();
      params.append('type', reportType);
      params.append('dateRange', dateRange);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await axios.get(`/admin/reports/inventory?${params.toString()}`);
      return response.data.report;
    }
  );

  // Fetch categories for filter
  const { data: categoriesData } = useQuery(
    'categories-for-filter',
    async () => {
      const response = await axios.get('/admin/categories');
      return response.data.categories;
    }
  );

  const handleExport = async (format) => {
    setIsGenerating(true);
    try {
      const params = new URLSearchParams();
      params.append('type', reportType);
      params.append('dateRange', dateRange);
      params.append('format', format);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await axios.get(`/admin/reports/inventory/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-report-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const reportTypes = [
    { id: 'stock-summary', name: 'Stock Summary', icon: Package },
    { id: 'low-stock', name: 'Low Stock Alert', icon: AlertTriangle },
    { id: 'movement', name: 'Stock Movement', icon: TrendingUp },
    { id: 'valuation', name: 'Inventory Valuation', icon: DollarSign },
    { id: 'turnover', name: 'Stock Turnover', icon: BarChart3 }
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
          <h2 className="text-2xl font-bold text-gray-900">Inventory Reports</h2>
          <p className="text-gray-600 mt-1">Generate and export detailed inventory reports</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleExport('pdf')}
            disabled={isGenerating}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Export PDF'}
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={isGenerating}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categoriesData?.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          {reportType === 'stock-summary' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Stock Summary Report</h3>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600">Total Products</p>
                      <p className="text-2xl font-bold text-blue-900">{reportData?.summary?.totalProducts || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-green-600">Total Stock</p>
                      <p className="text-2xl font-bold text-green-900">{reportData?.summary?.totalStock || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm text-yellow-600">Low Stock</p>
                      <p className="text-2xl font-bold text-yellow-900">{reportData?.summary?.lowStockCount || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-sm text-red-600">Out of Stock</p>
                      <p className="text-2xl font-bold text-red-900">{reportData?.summary?.outOfStockCount || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData?.products?.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                              alt={item.product?.name}
                              className="h-10 w-10 object-cover rounded-lg mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.product?.name}</div>
                              <div className="text-sm text-gray-500">{item.product?.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.product?.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.product?.category?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.currentStock}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.minStockLevel}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.stockStatus === 'out-of-stock' ? 'bg-red-100 text-red-800' :
                            item.stockStatus === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.stockStatus === 'out-of-stock' ? 'Out of Stock' :
                             item.stockStatus === 'low-stock' ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === 'low-stock' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert Report</h3>
              
              {reportData?.lowStockProducts && reportData.lowStockProducts.length > 0 ? (
                <div className="space-y-4">
                  {reportData.lowStockProducts.map((item) => (
                    <div key={item._id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                            alt={item.product?.name}
                            className="h-12 w-12 object-cover rounded-lg"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                            <p className="text-sm text-gray-600">SKU: {item.product?.sku}</p>
                            <p className="text-sm text-gray-600">Category: {item.product?.category?.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-red-600">{item.currentStock}</p>
                          <p className="text-sm text-gray-600">in stock</p>
                          <p className="text-sm text-gray-600">Min: {item.minStockLevel}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Low Stock Items</h3>
                  <p className="text-gray-600">All products are well stocked!</p>
                </div>
              )}
            </div>
          )}

          {reportType === 'movement' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Stock Movement Report</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData?.movements?.map((movement) => (
                      <tr key={movement._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(movement.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {movement.product?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            movement.type === 'stock_in' ? 'bg-green-100 text-green-800' :
                            movement.type === 'stock_out' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {movement.type === 'stock_in' ? 'Stock In' :
                             movement.type === 'stock_out' ? 'Stock Out' : 'Adjustment'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {movement.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {movement.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {movement.performedBy?.firstName} {movement.performedBy?.lastName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === 'valuation' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Inventory Valuation Report</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600">Total Inventory Value</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatPrice(reportData?.valuation?.totalValue || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-green-600">Average Cost per Unit</p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatPrice(reportData?.valuation?.averageCost || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm text-purple-600">Total Units</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {reportData?.valuation?.totalUnits || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category-wise Valuation */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Units</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Cost</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData?.categoryValuation?.map((category) => (
                      <tr key={category._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {category.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {category.productCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {category.totalUnits}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(category.totalValue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(category.averageCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === 'turnover' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Stock Turnover Report</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600">Overall Turnover Rate</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {reportData?.turnover?.overallRate || 0}x
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-green-600">Average Days in Stock</p>
                      <p className="text-2xl font-bold text-green-900">
                        {reportData?.turnover?.averageDays || 0} days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Turnover Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnover Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days in Stock</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData?.productTurnover?.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                              alt={item.product?.name}
                              className="h-10 w-10 object-cover rounded-lg mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.product?.name}</div>
                              <div className="text-sm text-gray-500">{item.product?.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.product?.category?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.currentStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.unitsSold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.turnoverRate}x
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.daysInStock} days
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;
