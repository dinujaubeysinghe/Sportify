import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Clock,
  Eye,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const ReportGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [dateRange, setDateRange] = useState('last30days');

  useEffect(() => {
    // Simulate loading report data
    const loadReportData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReportData({
        totalReports: 15,
        generatedThisMonth: 8,
        reportTypes: [
          { id: 'sales', name: 'Sales Report', icon: DollarSign, color: 'green' },
          { id: 'inventory', name: 'Inventory Report', icon: BarChart3, color: 'blue' },
          { id: 'customer', name: 'Customer Report', icon: Users, color: 'purple' },
          { id: 'staff', name: 'Staff Report', icon: Users, color: 'orange' },
          { id: 'financial', name: 'Financial Report', icon: TrendingUp, color: 'red' },
          { id: 'orders', name: 'Orders Report', icon: ShoppingCart, color: 'indigo' }
        ],
        recentReports: [
          {
            id: 'RPT-001',
            name: 'Monthly Sales Report',
            type: 'sales',
            generatedBy: 'John Smith',
            generatedDate: '2024-01-15',
            status: 'completed',
            fileSize: '2.3 MB',
            downloadCount: 5,
            format: 'PDF'
          },
          {
            id: 'RPT-002',
            name: 'Inventory Status Report',
            type: 'inventory',
            generatedBy: 'Sarah Johnson',
            generatedDate: '2024-01-14',
            status: 'completed',
            fileSize: '1.8 MB',
            downloadCount: 3,
            format: 'Excel'
          },
          {
            id: 'RPT-003',
            name: 'Customer Analytics Report',
            type: 'customer',
            generatedBy: 'Mike Wilson',
            generatedDate: '2024-01-13',
            status: 'processing',
            fileSize: '0 MB',
            downloadCount: 0,
            format: 'PDF'
          },
          {
            id: 'RPT-004',
            name: 'Staff Performance Report',
            type: 'staff',
            generatedBy: 'Emily Davis',
            generatedDate: '2024-01-12',
            status: 'completed',
            fileSize: '3.1 MB',
            downloadCount: 8,
            format: 'PDF'
          },
          {
            id: 'RPT-005',
            name: 'Financial Summary Report',
            type: 'financial',
            generatedBy: 'David Brown',
            generatedDate: '2024-01-11',
            status: 'completed',
            fileSize: '4.2 MB',
            downloadCount: 12,
            format: 'Excel'
          }
        ],
        scheduledReports: [
          {
            id: 'SCH-001',
            name: 'Weekly Sales Report',
            type: 'sales',
            frequency: 'weekly',
            nextRun: '2024-01-22',
            recipients: ['admin@sportify.com', 'manager@sportify.com'],
            status: 'active'
          },
          {
            id: 'SCH-002',
            name: 'Monthly Inventory Report',
            type: 'inventory',
            frequency: 'monthly',
            nextRun: '2024-02-01',
            recipients: ['inventory@sportify.com'],
            status: 'active'
          },
          {
            id: 'SCH-003',
            name: 'Quarterly Financial Report',
            type: 'financial',
            frequency: 'quarterly',
            nextRun: '2024-04-01',
            recipients: ['finance@sportify.com', 'ceo@sportify.com'],
            status: 'paused'
          }
        ]
      });
      setIsLoading(false);
    };

    loadReportData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    const reportType = reportData?.reportTypes.find(rt => rt.id === type);
    if (reportType) {
      const IconComponent = reportType.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getTypeColor = (type) => {
    const reportType = reportData?.reportTypes.find(rt => rt.id === type);
    return reportType ? `text-${reportType.color}-600` : 'text-gray-600';
  };

  const filteredReports = reportData?.recentReports.filter(report => {
    return selectedReportType === 'all' || report.type === selectedReportType;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Report Generation - Sportify Staff</title>
        <meta name="description" content="Generate and manage business reports." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Report Generation</h1>
                <p className="text-gray-600 mt-2">
                  Generate and manage business reports
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Report
                </button>
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {reportData?.totalReports || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {reportData?.generatedThisMonth || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {reportData?.scheduledReports.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-100">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {reportData?.recentReports.filter(r => r.status === 'processing').length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Types */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Types</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {reportData?.reportTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedReportType(type.id)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedReportType === type.id
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <IconComponent className={`h-6 w-6 mb-2 ${
                        selectedReportType === type.id ? `text-${type.color}-600` : 'text-gray-600'
                      }`} />
                      <span className={`text-sm font-medium ${
                        selectedReportType === type.id ? `text-${type.color}-700` : 'text-gray-700'
                      }`}>
                        {type.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
                <div className="flex space-x-2">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1"
                  >
                    <option value="last7days">Last 7 days</option>
                    <option value="last30days">Last 30 days</option>
                    <option value="last90days">Last 90 days</option>
                    <option value="all">All time</option>
                  </select>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Filter
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Downloads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports?.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getTypeIcon(report.type)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{report.name}</div>
                            <div className="text-sm text-gray-500">ID: {report.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getTypeColor(report.type)}`}>
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.generatedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(report.generatedDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.format}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.downloadCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-700">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-700">
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-700">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scheduled Reports */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Scheduled Reports</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Manage Schedules
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {reportData?.scheduledReports.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{schedule.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {schedule.frequency} • Next run: {formatDate(schedule.nextRun)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Recipients: {schedule.recipients.join(', ')}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button className="text-blue-600 hover:text-blue-700">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportGeneration;
