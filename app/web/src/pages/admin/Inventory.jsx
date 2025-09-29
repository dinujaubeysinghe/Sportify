import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  Minus, 
  Edit,
  Search,
  Filter,
  Download,
  Eye,
  BarChart3,
  RefreshCw,
  X,
  CheckCircle 
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StockMovementHistory from '../../components/inventory/StockMovementHistory';
import InventoryAnalytics from '../../components/inventory/InventoryAnalytics';
import CategoryManagement from '../../components/inventory/CategoryManagement';
import InventoryReports from '../../components/inventory/InventoryReports';
import BulkStockUpdate from '../../components/inventory/BulkStockUpdate';
import StockForecasting from '../../components/inventory/StockForecasting';
import toast from 'react-hot-toast';

const AdminInventory = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [stockAction, setStockAction] = useState('add');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const queryClient = useQueryClient();

  // Fetch inventory summary
  const { data: summary, isLoading: summaryLoading } = useQuery(
    'inventory-summary',
    async () => {
      const response = await axios.get('/inventory/summary');
      return response.data.summary;
    }
  );

  // Fetch low stock products
  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery(
    'low-stock-products',
    async () => {
      const response = await axios.get('/inventory/low-stock');
      return response.data.products;
    }
  );

  // Fetch all inventory items
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery(
    ['inventory-items', searchQuery, filterStatus],
    async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterStatus !== 'all') params.append('isLowStock', filterStatus === 'low');
      
      const response = await axios.get(`/inventory?${params.toString()}`);
      return response.data;
    }
  );

  // Stock adjustment form
  const {
    register: registerStock,
    handleSubmit: handleStockSubmit,
    formState: { errors: stockErrors },
    reset: resetStock,
    setValue: setStockValue
  } = useForm();

  // Stock adjustment mutation
  const stockMutation = useMutation(
    async (data) => {
      const { productId, action, quantity, reason, cost, notes } = data;
      
      if (action === 'add') {
        return axios.post(`/inventory/${productId}/add-stock`, {
          quantity,
          reason,
          cost,
          notes
        });
      } else if (action === 'remove') {
        return axios.post(`/inventory/${productId}/remove-stock`, {
          quantity,
          reason,
          notes
        });
      } else if (action === 'adjust') {
        return axios.post(`/inventory/${productId}/adjust-stock`, {
          newQuantity: quantity,
          reason,
          notes
        });
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory-summary');
        queryClient.invalidateQueries('low-stock-products');
        queryClient.invalidateQueries('inventory-items');
        setShowStockModal(false);
        resetStock();
        toast.success('Stock updated successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update stock');
      }
    }
  );

  const handleStockAction = (product, action) => {
    setSelectedProduct(product);
    setStockAction(action);
    setShowStockModal(true);
    
    if (action === 'adjust') {
      setStockValue('quantity', product.currentStock);
    } else {
      setStockValue('quantity', 1);
    }
  };

  const onStockSubmit = (data) => {
    stockMutation.mutate({
      productId: selectedProduct.product._id,
      action: stockAction,
      ...data
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStockStatusText = (status) => {
    switch (status) {
      case 'out-of-stock':
        return 'Out of Stock';
      case 'low-stock':
        return 'Low Stock';
      default:
        return 'In Stock';
    }
  };

  if (summaryLoading || lowStockLoading || inventoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Inventory Management - Sportify Admin</title>
        <meta name="description" content="Manage inventory in the Sportify e-commerce platform." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-gray-600 mt-2">Track stock levels and manage inventory</p>
              </div>
              <div className="flex space-x-3">
                {/* <button 
                  onClick={() => setShowBulkUpdateModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Bulk Update
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button> */}
                <button 
                  onClick={() => queryClient.invalidateQueries()}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-semibold text-gray-900">{summary?.totalProducts || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Stock</p>
                  <p className="text-2xl font-semibold text-gray-900">{summary?.totalStock || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-semibold text-gray-900">{summary?.lowStockCount || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100">
                  <Package className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-semibold text-gray-900">{summary?.outOfStockCount || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'products', label: 'All Products', icon: Package },
                  { id: 'alerts', label: 'Low Stock Alerts', icon: AlertTriangle },
                  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                  { id: 'forecasting', label: 'Forecasting', icon: TrendingUp },
                  { id: 'categories', label: 'Categories', icon: Package },
                  { id: 'reports', label: 'Reports', icon: Download }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Low Stock Alerts */}
                  {lowStockProducts && lowStockProducts.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lowStockProducts.slice(0, 6).map((item) => (
                          <div key={item._id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                              <span className="text-sm font-semibold text-red-600">{item.currentStock}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">SKU: {item.product?.sku}</p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStockAction(item, 'add')}
                                className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                              >
                                Add Stock
                              </button>
                              <button
                                onClick={() => handleStockAction(item, 'adjust')}
                                className="flex-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                              >
                                Adjust
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Stock Movements */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Stock Movements</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600 text-center">Recent stock movements will be displayed here</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-6">
                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Products</option>
                      <option value="low">Low Stock</option>
                      <option value="out">Out of Stock</option>
                    </select>
                  </div>

                  {/* Products Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SKU
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Min Level
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventoryData?.inventory?.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50">
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.product?.sku}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.currentStock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.minStockLevel}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(item.stockStatus)}`}>
                                {getStockStatusText(item.stockStatus)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStockAction(item, 'add')}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Add Stock"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleStockAction(item, 'remove')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Remove Stock"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleStockAction(item, 'adjust')}
                                  className="text-gray-600 hover:text-gray-900"
                                  title="Adjust Stock"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedProduct(item);
                                    setShowHistoryModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                  title="View History"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'alerts' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
                  {lowStockProducts && lowStockProducts.length > 0 ? (
                    <div className="space-y-4">
                      {lowStockProducts.map((item) => (
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
                                <p className="text-sm text-gray-600">Brand: {item.product?.brand}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-red-600">{item.currentStock}</p>
                              <p className="text-sm text-gray-600">in stock</p>
                              <p className="text-sm text-gray-600">Min: {item.minStockLevel}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStockAction(item, 'add')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Add Stock
                              </button>
                              <button
                                onClick={() => handleStockAction(item, 'adjust')}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                              >
                                Adjust
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">All Good!</h3>
                      <p className="text-gray-600">No low stock alerts at this time.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <InventoryAnalytics />
              )}

              {activeTab === 'forecasting' && (
                <StockForecasting />
              )}

              {activeTab === 'categories' && (
                <CategoryManagement />
              )}

              {activeTab === 'reports' && (
                <InventoryReports />
              )}
            </div>
          </div>
        </div>

        {/* Stock Adjustment Modal */}
        {showStockModal && selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {stockAction === 'add' && 'Add Stock'}
                  {stockAction === 'remove' && 'Remove Stock'}
                  {stockAction === 'adjust' && 'Adjust Stock'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Product: {selectedProduct.product?.name}
                </p>

                <form onSubmit={handleStockSubmit(onStockSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {stockAction === 'adjust' ? 'New Quantity' : 'Quantity'}
                    </label>
                    <input
                      {...registerStock('quantity', { 
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Quantity must be at least 1' }
                      })}
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {stockErrors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{stockErrors.quantity.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason *
                    </label>
                    <select
                      {...registerStock('reason', { required: 'Reason is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a reason</option>
                      <option value="restock">Restock</option>
                      <option value="purchase">Purchase</option>
                      <option value="return">Return</option>
                      <option value="damage">Damage</option>
                      <option value="theft">Theft</option>
                      <option value="adjustment">Inventory Adjustment</option>
                      <option value="other">Other</option>
                    </select>
                    {stockErrors.reason && (
                      <p className="mt-1 text-sm text-red-600">{stockErrors.reason.message}</p>
                    )}
                  </div>

                  {stockAction === 'add' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost per Unit
                      </label>
                      <input
                        {...registerStock('cost')}
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      {...registerStock('notes')}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={stockMutation.isLoading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {stockMutation.isLoading ? 'Processing...' : 'Update Stock'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowStockModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Stock Movement History Modal */}
        {showHistoryModal && selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Stock Movement History
                  </h3>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <StockMovementHistory 
                  productId={selectedProduct.product._id}
                  productName={selectedProduct.product.name}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bulk Stock Update Modal */}
        {showBulkUpdateModal && (
          <BulkStockUpdate onClose={() => setShowBulkUpdateModal(false)} />
        )}
      </div>
    </>
  );
};

export default AdminInventory;
