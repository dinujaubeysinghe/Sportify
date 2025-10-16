import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Calendar,
  Mail,
  Phone,
  IdCard,
  BarChart3,
  Download,
  Upload
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [activeTab, setActiveTab] = useState('staff');
  const [errors, setErrors] = useState({});
  
  const queryClient = useQueryClient();

  // Form data for staff creation/editing
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    employeeId: '',
    department: '',
    hireDate: '',
    permissions: ['read']
  });

  // Fetch staff data
  const { data: staffData, isLoading, error } = useQuery(
    ['staff', searchTerm, selectedDepartment, selectedStatus],
    async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDepartment !== 'all') params.append('department', selectedDepartment);
      if (selectedStatus !== 'all') params.append('isActive', selectedStatus === 'active');
      
      const response = await axios.get(`/api/admin/staff?${params.toString()}`);
      return response.data;
    }
  );

  // Fetch departments
  const { data: departmentsData } = useQuery(
    'departments',
    async () => {
      const response = await axios.get('/api/admin/departments');
      return response.data;
    }
  );

  // Fetch staff analytics
  const { data: analyticsData } = useQuery(
    'staff-analytics',
    async () => {
      const response = await axios.get('/api/admin/staff/analytics');
      return response.data;
    }
  );

  // Create staff mutation
  const createStaffMutation = useMutation(
    async (staffData) => {
      const response = await axios.post('/api/admin/staff', staffData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Staff member created successfully!');
        queryClient.invalidateQueries('staff');
        setShowAddModal(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create staff member');
      }
    }
  );

  // Update staff mutation
  const updateStaffMutation = useMutation(
    async ({ id, staffData }) => {
      const response = await axios.put(`/api/admin/staff/${id}`, staffData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Staff member updated successfully!');
        queryClient.invalidateQueries('staff');
        setShowEditModal(false);
        setEditingStaff(null);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update staff member');
      }
    }
  );

  // Delete staff mutation
  const deleteStaffMutation = useMutation(
    async (staffId) => {
      const response = await axios.delete(`/api/admin/staff/${staffId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Staff member deleted successfully!');
        queryClient.invalidateQueries('staff');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete staff member');
      }
    }
  );

  // Update staff status mutation
  const updateStatusMutation = useMutation(
    async ({ staffId, isActive }) => {
      const response = await axios.put(`/api/admin/staff/${staffId}/status`, { isActive });
      return response.data;
    },
    {
      onSuccess: (_, variables) => {
        toast.success(`Staff member ${variables.isActive ? 'activated' : 'deactivated'} successfully!`);
        queryClient.invalidateQueries('staff');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update staff status');
      }
    }
  );

  // Bulk action mutation
  const bulkActionMutation = useMutation(
    async ({ action, staffIds }) => {
      const response = await axios.post('/api/admin/staff/bulk-action', { action, staffIds });
      return response.data;
    },
    {
      onSuccess: (_, variables) => {
        toast.success(`Bulk ${variables.action} completed successfully!`);
        queryClient.invalidateQueries('staff');
        setSelectedStaff([]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to perform bulk action');
      }
    }
  );

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      employeeId: '',
      department: '',
      hireDate: '',
      permissions: ['read']
    });
    setErrors({});
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.hireDate) newErrors.hireDate = 'Hire date is required';
    
    if (editingStaff && !formData.password) {
      // Password not required for updates
    } else if (!editingStaff && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    if (editingStaff) {
      updateStaffMutation.mutate({ 
        id: editingStaff._id, 
        staffData: formData 
      });
    } else {
      createStaffMutation.mutate(formData);
    }
  };

  // Handle edit staff
  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    setFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      password: '',
      phone: staff.phone || '',
      employeeId: staff.employeeId,
      department: staff.department?._id || '',
      hireDate: staff.hireDate ? new Date(staff.hireDate).toISOString().split('T')[0] : '',
      permissions: staff.permissions || ['read']
    });
    setShowEditModal(true);
  };

  // Handle delete staff
  const handleDeleteStaff = (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      deleteStaffMutation.mutate(staffId);
    }
  };

  // Handle status toggle
  const handleStatusToggle = (staffId, currentStatus) => {
    updateStatusMutation.mutate({ 
      staffId, 
      isActive: !currentStatus 
    });
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (selectedStaff.length === 0) {
      toast.error('Please select staff members first');
      return;
    }
    
    if (window.confirm(`Are you sure you want to ${action} ${selectedStaff.length} staff member(s)?`)) {
      bulkActionMutation.mutate({ 
        action, 
        staffIds: selectedStaff 
      });
    }
  };

  // Handle staff selection
  const handleStaffSelection = (staffId) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedStaff.length === staffData?.staff?.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(staffData?.staff?.map(staff => staff._id) || []);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (isActive) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  // Get status text
  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const analytics = analyticsData?.analytics;
  const staff = staffData?.staff || [];
  const departments = departmentsData?.departments || [];

  return (
    <>
      <Helmet>
        <title>Staff Management - Sportify Admin</title>
        <meta name="description" content="Manage staff members, departments, and permissions in Sportify admin panel." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600 mt-2">Manage your staff members, departments, and permissions.</p>
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Staff</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.totalStaff}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Staff</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.activeStaff}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Departments</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.staffByDepartment?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Recent Hires</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.recentHires?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('staff')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'staff'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="h-5 w-5 inline mr-2" />
                  Staff Members
                </button>
                <button
                  onClick={() => setActiveTab('departments')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'departments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Building2 className="h-5 w-5 inline mr-2" />
                  Departments
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'analytics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className="h-5 w-5 inline mr-2" />
                  Analytics
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Staff Tab */}
              {activeTab === 'staff' && (
                <div>
                  {/* Search and Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search staff members..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                      </select>
                      
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <UserPlus className="h-5 w-5" />
                        Add Staff
                      </button>
                      
                      {selectedStaff.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{selectedStaff.length} selected</span>
                          <button
                            onClick={() => handleBulkAction('activate')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Activate
                          </button>
                          <button
                            onClick={() => handleBulkAction('deactivate')}
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                          >
                            Deactivate
                          </button>
                          <button
                            onClick={() => handleBulkAction('delete')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {/* Export functionality */}}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="h-5 w-5" />
                      Export
                    </button>
                  </div>

                  {/* Staff Table */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedStaff.length === staff.length && staff.length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Staff Member
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employee ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hire Date
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
                        {staff.map((member) => (
                          <tr key={member._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedStaff.includes(member._id)}
                                onChange={() => handleStaffSelection(member._id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">
                                      {member.firstName[0]}{member.lastName[0]}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {member.firstName} {member.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{member.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {member.employeeId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {member.department?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(member.hireDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.isActive)}`}>
                                {getStatusText(member.isActive)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditStaff(member)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleStatusToggle(member._id, member.isActive)}
                                  className={member.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                                >
                                  {member.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteStaff(member._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {staff.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding a new staff member.</p>
                        <div className="mt-6">
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Add Staff Member
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Departments Tab */}
              {activeTab === 'departments' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Departments</h3>
                    <button
                      onClick={() => setShowDepartmentModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Building2 className="h-5 w-5" />
                      Add Department
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept) => (
                      <div key={dept._id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-gray-900">{dept.name}</h4>
                          <span className="text-sm text-gray-500">{dept.staffCount || 0} staff</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{dept.description}</p>
                        <div className="mt-4 flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-900 text-sm">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 text-sm">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && analytics && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Staff Analytics</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Department Distribution */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Staff by Department</h4>
                      <div className="space-y-3">
                        {analytics.staffByDepartment?.map((dept) => (
                          <div key={dept._id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{dept.name || 'No Department'}</span>
                            <span className="text-sm font-medium text-gray-900">{dept.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Hires */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Hires</h4>
                      <div className="space-y-3">
                        {analytics.recentHires?.slice(0, 5).map((hire) => (
                          <div key={hire._id} className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {hire.firstName} {hire.lastName}
                              </span>
                              <p className="text-xs text-gray-500">{hire.department?.name || 'No Department'}</p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(hire.createdAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Staff Member</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.employeeId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.hireDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.hireDate && <p className="text-red-500 text-xs mt-1">{errors.hireDate}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createStaffMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {createStaffMutation.isLoading ? 'Creating...' : 'Create Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && editingStaff && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Staff Member</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStaff(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.employeeId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.hireDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.hireDate && <p className="text-red-500 text-xs mt-1">{errors.hireDate}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingStaff(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateStaffMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {updateStaffMutation.isLoading ? 'Updating...' : 'Update Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StaffManagement;