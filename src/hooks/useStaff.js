import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

// ==================== STAFF MANAGEMENT HOOKS ====================

// Get all staff members with filtering
export const useGetStaff = (filters = {}) => {
  return useQuery(
    ['staff', filters],
    async () => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '' && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });
      
      const response = await axios.get(`/api/admin/staff?${params.toString()}`);
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

// Get specific staff member
export const useGetStaffById = (staffId) => {
  return useQuery(
    ['staff', staffId],
    async () => {
      const response = await axios.get(`/api/admin/staff/${staffId}`);
      return response.data;
    },
    {
      enabled: !!staffId,
      staleTime: 5 * 60 * 1000,
    }
  );
};

// Create staff member
export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (staffData) => {
      const response = await axios.post('/api/admin/staff', staffData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Staff member created successfully!');
        queryClient.invalidateQueries('staff');
        queryClient.invalidateQueries('staff-analytics');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create staff member');
      }
    }
  );
};

// Update staff member
export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ id, staffData }) => {
      const response = await axios.put(`/api/admin/staff/${id}`, staffData);
      return response.data;
    },
    {
      onSuccess: (_, variables) => {
        toast.success('Staff member updated successfully!');
        queryClient.invalidateQueries('staff');
        queryClient.invalidateQueries(['staff', variables.id]);
        queryClient.invalidateQueries('staff-analytics');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update staff member');
      }
    }
  );
};

// Delete staff member
export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (staffId) => {
      const response = await axios.delete(`/api/admin/staff/${staffId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Staff member deleted successfully!');
        queryClient.invalidateQueries('staff');
        queryClient.invalidateQueries('staff-analytics');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete staff member');
      }
    }
  );
};

// Update staff status (activate/deactivate)
export const useUpdateStaffStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ staffId, isActive }) => {
      const response = await axios.put(`/api/admin/staff/${staffId}/status`, { isActive });
      return response.data;
    },
    {
      onSuccess: (_, variables) => {
        toast.success(`Staff member ${variables.isActive ? 'activated' : 'deactivated'} successfully!`);
        queryClient.invalidateQueries('staff');
        queryClient.invalidateQueries(['staff', variables.staffId]);
        queryClient.invalidateQueries('staff-analytics');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update staff status');
      }
    }
  );
};

// Bulk operations on staff
export const useBulkStaffAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ action, staffIds }) => {
      const response = await axios.post('/api/admin/staff/bulk-action', { action, staffIds });
      return response.data;
    },
    {
      onSuccess: (_, variables) => {
        toast.success(`Bulk ${variables.action} completed successfully!`);
        queryClient.invalidateQueries('staff');
        queryClient.invalidateQueries('staff-analytics');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to perform bulk action');
      }
    }
  );
};

// Get staff analytics
export const useGetStaffAnalytics = () => {
  return useQuery(
    'staff-analytics',
    async () => {
      const response = await axios.get('/api/admin/staff/analytics');
      return response.data;
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

// Export staff data
export const useExportStaffData = () => {
  return useMutation(
    async ({ format = 'csv', filters = {} } = {}) => {
      const response = await axios.post('/api/admin/staff/export', { format, filters });
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success(`Staff data exported successfully! (${data.count} records)`);
        
        // Download the data
        if (data.format === 'csv') {
          downloadCSV(data.data, 'staff-data.csv');
        } else {
          downloadJSON(data.data, 'staff-data.json');
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to export staff data');
      }
    }
  );
};

// ==================== DEPARTMENT MANAGEMENT HOOKS ====================

// Get all departments
export const useGetDepartments = () => {
  return useQuery(
    'departments',
    async () => {
      const response = await axios.get('/api/admin/departments');
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Create department
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (departmentData) => {
      const response = await axios.post('/api/admin/departments', departmentData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Department created successfully!');
        queryClient.invalidateQueries('departments');
        queryClient.invalidateQueries('staff-analytics');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create department');
      }
    }
  );
};

// Update department
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ id, departmentData }) => {
      const response = await axios.put(`/api/admin/departments/${id}`, departmentData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Department updated successfully!');
        queryClient.invalidateQueries('departments');
        queryClient.invalidateQueries('staff-analytics');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update department');
      }
    }
  );
};

// Delete department
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (departmentId) => {
      const response = await axios.delete(`/api/admin/departments/${departmentId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Department deleted successfully!');
        queryClient.invalidateQueries('departments');
        queryClient.invalidateQueries('staff-analytics');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete department');
      }
    }
  );
};

// ==================== UTILITY FUNCTIONS ====================

// Download CSV file
const downloadCSV = (data, filename) => {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Download JSON file
const downloadJSON = (data, filename) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Convert data to CSV format
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
};

// Format date for display
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format date for input
export const formatDateForInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

// Get status color classes
export const getStatusColor = (isActive) => {
  return isActive 
    ? 'text-green-600 bg-green-100' 
    : 'text-red-600 bg-red-100';
};

// Get status text
export const getStatusText = (isActive) => {
  return isActive ? 'Active' : 'Inactive';
};

// Generate employee ID
export const generateEmployeeId = (count) => {
  return `EMP${String(count + 1).padStart(3, '0')}`;
};

// Validate staff form data
export const validateStaffForm = (formData, isEdit = false) => {
  const errors = {};
  
  if (!formData.firstName?.trim()) {
    errors.firstName = 'First name is required';
  }
  
  if (!formData.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  }
  
  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!isEdit && !formData.password?.trim()) {
    errors.password = 'Password is required';
  }
  
  if (!formData.employeeId?.trim()) {
    errors.employeeId = 'Employee ID is required';
  }
  
  if (!formData.department) {
    errors.department = 'Department is required';
  }
  
  if (!formData.hireDate) {
    errors.hireDate = 'Hire date is required';
  }
  
  return errors;
};

// Validate department form data
export const validateDepartmentForm = (formData) => {
  const errors = {};
  
  if (!formData.name?.trim()) {
    errors.name = 'Department name is required';
  }
  
  return errors;
};

// Filter staff by search term
export const filterStaffBySearch = (staff, searchTerm) => {
  if (!searchTerm) return staff;
  
  const term = searchTerm.toLowerCase();
  return staff.filter(member => 
    member.firstName.toLowerCase().includes(term) ||
    member.lastName.toLowerCase().includes(term) ||
    member.email.toLowerCase().includes(term) ||
    member.employeeId.toLowerCase().includes(term)
  );
};

// Sort staff by field
export const sortStaff = (staff, field, direction = 'asc') => {
  return [...staff].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];
    
    // Handle nested objects
    if (field === 'department') {
      aValue = a.department?.name || '';
      bValue = b.department?.name || '';
    }
    
    // Handle dates
    if (field === 'hireDate' || field === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Handle strings
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

// Calculate staff statistics
export const calculateStaffStats = (staff) => {
  const total = staff.length;
  const active = staff.filter(member => member.isActive).length;
  const inactive = total - active;
  
  const byDepartment = staff.reduce((acc, member) => {
    const deptName = member.department?.name || 'No Department';
    acc[deptName] = (acc[deptName] || 0) + 1;
    return acc;
  }, {});
  
  return {
    total,
    active,
    inactive,
    byDepartment
  };
};