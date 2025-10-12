const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Setting = require('../models/Settings'); // Import the new model
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

exports.updateSupplierStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { isApproved } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isApproved = isApproved;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      html: supplierApprovalTemplate(user.firstName,' ',user.lastName , isApproved, notes = 'Best of Luck!')
    });

    res.json({
      success: true,
      message: `Supplier ${isApproved ? 'activated' : 'deactivated'} successfully`,
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
