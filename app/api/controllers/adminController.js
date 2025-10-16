const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Setting = require('../models/Settings'); // Import the new model
const Department = require('../models/Department'); // Import Department model
const sendEmail = require('../utils/sendEmail');
const {supplierApprovalTemplate} = require('../emails/emailTemplates');

exports.getDashboard = async (req, res) => {
  try {
    const userStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const productStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalStock: { $sum: '$stock' },
          averagePrice: { $avg: '$price' }
        }
      }
    ]);

    const orderStats = await Order.getOrderStats();
    const inventorySummary = await Inventory.getInventorySummary();

    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5);

    const lowStockProducts = await Inventory.getLowStockProducts();

    const pendingSuppliers = await User.find({ 
      role: 'supplier', 
      isApproved: false 
    }).select('firstName lastName email businessName createdAt');

    res.json({
      success: true,
      dashboard: {
        userStats,
        productStats: productStats[0] || {
          totalProducts: 0,
          activeProducts: 0,
          totalStock: 0,
          averagePrice: 0
        },
        orderStats,
        inventorySummary,
        recentOrders,
        lowStockProducts,
        pendingSuppliers
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    if(req.params.id === req.user.id){
      return res.status(401).json({sucess:false,message:'You cannot deactivate your account.You are an admin!'});
    }

    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Correction for exports.updateSupplierStatus

exports.updateSupplierStatus = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }

        const { isApproved } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Update the user status
        user.isApproved = isApproved;
        // NOTE: You should also update user.isActive if you are rejecting (isApproved=false)
        // This logic should match what you implemented in the getSuppliers controller.
        // If isApproved is false, you probably want to set isActive to false too.
        if (isApproved === false) {
             user.isActive = false;
        } else {
             user.isActive = true;
        }
        
        await user.save();
        console.log('status: ', isApproved);

        // --- CORRECTION APPLIED HERE ---
        const fullName = `${user.firstName} ${user.lastName}`;
        const approvalNotes = isApproved ? 'Your account is now fully active.' : 'Please review your application details and contact support if you need assistance.';

        await sendEmail({
            to: user.email,
            subject: 'Your Supplier Account Status',
            // Pass fullName, the boolean status, and the notes.
            html: supplierApprovalTemplate(fullName, isApproved, approvalNotes)
        });
        // --------------------------------

        res.json({
            success: true,
            message: `Supplier ${isApproved ? 'approved' : 'rejected'} successfully`,
            user
        });

    } catch (error) {
        console.error('Update supplier status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { firstName, lastName, email, password, employeeId, department, hireDate, phone } = req.body;

    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'User already exists with this email' });
    if (await User.findOne({ employeeId })) return res.status(400).json({ success: false, message: 'Employee ID already exists' });

    const staff = await User.create({
      firstName, lastName, email, password,
      role: 'staff', employeeId, department, hireDate, phone,
      isActive: true, isVerified: true
    });

    const staffResponse = staff.toObject();
    delete staffResponse.password;

    res.status(201).json({ success: true, message: 'Staff member created successfully', staff: staffResponse });

  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== GET SETTINGS (DYNAMIC) =====================
exports.getSettings = async (req, res) => {
  try {
    // Use the static method to ensure the settings document exists or is created
    const settings = await Setting.getGlobalSettings();

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== UPDATE SETTINGS (DYNAMIC) =====================
exports.updateSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    
    // Find the single settings document and update it with request body data
    const updatedSettings = await Setting.findOneAndUpdate(
        { singletonId: 'GLOBAL_SETTINGS' },
        { $set: req.body },
        { new: true, runValidators: true } // Return the new document and run Mongoose validators
    );

    if (!updatedSettings) {
        return res.status(404).json({ success: false, message: 'Settings document not found.' });
    }

    res.json({ success: true, message: 'Settings updated successfully', settings: updatedSettings });
  } catch (error) {
    console.error('Update settings error:', error);
    // Check for validation errors from Mongoose
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.getReports = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    let report = {};

    switch (type) {
      case 'sales':
        const salesFilter = {};
        if (startDate && endDate) {
          salesFilter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        const salesData = await Order.aggregate([
          { $match: salesFilter },
          {
            $group: {
              _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
              totalSales: { $sum: '$total' },
              orderCount: { $sum: 1 },
              averageOrderValue: { $avg: '$total' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        report = {
          type: 'sales',
          data: salesData,
          summary: {
            totalSales: salesData.reduce((sum, item) => sum + item.totalSales, 0),
            totalOrders: salesData.reduce((sum, item) => sum + item.orderCount, 0),
            averageOrderValue: salesData.length > 0 ? salesData.reduce((sum, item) => sum + item.averageOrderValue, 0) / salesData.length : 0
          }
        };
        break;

      case 'products':
        const productData = await Product.aggregate([
          { $lookup: { from: 'orders', localField: '_id', foreignField: 'items.product', as: 'orders' } },
          { $project: { name: 1, category: 1, brand: 1, price: 1, stock: 1, orderCount: { $size: '$orders' } } },
          { $sort: { orderCount: -1 } },
          { $limit: 50 }
        ]);
        report = { type: 'products', data: productData };
        break;

      case 'inventory':
        const inventoryData = await Inventory.aggregate([
          { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
          { $unwind: '$product' },
          { $project: { productName: '$product.name', category: '$product.category', brand: '$product.brand', currentStock: 1, minStockLevel: 1, isLowStock: 1, isOutOfStock: 1, totalStockIn: 1, totalStockOut: 1 } },
          { $sort: { currentStock: 1 } }
        ]);
        report = { type: 'inventory', data: inventoryData };
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    res.json({ success: true, report });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

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
    
    // Handle both 'status' and 'isActive' parameters
    if (req.query.status && req.query.status !== 'all') {
      filter.isActive = req.query.status === 'active';
    } else if (req.query.isActive !== undefined) {
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
      position,
      salary,
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

    // Generate employee ID if not provided
    const finalEmployeeId = employeeId || `EMP${Date.now().toString().slice(-6)}`;

    // Check if employee ID already exists
    const existingEmployee = await User.findOne({ employeeId: finalEmployeeId });
    if (existingEmployee) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID already exists' 
      });
    }

    // Generate default password if not provided
    const defaultPassword = password || 'staff123';

    // Handle department - if it's a string, find the department by name
    let departmentId = department;
    if (department && typeof department === 'string' && !department.match(/^[0-9a-fA-F]{24}$/)) {
      const Department = require('../models/Department');
      const dept = await Department.findOne({ name: department });
      if (dept) {
        departmentId = dept._id;
      } else {
        // Create department if it doesn't exist
        const newDept = await Department.create({ name: department, description: `${department} department` });
        departmentId = newDept._id;
      }
    }

    // Create staff user
    const staffData = {
      firstName,
      lastName,
      email,
      password: defaultPassword,
      phone,
      employeeId: finalEmployeeId,
      department: departmentId,
      hireDate: hireDate ? new Date(hireDate) : new Date(),
      position,
      salary: salary ? parseFloat(salary) : undefined,
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

// ==================== REPORT GENERATION ====================

// Customer spending analysis report
exports.getCustomerSpendingReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Set default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get all customers with their orders
    const customers = await User.find({ role: 'customer' })
      .populate({
        path: 'orders',
        match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['completed', 'delivered'] }
        },
        select: 'totalAmount createdAt'
      });
    
    // Calculate spending data for each customer
    const customerSpending = customers.map(customer => {
      const validOrders = customer.orders.filter(order => order.createdAt);
      const totalSpent = validOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const orderCount = validOrders.length;
      
      return {
        id: customer._id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        totalSpent,
        orderCount,
        orders: validOrders
      };
    }).filter(customer => customer.orderCount > 0);
    
    // Sort by total spent (descending)
    customerSpending.sort((a, b) => b.totalSpent - a.totalSpent);
    
    // Calculate statistics
    const totalRevenue = customerSpending.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const totalOrders = customerSpending.reduce((sum, customer) => sum + customer.orderCount, 0);
    const averageCustomerValue = customerSpending.length > 0 ? totalRevenue / customerSpending.length : 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get high-value customers (>LKR 100,000)
    const highValueCustomers = customerSpending.filter(customer => customer.totalSpent > 100000);
    
    // Get active customers (customers with orders in the period)
    const activeCustomers = customerSpending.length;
    
    // Calculate monthly revenue (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyCustomers = await User.find({ role: 'customer' })
      .populate({
        path: 'orders',
        match: {
          createdAt: { $gte: currentMonth },
          status: { $in: ['completed', 'delivered'] }
        },
        select: 'totalAmount'
      });
    
    const monthlyRevenue = monthlyCustomers.reduce((sum, customer) => {
      return sum + customer.orders.reduce((orderSum, order) => orderSum + order.totalAmount, 0);
    }, 0);
    
    res.json({
      success: true,
      totalCustomers: customers.length,
      activeCustomers,
      totalRevenue,
      monthlyRevenue,
      averageCustomerValue,
      averageOrderValue,
      totalOrders,
      customerSpending,
      highValueCustomers
    });
    
  } catch (error) {
    console.error('Customer spending report error:', error);
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

    // Add staff count to each department
    const departmentsWithStaffCount = await Promise.all(
      departments.map(async (dept) => {
        const staffCount = await User.countDocuments({ 
          role: 'staff', 
          department: dept._id,
          isActive: true 
        });
        
        return {
          ...dept.toObject(),
          staffCount
        };
      })
    );

    res.json({
      success: true,
      departments: departmentsWithStaffCount
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

    // Staff by department - simplified approach
    const departments = await Department.find();
    const staffByDepartment = await Promise.all(
      departments.map(async (dept) => {
        const count = await User.countDocuments({ 
          role: 'staff', 
          department: dept._id 
        });
        return {
          _id: dept._id,
          name: dept.name,
          count
        };
      })
    );

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
