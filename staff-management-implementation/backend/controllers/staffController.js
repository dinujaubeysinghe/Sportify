const { body, validationResult } = require('express-validator');
const User = require('../../models/User');
const Department = require('../../models/Department');
const bcrypt = require('bcryptjs');
const sendEmail = require('../../utils/sendEmail');

// ==================== STAFF MANAGEMENT ====================

// Get all staff members with filtering and pagination
exports.getStaff = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { role: 'staff' };
    
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { employeeId: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    if (req.query.department) {
      filter.department = req.query.department;
    }
    
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const staff = await User.find(filter)
      .select('-password')
      .populate('department', 'name description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: staff.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      staff
    });

  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get specific staff member
exports.getStaffById = async (req, res) => {
  try {
    const staff = await User.findOne({ 
      _id: req.params.id, 
      role: 'staff' 
    })
      .select('-password')
      .populate('department', 'name description');

    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff member not found' 
      });
    }

    res.json({
      success: true,
      staff
    });

  } catch (error) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new staff member
exports.createStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      employeeId,
      department,
      hireDate,
      role = 'staff',
      permissions = []
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Check if employee ID already exists
    const existingEmployee = await User.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID already exists' 
      });
    }

    // Create staff user
    const staffData = {
      firstName,
      lastName,
      email,
      password,
      phone,
      employeeId,
      department,
      hireDate: new Date(hireDate),
      role,
      permissions,
      isActive: true,
      isVerified: true,
      isApproved: true
    };

    const staff = new User(staffData);
    await staff.save();

    // Remove password from response
    const staffResponse = staff.toObject();
    delete staffResponse.password;

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      staff: staffResponse
    });

  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update staff member
exports.updateStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      employeeId,
      department,
      hireDate,
      permissions,
      isActive
    } = req.body;

    const staff = await User.findOne({ 
      _id: req.params.id, 
      role: 'staff' 
    });

    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff member not found' 
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== staff.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }
    }

    // Check if employee ID is being changed and already exists
    if (employeeId && employeeId !== staff.employeeId) {
      const existingEmployee = await User.findOne({ employeeId });
      if (existingEmployee) {
        return res.status(400).json({ 
          success: false, 
          message: 'Employee ID already exists' 
        });
      }
    }

    // Update staff data
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (employeeId) updateData.employeeId = employeeId;
    if (department) updateData.department = department;
    if (hireDate) updateData.hireDate = new Date(hireDate);
    if (permissions) updateData.permissions = permissions;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedStaff = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      staff: updatedStaff
    });

  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete staff member
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await User.findOne({ 
      _id: req.params.id, 
      role: 'staff' 
    });

    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff member not found' 
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });

  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update staff status (activate/deactivate)
exports.updateStaffStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { isActive } = req.body;

    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'staff' },
      { isActive },
      { new: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff member not found' 
      });
    }

    res.json({
      success: true,
      message: `Staff member ${isActive ? 'activated' : 'deactivated'} successfully`,
      staff
    });

  } catch (error) {
    console.error('Update staff status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Bulk operations on staff
exports.bulkStaffAction = async (req, res) => {
  try {
    const { action, staffIds } = req.body;

    if (!action || !staffIds || !Array.isArray(staffIds)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid bulk action parameters' 
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        message = 'Staff members activated successfully';
        break;
      case 'deactivate':
        updateData = { isActive: false };
        message = 'Staff members deactivated successfully';
        break;
      case 'delete':
        await User.deleteMany({ 
          _id: { $in: staffIds }, 
          role: 'staff' 
        });
        return res.json({
          success: true,
          message: 'Staff members deleted successfully'
        });
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid action' 
        });
    }

    const result = await User.updateMany(
      { _id: { $in: staffIds }, role: 'staff' },
      updateData
    );

    res.json({
      success: true,
      message,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Bulk staff action error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== DEPARTMENT MANAGEMENT ====================

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('manager', 'firstName lastName email')
      .sort({ name: 1 });

    res.json({
      success: true,
      departments
    });

  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create department
exports.createDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, description, manager, permissions } = req.body;

    // Check if department already exists
    const existingDepartment = await Department.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    if (existingDepartment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Department already exists' 
      });
    }

    const department = new Department({
      name,
      description,
      manager,
      permissions: permissions || []
    });

    await department.save();

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department
    });

  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, description, manager, permissions } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found' 
      });
    }

    // Check if name is being changed and already exists
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingDepartment) {
        return res.status(400).json({ 
          success: false, 
          message: 'Department name already exists' 
        });
      }
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description, manager, permissions },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Department updated successfully',
      department: updatedDepartment
    });

  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found' 
      });
    }

    // Check if department has staff members
    const staffCount = await User.countDocuments({ department: req.params.id });
    if (staffCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete department with staff members. Please reassign staff first.' 
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });

  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== STAFF ANALYTICS ====================

// Get staff analytics
exports.getStaffAnalytics = async (req, res) => {
  try {
    // Total staff count
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const activeStaff = await User.countDocuments({ role: 'staff', isActive: true });

    // Staff by department
    const staffByDepartment = await User.aggregate([
      { $match: { role: 'staff' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'department' } },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$department.name', count: 1 } }
    ]);

    // Recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentHires = await User.find({
      role: 'staff',
      createdAt: { $gte: thirtyDaysAgo }
    })
      .select('firstName lastName email department createdAt')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Staff performance metrics (placeholder - can be extended)
    const performanceMetrics = {
      averageTenure: 0, // Can be calculated based on hireDate
      departmentDistribution: staffByDepartment,
      monthlyHires: 0 // Can be calculated based on createdAt
    };

    res.json({
      success: true,
      analytics: {
        totalStaff,
        activeStaff,
        inactiveStaff: totalStaff - activeStaff,
        staffByDepartment,
        recentHires,
        performanceMetrics
      }
    });

  } catch (error) {
    console.error('Get staff analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Export staff data
exports.exportStaffData = async (req, res) => {
  try {
    const { format = 'csv', filters = {} } = req.body;

    // Build filter based on request
    const filter = { role: 'staff' };
    if (filters.department) filter.department = filters.department;
    if (filters.isActive !== undefined) filter.isActive = filters.isActive;

    const staff = await User.find(filter)
      .select('-password')
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV data
      const csvData = staff.map(member => ({
        'Employee ID': member.employeeId,
        'First Name': member.firstName,
        'Last Name': member.lastName,
        'Email': member.email,
        'Phone': member.phone,
        'Department': member.department?.name || 'N/A',
        'Hire Date': member.hireDate?.toISOString().split('T')[0] || 'N/A',
        'Status': member.isActive ? 'Active' : 'Inactive',
        'Created At': member.createdAt.toISOString().split('T')[0]
      }));

      res.json({
        success: true,
        data: csvData,
        format: 'csv',
        count: csvData.length
      });
    } else {
      res.json({
        success: true,
        data: staff,
        format: 'json',
        count: staff.length
      });
    }

  } catch (error) {
    console.error('Export staff data error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
