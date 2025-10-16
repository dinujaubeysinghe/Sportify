import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  Search,
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Eye,
  RefreshCw,
  Settings,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PageLayout from '../../components/layout/PageLayout';

const ReportGeneration = () => {
  const [selectedReportType, setSelectedReportType] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    format: 'pdf'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const queryClient = useQueryClient();

  // Get today's date for default date range
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getLastMonthDate = () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return lastMonth.toISOString().split('T')[0];
  };

  // Report types configuration
  const reportTypes = [
    {
      id: 'staff',
      name: 'Staff Management Report',
      description: 'Comprehensive staff information, departments, and performance metrics',
      icon: Users,
      color: 'bg-blue-500',
      categories: ['HR', 'Management', 'Performance']
    },
    {
      id: 'inventory',
      name: 'Inventory Report',
      description: 'Product stock levels, low stock alerts, and inventory movements',
      icon: Package,
      color: 'bg-green-500',
      categories: ['Inventory', 'Stock', 'Products']
    },
    {
      id: 'sales',
      name: 'Sales Report',
      description: 'Sales performance, revenue analysis, and customer metrics',
      icon: TrendingUp,
      color: 'bg-purple-500',
      categories: ['Sales', 'Revenue', 'Performance']
    },
    {
      id: 'orders',
      name: 'Orders Report',
      description: 'Order processing, fulfillment status, and delivery metrics',
      icon: ShoppingCart,
      color: 'bg-orange-500',
      categories: ['Orders', 'Fulfillment', 'Delivery']
    },
    {
      id: 'financial',
      name: 'Financial Report',
      description: 'Revenue, expenses, profit margins, and financial analytics',
      icon: BarChart3,
      color: 'bg-red-500',
      categories: ['Finance', 'Revenue', 'Analytics']
    }
  ];

  // Fetch departments for filtering
  const { data: departmentsData } = useQuery(
    'departments',
    async () => {
      const response = await axios.get('/admin/departments');
      return response.data;
    }
  );

  // Generate report mutation
  const generateReportMutation = useMutation(
    async (reportData) => {
      const response = await axios.post('/admin/reports/generate', reportData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Report generated successfully!');
        setGeneratedReports(prev => [data, ...prev]);
        setIsGenerating(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to generate report');
        setIsGenerating(false);
      }
    }
  );

  // Download report mutation
  const downloadReportMutation = useMutation(
    async (reportId) => {
      const response = await axios.get(`/admin/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    },
    {
      onSuccess: (data, reportId) => {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report-${reportId}.${filters.format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Report downloaded successfully!');
      },
      onError: (error) => {
        toast.error('Failed to download report');
      }
    }
  );

  // Handle report generation
  const handleGenerateReport = () => {
    if (!selectedReportType) {
      toast.error('Please select a report type');
      return;
    }

    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('Please select date range');
      return;
    }

    setIsGenerating(true);
    generateReportMutation.mutate({
      type: selectedReportType,
      dateRange,
      filters,
      format: filters.format
    });
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle date range change
  const handleDateRangeChange = (key, value) => {
    setDateRange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Get status color for reports
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const departments = departmentsData?.departments || [];

  return (
    <PageLayout 
      title="Report Generation"
      description="Generate comprehensive reports for your business analytics and insights."
    >
      <div className="space-y-6">
        {/* Report Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Report Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReportType(report.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedReportType === report.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg ${report.color} text-white mr-3`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {report.categories.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Report Configuration */}
        {selectedReportType && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Report Configuration</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                      max={getTodayDate()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                      max={getTodayDate()}
                      min={dateRange.startDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <select
                  value={filters.format}
                  onChange={(e) => handleFilterChange('format', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="csv">CSV File</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      value={filters.department}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || !dateRange.startDate || !dateRange.endDate}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Generated Reports History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reports</h2>
          
          {generatedReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generatedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {reportTypes.find(rt => rt.id === report.type)?.name || 'Unknown Report'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {report.format.toUpperCase()} • {report.size || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(report.dateRange.start)} - {formatDate(report.dateRange.end)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {getStatusText(report.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.generatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => downloadReportMutation.mutate(report.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download Report"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="View Report"
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
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Generated</h3>
              <p className="text-gray-600">Generate your first report to see it here.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ReportGeneration;
