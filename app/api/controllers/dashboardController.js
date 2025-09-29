const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// ===================== DASHBOARD STATISTICS =====================
// @desc    Get comprehensive dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin, Staff)
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    // Get order statistics
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$shipmentStatus', 'pending'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$shipmentStatus', 'delivered'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$shipmentStatus', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$shipmentStatus', 'shipped'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } },
          totalSuppliers: { $sum: { $cond: [{ $eq: ['$role', 'supplier'] }, 1, 0] } },
          totalStaff: { $sum: { $cond: [{ $eq: ['$role', 'staff'] }, 1, 0] } },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    // Get product statistics
    const productStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: ['$isActive', 1, 0] } },
          lowStockProducts: {
            $sum: { $cond: [{ $lte: ['$stock', '$minStockLevel'] }, 1, 0] }
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          }
        }
      }
    ]);

    // Get notification statistics
    const notificationStats = await Notification.aggregate([
      {
        $group: {
          _id: null,
          totalNotifications: { $sum: 1 },
          unreadNotifications: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } }
        }
      }
    ]);

    // Get today's statistics
    const todayStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(today.setHours(0, 0, 0, 0)) }
        }
      },
      {
        $group: {
          _id: null,
          todayOrders: { $sum: 1 },
          todayRevenue: { $sum: '$total' }
        }
      }
    ]);

    // Get yesterday's statistics for comparison
    const yesterdayStats = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(yesterday.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(0, 0, 0, 0))
          }
        }
      },
      {
        $group: {
          _id: null,
          yesterdayOrders: { $sum: 1 },
          yesterdayRevenue: { $sum: '$total' }
        }
      }
    ]);

    // Get recent activity
    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$minStockLevel'] },
      isActive: true
    })
      .populate('category', 'name')
      .populate('brand', 'name')
      .limit(5);

    const stats = {
      orders: orderStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        processingOrders: 0,
        shippedOrders: 0
      },
      users: userStats[0] || {
        totalCustomers: 0,
        totalSuppliers: 0,
        totalStaff: 0,
        activeUsers: 0
      },
      products: productStats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0
      },
      notifications: notificationStats[0] || {
        totalNotifications: 0,
        unreadNotifications: 0
      },
      today: todayStats[0] || { todayOrders: 0, todayRevenue: 0 },
      yesterday: yesterdayStats[0] || { yesterdayOrders: 0, yesterdayRevenue: 0 },
      recentOrders,
      recentUsers,
      lowStockProducts
    };

    // Calculate percentage changes
    const orderChange = stats.yesterday.yesterdayOrders > 0 
      ? ((stats.today.todayOrders - stats.yesterday.yesterdayOrders) / stats.yesterday.yesterdayOrders * 100).toFixed(1)
      : 0;

    const revenueChange = stats.yesterday.yesterdayRevenue > 0 
      ? ((stats.today.todayRevenue - stats.yesterday.yesterdayRevenue) / stats.yesterday.yesterdayRevenue * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      stats: {
        ...stats,
        changes: {
          orders: parseFloat(orderChange),
          revenue: parseFloat(revenueChange)
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== RECENT ORDERS =====================
// @desc    Get recent orders for dashboard
// @route   GET /api/dashboard/recent-orders
// @access  Private (Admin, Staff)
exports.getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments();

    res.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== SUPPORT TICKETS (Notifications) =====================
// @desc    Get support tickets/notifications for dashboard
// @route   GET /api/dashboard/support-tickets
// @access  Private (Admin, Staff)
exports.getSupportTickets = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      if (req.query.status === 'unread') filter.read = false;
      if (req.query.status === 'read') filter.read = true;
    }

    const notifications = await Notification.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(filter);

    res.json({
      success: true,
      count: notifications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      tickets: notifications
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== CREATE SUPPORT TICKET =====================
// @desc    Create a new support ticket/notification
// @route   POST /api/dashboard/support-tickets
// @access  Private (Admin, Staff)
exports.createSupportTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { user, title, message, link } = req.body;

    const notification = await Notification.create({
      user,
      title,
      message,
      link
    });

    await notification.populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket: notification
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== UPDATE SUPPORT TICKET =====================
// @desc    Update support ticket status
// @route   PUT /api/dashboard/support-tickets/:id
// @access  Private (Admin, Staff)
exports.updateSupportTicket = async (req, res) => {
  try {
    const { read, title, message, link } = req.body;

    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    const updateData = {};
    if (read !== undefined) updateData.read = read;
    if (title) updateData.title = title;
    if (message) updateData.message = message;
    if (link !== undefined) updateData.link = link;

    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Support ticket updated successfully',
      ticket: updatedNotification
    });
  } catch (error) {
    console.error('Update support ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== DELETE SUPPORT TICKET =====================
// @desc    Delete support ticket
// @route   DELETE /api/dashboard/support-tickets/:id
// @access  Private (Admin, Staff)
exports.deleteSupportTicket = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Support ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete support ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== ORDER MANAGEMENT =====================
// @desc    Update order status
// @route   PUT /api/dashboard/orders/:id/status
// @access  Private (Admin, Staff)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { shipmentStatus, paymentStatus, notes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updateData = {};
    if (shipmentStatus) {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
      if (!validStatuses.includes(shipmentStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid shipment status' });
      }
      updateData.shipmentStatus = shipmentStatus;
      
      if (shipmentStatus === 'shipped') updateData.shippedAt = new Date();
      if (shipmentStatus === 'delivered') updateData.deliveredAt = new Date();
    }

    if (paymentStatus) {
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid payment status' });
      }
      updateData.paymentStatus = paymentStatus;
    }

    if (notes) updateData.notes = notes;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email')
     .populate('items.product', 'name images');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== USER MANAGEMENT =====================
// @desc    Get users for dashboard management
// @route   GET /api/dashboard/users
// @access  Private (Admin, Staff)
exports.getDashboardUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
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
    console.error('Get dashboard users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== PRODUCT MANAGEMENT =====================
// @desc    Get products for dashboard management
// @route   GET /api/dashboard/products
// @access  Private (Admin, Staff)
exports.getDashboardProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.stockStatus) {
      if (req.query.stockStatus === 'low') {
        filter.$expr = { $lte: ['$stock', '$minStockLevel'] };
      } else if (req.query.stockStatus === 'out') {
        filter.stock = 0;
      }
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .populate('supplier', 'businessName firstName lastName')
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products
    });
  } catch (error) {
    console.error('Get dashboard products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== ANALYTICS =====================
// @desc    Get dashboard analytics
// @route   GET /api/dashboard/analytics
// @access  Private (Admin, Staff)
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Sales analytics
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productName: '$product.name',
          productImage: { $arrayElemAt: ['$product.images.url', 0] },
          totalSold: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Customer analytics
    const customerData = await User.aggregate([
      {
        $match: {
          role: 'customer',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        salesData,
        topProducts,
        customerData,
        period: days
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
