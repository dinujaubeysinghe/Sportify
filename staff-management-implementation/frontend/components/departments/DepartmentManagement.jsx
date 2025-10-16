import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Building2, 
  UserPlus, 
  Edit, 
  Trash2, 
  Users, 
  XCircle,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DepartmentManagement = ({ onClose }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [errors, setErrors] = useState({});
  
  const queryClient = useQueryClient();

  // Form data for department creation/editing
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager: '',
    permissions: ['read']
  });

  // Fetch departments
  const { data: departmentsData, isLoading } = useQuery(
    'departments',
    async () => {
      const response = await axios.get('/admin/departments');
      return response.data;
    }
  );

  // Fetch staff for manager selection
  const { data: staffData } = useQuery(
    'staff-for-managers',
    async () => {
      const response = await axios.get('/admin/staff');
      return response.data;
    }
  );

  // Create department mutation
  const createDepartmentMutation = useMutation(
    async (departmentData) => {
      const response = await axios.post('/admin/departments', departmentData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Department created successfully!');
        queryClient.invalidateQueries('departments');
        setShowAddModal(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create department');
      }
    }
  );

  // Update department mutation
  const updateDepartmentMutation = useMutation(
    async ({ id, departmentData }) => {
      const response = await axios.put(`/admin/departments/${id}`, departmentData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Department updated successfully!');
        queryClient.invalidateQueries('departments');
        setShowEditModal(false);
        setEditingDepartment(null);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update department');
      }
    }
  );

  // Delete department mutation
  const deleteDepartmentMutation = useMutation(
    async (departmentId) => {
      const response = await axios.delete(`/admin/departments/${departmentId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Department deleted successfully!');
        queryClient.invalidateQueries('departments');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete department');
      }
    }
  );

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      manager: '',
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

  // Handle permission change
  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Department name is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    if (editingDepartment) {
      updateDepartmentMutation.mutate({ 
        id: editingDepartment._id, 
        departmentData: formData 
      });
    } else {
      createDepartmentMutation.mutate(formData);
    }
  };

  // Handle edit department
  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      manager: department.manager?._id || '',
      permissions: department.permissions || ['read']
    });
    setShowEditModal(true);
  };

  // Handle delete department
  const handleDeleteDepartment = (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      deleteDepartmentMutation.mutate(departmentId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const departments = departmentsData?.departments || [];
  const staff = staffData?.staff || [];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Departments</h3>
          <p className="text-sm text-gray-600">Manage departments and assign managers</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Building2 className="h-5 w-5" />
          Add Department
        </button>
      </div>
      
      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">{dept.name}</h4>
                  <p className="text-sm text-gray-500">
                    {dept.staffCount || 0} staff member{(dept.staffCount || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditDepartment(dept)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteDepartment(dept._id)}
                  className="text-red-600 hover:text-red-900 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {dept.description && (
              <p className="text-sm text-gray-600 mb-4">{dept.description}</p>
            )}
            
            {dept.manager && (
              <div className="flex items-center text-sm text-gray-600">
                <UserPlus className="h-4 w-4 mr-2" />
                <span>Manager: {dept.manager.firstName} {dept.manager.lastName}</span>
              </div>
            )}
            
            {dept.permissions && dept.permissions.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {dept.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {departments.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No departments</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new department.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Department
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Department</h3>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Sales, Marketing, IT"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the department..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manager (Optional)</label>
                  <select
                    name="manager"
                    value={formData.manager}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Manager</option>
                    {staff.map(member => (
                      <option key={member._id} value={member._id}>
                        {member.firstName} {member.lastName} ({member.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="space-y-2">
                    {['read', 'write', 'delete', 'admin'].map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionChange(permission)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
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
                    disabled={createDepartmentMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {createDepartmentMutation.isLoading ? 'Creating...' : 'Create Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && editingDepartment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Department</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDepartment(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                  <select
                    name="manager"
                    value={formData.manager}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Manager</option>
                    {staff.map(member => (
                      <option key={member._id} value={member._id}>
                        {member.firstName} {member.lastName} ({member.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="space-y-2">
                    {['read', 'write', 'delete', 'admin'].map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionChange(permission)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingDepartment(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateDepartmentMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {updateDepartmentMutation.isLoading ? 'Updating...' : 'Update Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
