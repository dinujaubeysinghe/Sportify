import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

// Custom hook for staff management
export const useStaff = () => {
  const queryClient = useQueryClient();

  // Get all staff with filtering
  const useGetStaff = (filters = {}) => {
    return useQuery(
      ['staff', filters],
      async () => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.department && filters.department !== 'all') params.append('department', filters.department);
        if (filters.status && filters.status !== 'all') params.append('isActive', filters.status === 'active');
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        
        const response = await axios.get(`/admin/staff?${params.toString()}`);
        return response.data;
      },
      {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
      }
    );
  };

  // Get specific staff member
  const useGetStaffById = (staffId) => {
    return useQuery(
      ['staff', staffId],
      async () => {
        const response = await axios.get(`/admin/staff/${staffId}`);
        return response.data;
      },
      {
        enabled: !!staffId,
        staleTime: 5 * 60 * 1000,
      }
    );
  };

  // Create staff mutation
  const useCreateStaff = () => {
    return useMutation(
      async (staffData) => {
        const response = await axios.post('/admin/staff', staffData);
        return response.data;
      },
      {
        onSuccess: () => {
          toast.success('Staff member created successfully!');
          queryClient.invalidateQueries('staff');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to create staff member');
        }
      }
    );
  };

  // Update staff mutation
  const useUpdateStaff = () => {
    return useMutation(
      async ({ id, staffData }) => {
        const response = await axios.put(`/admin/staff/${id}`, staffData);
        return response.data;
      },
      {
        onSuccess: () => {
          toast.success('Staff member updated successfully!');
          queryClient.invalidateQueries('staff');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to update staff member');
        }
      }
    );
  };

  // Delete staff mutation
  const useDeleteStaff = () => {
    return useMutation(
      async (staffId) => {
        const response = await axios.delete(`/admin/staff/${staffId}`);
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
  };

  // Update staff status mutation
  const useUpdateStaffStatus = () => {
    return useMutation(
      async ({ staffId, isActive }) => {
        const response = await axios.put(`/admin/staff/${staffId}/status`, { isActive });
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
  };

  // Bulk action mutation
  const useBulkStaffAction = () => {
    return useMutation(
      async ({ action, staffIds }) => {
        const response = await axios.post('/admin/staff/bulk-action', { action, staffIds });
        return response.data;
      },
      {
        onSuccess: (_, variables) => {
          toast.success(`Bulk ${variables.action} completed successfully!`);
          queryClient.invalidateQueries('staff');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to perform bulk action');
        }
      }
    );
  };

  // Get staff analytics
  const useGetStaffAnalytics = () => {
    return useQuery(
      'staff-analytics',
      async () => {
        const response = await axios.get('/admin/staff/analytics');
        return response.data;
      },
      {
        staleTime: 10 * 60 * 1000, // 10 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
      }
    );
  };

  // Export staff data mutation
  const useExportStaffData = () => {
    return useMutation(
      async (exportOptions) => {
        const response = await axios.post('/admin/staff/export', exportOptions);
        return response.data;
      },
      {
        onSuccess: (data) => {
          toast.success('Staff data exported successfully!');
          
          // Handle file download
          if (data.format === 'csv') {
            const csvContent = convertToCSV(data.data);
            downloadCSV(csvContent, 'staff-data.csv');
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

  return {
    useGetStaff,
    useGetStaffById,
    useCreateStaff,
    useUpdateStaff,
    useDeleteStaff,
    useUpdateStaffStatus,
    useBulkStaffAction,
    useGetStaffAnalytics,
    useExportStaffData
  };
};

// Custom hook for department management
export const useDepartments = () => {
  const queryClient = useQueryClient();

  // Get all departments
  const useGetDepartments = () => {
    return useQuery(
      'departments',
      async () => {
        const response = await axios.get('/admin/departments');
        return response.data;
      },
      {
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
      }
    );
  };

  // Create department mutation
  const useCreateDepartment = () => {
    return useMutation(
      async (departmentData) => {
        const response = await axios.post('/admin/departments', departmentData);
        return response.data;
      },
      {
        onSuccess: () => {
          toast.success('Department created successfully!');
          queryClient.invalidateQueries('departments');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to create department');
        }
      }
    );
  };

  // Update department mutation
  const useUpdateDepartment = () => {
    return useMutation(
      async ({ id, departmentData }) => {
        const response = await axios.put(`/admin/departments/${id}`, departmentData);
        return response.data;
      },
      {
        onSuccess: () => {
          toast.success('Department updated successfully!');
          queryClient.invalidateQueries('departments');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to update department');
        }
      }
    );
  };

  // Delete department mutation
  const useDeleteDepartment = () => {
    return useMutation(
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
  };

  return {
    useGetDepartments,
    useCreateDepartment,
    useUpdateDepartment,
    useDeleteDepartment
  };
};

// Utility functions for data export
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
};

const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadJSON = (jsonData, filename) => {
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Utility functions for staff management
export const staffUtils = {
  // Format staff name
  formatName: (firstName, lastName) => `${firstName} ${lastName}`,
  
  // Format date
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },
  
  // Get status color
  getStatusColor: (isActive) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  },
  
  // Get status text
  getStatusText: (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  },
  
  // Generate employee ID
  generateEmployeeId: (department, count) => {
    const deptCode = department?.substring(0, 3).toUpperCase() || 'EMP';
    const paddedCount = String(count + 1).padStart(3, '0');
    return `${deptCode}${paddedCount}`;
  },
  
  // Validate email
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Validate phone
  validatePhone: (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },
  
  // Get initials
  getInitials: (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  }
};
