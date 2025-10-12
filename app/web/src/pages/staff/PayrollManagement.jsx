import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  DollarSign, 
  Calendar, 
  User, 
  Download, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import useSettings from '../../hooks/useSettings'; // Adjust path as needed

const PayrollManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [payrollData, setPayrollData] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
    const { settings, isLoading: settingsLoading } = useSettings();

  useEffect(() => {
    // Simulate loading payroll data
    const loadPayrollData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPayrollData({
        currentPeriod: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          totalAmount: 360000,
          processedCount: 5,
          pendingCount: 1
        },
        staffPayments: [
          {
            id: 'PAY-001',
            staffId: 'STAFF-001',
            name: 'John Smith',
            department: 'Customer Service',
            baseSalary: 85000,
            overtime: 5000,
            bonuses: 3000,
            deductions: 8000,
            netPay: 85000,
            status: 'processed',
            payDate: '2024-01-31'
          },
          {
            id: 'PAY-002',
            staffId: 'STAFF-002',
            name: 'Sarah Johnson',
            department: 'Inventory Management',
            baseSalary: 65000,
            overtime: 3000,
            bonuses: 2000,
            deductions: 6000,
            netPay: 64000,
            status: 'processed',
            payDate: '2024-01-31'
          },
          {
            id: 'PAY-003',
            staffId: 'STAFF-003',
            name: 'Mike Wilson',
            department: 'Sales',
            baseSalary: 45000,
            overtime: 2000,
            bonuses: 1500,
            deductions: 4000,
            netPay: 44500,
            status: 'processed',
            payDate: '2024-01-31'
          },
          {
            id: 'PAY-004',
            staffId: 'STAFF-004',
            name: 'Priya Fernando',
            department: 'Marketing',
            baseSalary: 55000,
            overtime: 2500,
            bonuses: 2000,
            deductions: 5000,
            netPay: 54500,
            status: 'processed',
            payDate: '2024-01-31'
          },
          {
            id: 'PAY-005',
            staffId: 'STAFF-005',
            name: 'Kamal Perera',
            department: 'IT Support',
            baseSalary: 70000,
            overtime: 4000,
            bonuses: 2500,
            deductions: 6500,
            netPay: 70000,
            status: 'processed',
            payDate: '2024-01-31'
          },
          {
            id: 'PAY-006',
            staffId: 'STAFF-006',
            name: 'Anjali Silva',
            department: 'Finance',
            baseSalary: 40000,
            overtime: 1500,
            bonuses: 1000,
            deductions: 3500,
            netPay: 39000,
            status: 'pending',
            payDate: '2024-01-31'
          }
        ]
      });
      setIsLoading(false);
    };

    loadPayrollData();
  }, []);

    const currencyCode = settings?.currency || 'LKR'; 

    // FIX: Dynamic currency code
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode // <--- DYNAMICALLY USE SETTINGS CURRENCY
      }).format(price);
    };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        <title>Payroll Management - Sportify Staff</title>
        <meta name="description" content="Manage staff payroll and payments." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
                <p className="text-gray-600 mt-2">
                  Manage staff payments and payroll processing
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export Payroll
                </button>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Process Payroll
                </button>
              </div>
            </div>
          </div>

          {/* Payroll Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(payrollData?.currentPeriod.totalAmount || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Staff Count</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {(payrollData?.currentPeriod.processedCount || 0) + (payrollData?.currentPeriod.pendingCount || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processed</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {payrollData?.currentPeriod.processedCount || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {payrollData?.currentPeriod.pendingCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pay Period Selector */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Pay Period</h2>
                <p className="text-sm text-gray-600">
                  {payrollData?.currentPeriod.startDate} - {payrollData?.currentPeriod.endDate}
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg">
                  Current
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  Previous
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  Custom
                </button>
              </div>
            </div>
          </div>

          {/* Staff Payments Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Staff Payments</h2>
                <div className="flex space-x-2">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Filter
                  </button>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Sort
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overtime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bonuses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deductions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Pay
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
                  {payrollData?.staffPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.name}</div>
                          <div className="text-sm text-gray-500">ID: {payment.staffId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(payment.baseSalary)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(payment.overtime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(payment.bonuses)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(payment.deductions)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.netPay)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-700">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-700">
                            <Download className="h-4 w-4" />
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
        </div>
      </div>
    </>
  );
};

export default PayrollManagement;
