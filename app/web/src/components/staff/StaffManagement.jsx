import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  UserX,
  Building,
  Badge
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const StaffManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [staff, setStaff] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    employeeId: '',
    hireDate: '',
    salary: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    isActive: true
  });

  // Validation state
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    'Customer Service',
    'Inventory Management',
    'Sales',
    'Marketing',
    'IT Support',
    'Human Resources',
    'Finance',
    'Operations'
  ];

  const positions = [
    'Manager',
    'Supervisor',
    'Specialist',
    'Associate',
    'Coordinator',
    'Analyst',
    'Representative',
    'Assistant'
  ];

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStaff([
      {
        id: 'STAFF-001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@sportify.com',
        phone: '+94 77 123 4567',
        department: 'Customer Service',
        position: 'Manager',
        employeeId: 'EMP001',
        hireDate: '2023-01-15',
        salary: 85000,
        address: '123 Galle Road, Colombo 03, Sri Lanka',
        emergencyContact: 'Jane Smith',
        emergencyPhone: '+94 77 987 6543',
        isActive: true,
        avatar: null
      },
      {
        id: 'STAFF-002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@sportify.com',
        phone: '+94 77 234 5678',
        department: 'Inventory Management',
        position: 'Specialist',
        employeeId: 'EMP002',
        hireDate: '2023-03-20',
        salary: 65000,
        address: '456 Kandy Road, Kandy, Sri Lanka',
        emergencyContact: 'Mike Johnson',
        emergencyPhone: '+94 77 876 5432',
        isActive: true,
        avatar: null
      },
      {
        id: 'STAFF-003',
        firstName: 'Mike',
        lastName: 'Wilson',
        email: 'mike.wilson@sportify.com',
        phone: '+94 77 345 6789',
        department: 'Sales',
        position: 'Representative',
        employeeId: 'EMP003',
        hireDate: '2023-06-10',
        salary: 45000,
        address: '789 Negombo Road, Negombo, Sri Lanka',
        emergencyContact: 'Lisa Wilson',
        emergencyPhone: '+94 77 765 4321',
        isActive: false,
        avatar: null
      },
      {
        id: 'STAFF-004',
        firstName: 'Priya',
        lastName: 'Fernando',
        email: 'priya.fernando@sportify.com',
        phone: '+94 77 456 7890',
        department: 'Marketing',
        position: 'Coordinator',
        employeeId: 'EMP004',
        hireDate: '2023-08-15',
        salary: 55000,
        address: '321 Mount Lavinia, Colombo 06, Sri Lanka',
        emergencyContact: 'Ravi Fernando',
        emergencyPhone: '+94 77 654 3210',
        isActive: true,
        avatar: null
      },
      {
        id: 'STAFF-005',
        firstName: 'Kamal',
        lastName: 'Perera',
        email: 'kamal.perera@sportify.com',
        phone: '+94 77 567 8901',
        department: 'IT Support',
        position: 'Analyst',
        employeeId: 'EMP005',
        hireDate: '2023-09-01',
        salary: 70000,
        address: '654 Battaramulla, Colombo 08, Sri Lanka',
        emergencyContact: 'Nimali Perera',
        emergencyPhone: '+94 77 543 2109',
        isActive: true,
        avatar: null
      },
      {
        id: 'STAFF-006',
        firstName: 'Anjali',
        lastName: 'Silva',
        email: 'anjali.silva@sportify.com',
        phone: '+94 77 678 9012',
        department: 'Finance',
        position: 'Assistant',
        employeeId: 'EMP006',
        hireDate: '2023-10-10',
        salary: 40000,
        address: '987 Dehiwala, Colombo 05, Sri Lanka',
        emergencyContact: 'Sunil Silva',
        emergencyPhone: '+94 77 432 1098',
        isActive: true,
        avatar: null
      }
    ]);
    setIsLoading(false);
  };

  // Validation functions
  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          errors.firstName = 'First name is required';
        } else if (value.trim().length < 2) {
          errors.firstName = 'First name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.firstName = 'First name can only contain letters and spaces';
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          errors.lastName = 'Last name is required';
        } else if (value.trim().length < 2) {
          errors.lastName = 'Last name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.lastName = 'Last name can only contain letters and spaces';
        }
        break;

      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          errors.email = 'Please enter a valid email address';
        } else if (!value.endsWith('@sportify.com')) {
          errors.email = 'Email must be a Sportify company email (@sportify.com)';
        }
        break;

      case 'phone':
        if (!value.trim()) {
          errors.phone = 'Phone number is required';
        } else if (!/^\+94\s?\d{2}\s?\d{3}\s?\d{4}$/.test(value.trim())) {
          errors.phone = 'Please enter a valid Sri Lankan phone number (+94 XX XXX XXXX)';
        }
        break;

      case 'department':
        if (!value) {
          errors.department = 'Department is required';
        }
        break;

      case 'position':
        if (!value) {
          errors.position = 'Position is required';
        }
        break;

      case 'hireDate':
        if (!value) {
          errors.hireDate = 'Hire date is required';
        } else {
          const hireDate = new Date(value);
          const today = new Date();
          const minDate = new Date('2020-01-01');
          
          if (hireDate > today) {
            errors.hireDate = 'Hire date cannot be in the future';
          } else if (hireDate < minDate) {
            errors.hireDate = 'Hire date cannot be before 2020';
          }
        }
        break;

      case 'salary':
        if (!value) {
          errors.salary = 'Salary is required';
        } else {
          const salary = parseFloat(value);
          if (isNaN(salary) || salary <= 0) {
            errors.salary = 'Salary must be a positive number';
          } else if (salary < 25000) {
            errors.salary = 'Minimum salary is LKR 25,000';
          } else if (salary > 500000) {
            errors.salary = 'Maximum salary is LKR 500,000';
          }
        }
        break;

      case 'address':
        if (!value.trim()) {
          errors.address = 'Address is required';
        } else if (value.trim().length < 10) {
          errors.address = 'Address must be at least 10 characters';
        }
        break;

      case 'emergencyContact':
        if (!value.trim()) {
          errors.emergencyContact = 'Emergency contact name is required';
        } else if (value.trim().length < 2) {
          errors.emergencyContact = 'Emergency contact name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.emergencyContact = 'Emergency contact name can only contain letters and spaces';
        }
        break;

      case 'emergencyPhone':
        if (!value.trim()) {
          errors.emergencyPhone = 'Emergency phone number is required';
        } else if (!/^\+94\s?\d{2}\s?\d{3}\s?\d{4}$/.test(value.trim())) {
          errors.emergencyPhone = 'Please enter a valid Sri Lankan phone number (+94 XX XXX XXXX)';
        }
        break;
    }

    return errors;
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      if (field !== 'isActive') {
        const fieldErrors = validateField(field, formData[field]);
        Object.assign(errors, fieldErrors);
      }
    });

    // Check for duplicate email
    const existingStaff = staff.find(s => 
      s.email.toLowerCase() === formData.email.toLowerCase() && 
      s.id !== selectedStaff?.id
    );
    if (existingStaff) {
      errors.email = 'This email is already registered to another staff member';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation for certain fields
    if (['email', 'phone', 'emergencyPhone'].includes(name)) {
      const fieldErrors = validateField(name, newValue);
      setFormErrors(prev => ({
        ...prev,
        ...fieldErrors
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (showEditForm) {
      // Update existing staff
      setStaff(prev => prev.map(s => 
        s.id === selectedStaff.id 
          ? { ...s, ...formData }
          : s
      ));
    } else {
      // Add new staff
      const newStaff = {
        id: `STAFF-${Date.now()}`,
        ...formData,
        employeeId: `EMP${String(staff.length + 1).padStart(3, '0')}`
      };
      setStaff(prev => [...prev, newStaff]);
    }
    
    resetForm();
    setIsSubmitting(false);
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData(staffMember);
    setShowEditForm(true);
  };

  const handleDelete = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setStaff(prev => prev.filter(s => s.id !== staffId));
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (staffId) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setStaff(prev => prev.map(s => 
      s.id === staffId 
        ? { ...s, isActive: !s.isActive }
        : s
    ));
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      employeeId: '',
      hireDate: '',
      salary: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      isActive: true
    });
    setFormErrors({});
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedStaff(null);
    setIsSubmitting(false);
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && member.isActive) ||
      (filterStatus === 'inactive' && !member.isActive);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading && staff.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-600">Manage your team members and their information</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {getInitials(member.firstName, member.lastName)}
                  </span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{member.position}</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(member)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleToggleStatus(member.id)}
                  className={`p-1 transition-colors ${
                    member.isActive 
                      ? 'text-gray-400 hover:text-red-600' 
                      : 'text-gray-400 hover:text-green-600'
                  }`}
                >
                  {member.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Badge className="h-4 w-4 mr-2" />
                {member.employeeId}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Building className="h-4 w-4 mr-2" />
                {member.department}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {member.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {member.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Hired: {new Date(member.hireDate).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                member.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {member.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                LKR {member.salary.toLocaleString()}/month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {showEditForm ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      formErrors.firstName 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      formErrors.lastName 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="name@sportify.com"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      formErrors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+94 77 123 4567"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      formErrors.phone 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      formErrors.department 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {formErrors.department && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.department}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      formErrors.position 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select Position</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                  {formErrors.position && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.position}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      formErrors.hireDate 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.hireDate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.hireDate}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (LKR)</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                    min="25000"
                    max="500000"
                    step="1000"
                    placeholder="e.g., 50000"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      formErrors.salary 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.salary && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.salary}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Enter full address in Sri Lanka"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    formErrors.address 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {formErrors.address && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      formErrors.emergencyContact 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.emergencyContact && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.emergencyContact}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    placeholder="+94 77 123 4567"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      formErrors.emergencyPhone 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.emergencyPhone && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.emergencyPhone}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Active employee
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || Object.keys(formErrors).length > 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (showEditForm ? 'Update' : 'Add')} Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;