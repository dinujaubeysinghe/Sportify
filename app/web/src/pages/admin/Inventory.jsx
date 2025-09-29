import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import Logo from '/SportifyLogo.png';
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
import { Line } from 'react-chartjs-2';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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

// -------------------
// Loader
// -------------------
const LoadingSpinner = ({ size = 'md' }) => (
  <div className={`spinner ${size}`}>Loading...</div>
);

// -------------------
// Stock Movement Modal
// -------------------
const StockHistoryModal = ({ product, closeModal }) => {
  if (!product) return null;

  // Example: Use product.stockHistory or generate from inventory data
  const history = product.stockHistory || product.history || []; 
  const chartData = {
    labels: history.map(h => new Date(h.date).toLocaleDateString()),
    datasets: [
      {
        label: "Stock Quantity",
        data: history.map(h => h.quantity),
        borderColor: "#3b82f6",
        backgroundColor: "#60a5fa",
      },
    ],
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Stock Movement History - ${product.product.name}`, 14, 16);

    autoTable(doc, {
      startY: 20,
      head: [["Date", "Quantity"]],
      body: history.map(h => [new Date(h.date).toLocaleDateString(), h.quantity])
    });

    doc.save(`${product.product.name}_stock_history.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-10">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Stock Movement History</h3>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {history.length > 0 ? (
          <>
            <div className="mb-4">
              <Line data={chartData} />
            </div>
            <button
              onClick={downloadPDF}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
            >
              <Download className="h-4 w-4 mr-1" /> Download PDF
            </button>
          </>
        ) : (
          <p>No stock movement history available.</p>
        )}
      </div>
    </div>
  );
};

// -------------------
// Main AdminInventory
// -------------------
const AdminInventory = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
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
  // Reports
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

  // Frontend PDF for stock history
const generatePDFReport = () => {
  if (!inventoryData?.inventory?.length) {
    toast.error("No inventory data available to generate report");
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(16);

  // Add logo (x, y, width, height)
  const imgProps = doc.getImageProperties(Logo);
  const logoWidth = 40;
  const logoHeight = (imgProps.height * logoWidth) / imgProps.width;
  doc.addImage(Logo, "PNG", 14, 10, logoWidth, logoHeight);

  // Report title
  doc.text("Inventory Stock Report", 70, 25);

  // Table columns and rows
  const tableColumn = ["Product", "SKU", "Current Stock", "Min Stock", "Status"];
  const tableRows = inventoryData.inventory.map(item => [
    item.product.name,
    item.product.sku,
    item.currentStock,
    item.minStockLevel,
    getStockStatusText(item.status)
  ]);

  autoTable(doc, {
    startY: 35,
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  // Add signature and date at the bottom
  const finalY = doc.lastAutoTable.finalY || 50;
  doc.setFontSize(12);
  doc.text("Signature: _______________________", 14, finalY + 20);
  const today = new Date();
  doc.text(`Date: ${today.toLocaleDateString()}`, 150, finalY + 20);

  doc.save("inventory_stock_report.pdf");
  toast.success("PDF report generated successfully!");
};

  // -------------------
  // Render
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
                {['overview', 'products', 'alerts', 'reports'].map((tabId) => (
                  <TabButton key={tabId} id={tabId} activeTab={activeTab} setActiveTab={setActiveTab} />
                ))}
              </nav>
            </div>
            <div className="p-6">
              {activeTab === 'overview' && <OverviewTab summary={summary} lowStockProducts={lowStockProducts} stockTrendData={stockTrendData} handleStockAction={handleStockAction} />}
              {activeTab === 'products' && <ProductsTab inventoryData={inventoryData} handleStockAction={handleStockAction} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} getStockStatusColor={getStockStatusColor} getStockStatusText={getStockStatusText} setSelectedProduct={setSelectedProduct} setShowStockModal={setShowStockModal} />}
              {activeTab === 'alerts' && <AlertsTab lowStockProducts={lowStockProducts} handleStockAction={handleStockAction} />}
              {activeTab === 'analytics' && <AnalyticsTab stockTrendData={stockTrendData} />}
              {activeTab === 'reports' && <ReportsTab generateCSVReport={generateCSVReport} generatePDFReport={generatePDFReport} />}
            </div>
          </div>

          {/* Stock Modal */}
          {showStockModal && selectedProduct && (
            <StockHistoryModal product={selectedProduct} closeModal={() => setShowStockModal(false)} />
          )}
        </div>
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
    reports: 'Reports'
  };
  const icons = { overview: BarChart3, products: Package, alerts: AlertTriangle, analytics: TrendingUp, reports: Download };
  const Icon = icons[id];
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
    >
      <Icon className="h-4 w-4 mr-2" /> {labels[id]}
    </button>
  );
};

// -------------------
// Overview Tab
// -------------------
const OverviewTab = ({ summary, lowStockProducts, stockTrendData, handleStockAction }) => (
  <div className="space-y-6">
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Stock Movements</h3>
      <Line data={stockTrendData} />
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
  getStockStatusText,
  setSelectedProduct,
  setShowStockModal
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
             
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// -------------------
// Analytics Tab
// -------------------
const AnalyticsTab = ({ stockTrendData }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Trends</h3>
    <div className="bg-white p-4 rounded shadow">
      <Line data={stockTrendData} />
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

// -------------------
// Reports Tab
// -------------------
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
