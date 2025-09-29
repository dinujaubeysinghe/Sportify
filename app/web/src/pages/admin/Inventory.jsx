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
  Eye,
  BarChart3,
  RefreshCw,
  Download,
  X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Loader Component
const LoadingSpinner = ({ size = 'md' }) => (
  <div className={`spinner ${size}`}>Loading...</div>
);

// Stock History Component
const StockMovementHistory = ({ productId, productName }) => (
  <div>
    <p>Showing stock movements for {productName} (ID: {productId})</p>
    {/* You can implement a table or chart for stock movements here */}
  </div>
);

// -------------------
// Admin Inventory
// -------------------
const AdminInventory = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [stockAction, setStockAction] = useState('add');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  // -------------------
  // Fetch Data
  // -------------------
  const { data: summary, isLoading: summaryLoading } = useQuery('inventory-summary', async () => {
    const res = await axios.get('/inventory/summary');
    return res.data.summary;
  });

  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery('low-stock-products', async () => {
    const res = await axios.get('/inventory/low-stock');
    return res.data.products;
  });

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery(
    ['inventory-items', searchQuery, filterStatus],
    async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterStatus !== 'all') params.append('isLowStock', filterStatus === 'low');
      const res = await axios.get(`/inventory?${params.toString()}`);
      return res.data;
    },
    { keepPreviousData: true }
  );

  // -------------------
  // Stock Mutation
  // -------------------
  const stockMutation = useMutation(
    async (data) => {
      const { productId, action, quantity, reason, cost, notes } = data;
      if (action === 'add') return axios.post(`/inventory/${productId}/add-stock`, { quantity, reason, cost, notes });
      if (action === 'remove') return axios.post(`/inventory/${productId}/remove-stock`, { quantity, reason, notes });
      if (action === 'adjust') return axios.post(`/inventory/${productId}/adjust-stock`, { newQuantity: quantity, reason, notes });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory-summary');
        queryClient.invalidateQueries('low-stock-products');
        queryClient.invalidateQueries('inventory-items');
        setShowStockModal(false);
        reset();
        toast.success('Stock updated successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update stock');
      }
    }
  );

  // -------------------
  // Handlers
  // -------------------
  const handleStockAction = (product, action) => {
    setSelectedProduct(product);
    setStockAction(action);
    setShowStockModal(true);
    setStockValue('quantity', action === 'adjust' ? product.currentStock : 1);
  };

  const onStockSubmit = (data) => {
    stockMutation.mutate({
      productId: selectedProduct.product._id,
      action: stockAction,
      ...data
    });
  };

  const setStockValue = (field, value) => setValue(field, value);

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStockStatusText = (status) => {
    switch (status) {
      case 'out-of-stock': return 'Out of Stock';
      case 'low-stock': return 'Low Stock';
      default: return 'In Stock';
    }
  };

  if (summaryLoading || lowStockLoading || inventoryLoading) return (
    <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  );

  // -------------------
  // Analytics Data
  // -------------------
  const stockTrendData = {
    labels: inventoryData?.inventory?.map(item => item.product?.name),
    datasets: [
      {
        label: 'Current Stock',
        data: inventoryData?.inventory?.map(item => item.currentStock),
        borderColor: '#3b82f6',
        backgroundColor: '#60a5fa',
      },
      {
        label: 'Minimum Stock',
        data: inventoryData?.inventory?.map(item => item.minStockLevel),
        borderColor: '#f59e0b',
        backgroundColor: '#fbbf24',
      }
    ]
  };

  // -------------------
  // Reports Generation
  // -------------------
  const generateCSVReport = async () => {
    try {
      const res = await axios.get('/inventory/reports/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory_report.csv');
      document.body.appendChild(link);
      link.click();
      toast.success('CSV report downloaded!');
    } catch (error) {
      toast.error('Failed to generate CSV report');
    }
  };

  const generatePDFReport = async () => {
    try {
      const res = await axios.get('/inventory/reports/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory_report.pdf');
      document.body.appendChild(link);
      link.click();
      toast.success('PDF report downloaded!');
    } catch (error) {
      toast.error('Failed to generate PDF report');
    }
  };

  // -------------------
  // Main Render
  // -------------------
  return (
    <>
      <Helmet><title>Inventory Management - Admin</title></Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600 mt-2">View all suppliers' inventory in one place</p>
            </div>
            <button
              onClick={() => queryClient.invalidateQueries()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard title="Total Products" value={summary?.totalProducts || 0} icon={<Package className="h-6 w-6 text-blue-600" />} color="bg-blue-100" />
            <SummaryCard title="Total Stock" value={summary?.totalStock || 0} icon={<TrendingUp className="h-6 w-6 text-green-600" />} color="bg-green-100" />
            <SummaryCard title="Low Stock" value={summary?.lowStockCount || 0} icon={<AlertTriangle className="h-6 w-6 text-yellow-600" />} color="bg-yellow-100" />
            <SummaryCard title="Out of Stock" value={summary?.outOfStockCount || 0} icon={<Package className="h-6 w-6 text-red-600" />} color="bg-red-100" />
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {['overview', 'products', 'alerts', 'analytics', 'reports'].map((tabId) => (
                  <TabButton key={tabId} id={tabId} activeTab={activeTab} setActiveTab={setActiveTab} />
                ))}
              </nav>
            </div>
            <div className="p-6">
              {activeTab === 'overview' && <OverviewTab summary={summary} lowStockProducts={lowStockProducts} handleStockAction={handleStockAction} />}
              {activeTab === 'products' && <ProductsTab inventoryData={inventoryData} handleStockAction={handleStockAction} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} getStockStatusColor={getStockStatusColor} getStockStatusText={getStockStatusText} />}
              {activeTab === 'alerts' && <AlertsTab lowStockProducts={lowStockProducts} handleStockAction={handleStockAction} />}
              {activeTab === 'analytics' && <AnalyticsTab stockTrendData={stockTrendData} />}
              {activeTab === 'reports' && <ReportsTab generateCSVReport={generateCSVReport} generatePDFReport={generatePDFReport} />}
            </div>
          </div>
        </div>

        {/* Stock Modal */}
        {showStockModal && selectedProduct && (
          <StockModal
            selectedProduct={selectedProduct}
            stockAction={stockAction}
            register={register}
            errors={errors}
            handleSubmit={handleSubmit}
            onStockSubmit={onStockSubmit}
            setStockValue={setStockValue}
            closeModal={() => setShowStockModal(false)}
            isLoading={stockMutation.isLoading}
          />
        )}

        {/* Stock History Modal */}
        {showHistoryModal && selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Stock Movement History</h3>
                <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>
              <StockMovementHistory productId={selectedProduct.product._id} productName={selectedProduct.product.name} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// -------------------
// Helper Components
// -------------------
const SummaryCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const TabButton = ({ id, activeTab, setActiveTab }) => {
  const labels = {
    overview: 'Overview',
    products: 'All Products',
    alerts: 'Low Stock Alerts',
    analytics: 'Analytics & Forecasting',
    reports: 'Reports'
  };
  const icons = { overview: BarChart3, products: Package, alerts: AlertTriangle, analytics: TrendingUp, reports: Download };
  const Icon = icons[id];
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
        activeTab === id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className="h-4 w-4 mr-2" /> {labels[id]}
    </button>
  );
};

// -------------------
// Tabs
// -------------------
const OverviewTab = ({ summary, lowStockProducts, handleStockAction }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
      <SummaryCard title="Total Products" value={summary?.totalProducts || 0} icon={<Package className="h-6 w-6 text-blue-600" />} color="bg-blue-100" />
      <SummaryCard title="Total Stock" value={summary?.totalStock || 0} icon={<TrendingUp className="h-6 w-6 text-green-600" />} color="bg-green-100" />
      <SummaryCard title="Low Stock" value={summary?.lowStockCount || 0} icon={<AlertTriangle className="h-6 w-6 text-yellow-600" />} color="bg-yellow-100" />
      <SummaryCard title="Out of Stock" value={summary?.outOfStockCount || 0} icon={<Package className="h-6 w-6 text-red-600" />} color="bg-red-100" />
    </div>
    {lowStockProducts?.length > 0 && (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lowStockProducts.slice(0, 6).map(item => (
            <div key={item._id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                <span className="text-sm font-semibold text-red-600">{item.currentStock}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">SKU: {item.product?.sku}</p>
              <div className="flex space-x-2">
                <button onClick={() => handleStockAction(item, 'add')} className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Add Stock</button>
                <button onClick={() => handleStockAction(item, 'adjust')} className="flex-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">Adjust</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const AnalyticsTab = ({ stockTrendData }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Trends</h3>
    <div className="bg-white p-4 rounded shadow">
      <Line data={stockTrendData} />
    </div>
  </div>
);
// -------------------
// Products Tab
// -------------------
const ProductsTab = ({
  inventoryData,
  handleStockAction,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  getStockStatusColor,
  getStockStatusText
}) => (
  <div className="space-y-4">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search products..."
        className="border rounded px-3 py-2 w-full md:w-1/3"
      />
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="border rounded px-3 py-2 w-full md:w-1/4"
      >
        <option value="all">All Products</option>
        <option value="low">Low Stock</option>
        <option value="out">Out of Stock</option>
      </select>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">SKU</th>
            <th className="px-4 py-2">Current Stock</th>
            <th className="px-4 py-2">Min Stock</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventoryData?.inventory?.map((item) => (
            <tr key={item.product._id} className="border-b">
              <td className="px-4 py-2">{item.product.name}</td>
              <td className="px-4 py-2">{item.product.sku}</td>
              <td className="px-4 py-2">{item.currentStock}</td>
              <td className="px-4 py-2">{item.minStockLevel}</td>
              <td className={`px-4 py-2 font-semibold ${getStockStatusColor(item.status)}`}>
                {getStockStatusText(item.status)}
              </td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => handleStockAction(item, 'add')}
                  className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => handleStockAction(item, 'remove')}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm"
                >
                  Remove
                </button>
                <button
                  onClick={() => handleStockAction(item, 'adjust')}
                  className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 text-sm"
                >
                  Adjust
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// -------------------
// Alerts Tab
// -------------------
const AlertsTab = ({ lowStockProducts, handleStockAction }) => (
  <div className="space-y-4">
    {lowStockProducts?.length === 0 ? (
      <p className="text-gray-600">No low stock products.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lowStockProducts.map((item) => (
          <div key={item._id} className="border border-yellow-300 rounded p-4 bg-yellow-50">
            <h4 className="font-medium text-gray-900">{item.product.name}</h4>
            <p className="text-sm text-gray-600 mb-2">SKU: {item.product.sku}</p>
            <p className="text-sm font-semibold text-red-600">Stock: {item.currentStock}</p>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => handleStockAction(item, 'add')}
                className="flex-1 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm"
              >
                Add Stock
              </button>
              <button
                onClick={() => handleStockAction(item, 'adjust')}
                className="flex-1 bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 text-sm"
              >
                Adjust
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const ReportsTab = ({ generateCSVReport, generatePDFReport }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Inventory Reports</h3>
    <div className="flex space-x-4">
      <button onClick={generateCSVReport} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"><Download className="h-4 w-4 mr-1" />Download CSV</button>
      <button onClick={generatePDFReport} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"><Download className="h-4 w-4 mr-1" />Download PDF</button>
    </div>
  </div>
);

export default AdminInventory;
