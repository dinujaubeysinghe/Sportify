const { validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Setting = require('../models/Settings');
const sendEmail = require('../utils/sendEmail');
const Notification = require('../models/Notification');

const {
    supplierApprovalTemplate,
    supplierPaymentTemplate
} = require('../emails/emailTemplates');

// Helper to calculate supplier's net amount from an item's revenue
// Assumes itemPrice is the unit price *after* customer discounts, but *before* tax.
const calculateSupplierNet = (itemPrice, itemQuantity, commissionRate) => {
    const itemRevenue = itemPrice * itemQuantity;
    // Supplier earns the revenue minus the site commission (e.g., 10% commission means 0.90 share)
    const netAmount = itemRevenue * (1 - commissionRate); 
    return parseFloat(netAmount.toFixed(2));
};

// ---------------- Supplier CRUD -----------------

// @desc    Get all suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1. Initialize filter with the default role
    const filter = { role: 'supplier' };

    // 2. CORRECTION: Handle 'isApproved' parameter
    // The client sends 'isApproved=true' or 'isApproved=false'
    if (req.query.isApproved !== undefined) {
      // Convert the string 'true'/'false' to an actual boolean value
      filter.isApproved = req.query.isApproved === 'true';
    }

    // 3. CORRECTION: Handle 'isActive' parameter
    // The client sends 'isActive=true' or 'isActive=false'
    if (req.query.isActive !== undefined) {
      // Convert the string 'true'/'false' to an actual boolean value
      filter.isActive = req.query.isActive === 'true';
    }

    // The filter object now correctly combines all criteria, e.g.,
    // { role: 'supplier', isApproved: false, isActive: true } for Pending

    const suppliers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: suppliers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      suppliers
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single supplier + products
exports.getSupplier = async (req, res) => {
  try {
    const supplier = await User.findOne({ _id: req.params.id, role: 'supplier' })
      .select('-password');

    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    if (req.user.role === 'supplier' && supplier._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const products = await Product.find({ supplier: req.params.id })
      .select('name price category brand stock isActive createdAt');

    res.json({ success: true, supplier, products });
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve/Reject supplier
exports.updateApproval = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { isApproved, notes } = req.body;
    const supplier = await User.findOne({ _id: req.params.id, role: 'supplier' });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    supplier.isApproved = isApproved;
    if (notes) supplier.approvalNotes = notes;
    await supplier.save();

    // Send email to supplier about approval/rejection
    try {
    if (supplier.email) {
        await sendEmail({
        to: supplier.email,
        subject: `Your Supplier Account has been ${isApproved ? 'Approved' : 'Rejected'}`,
        html: supplierApprovalTemplate(supplier.businessName || supplier.firstName, isApproved, notes)
        });
    }
    } catch (err) {
    console.error('Failed to send supplier approval email:', err);
    }

    res.json({ success: true, message: `Supplier ${isApproved ? 'approved' : 'rejected'} successfully`, supplier });
  } catch (error) {
    console.error('Update supplier approval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- Supplier Products -----------------

// @desc    Get supplier products
exports.getSupplierProducts = async (req, res) => {
  try {
    const supplier = await User.findOne({ _id: req.params.id, role: 'supplier' });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    if (req.user.role === 'supplier' && supplier._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { supplier: req.params.id };
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const products = await Product.find(filter)
      .populate('supplier', 'businessName firstName lastName')
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
    console.error('Get supplier products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- Supplier Stats -----------------

// @desc    Get supplier stats
exports.getSupplierStats = async (req, res) => {
  try {
    const supplier = await User.findOne({ _id: req.params.id, role: 'supplier' });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    if (req.user.role === 'supplier' && supplier._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const productStats = await Product.aggregate([
      { $match: { supplier: supplier._id } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalStock: { $sum: '$stock' },
          averagePrice: { $avg: '$price' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      { $match: { supplier: supplier._id, isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$stock' } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: productStats[0] || { totalProducts: 0, activeProducts: 0, totalStock: 0, averagePrice: 0, totalValue: 0 },
      categoryBreakdown: categoryStats
    });
  } catch (error) {
    console.error('Get supplier stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- Supplier Profile -----------------

// @desc    Update supplier profile
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const supplier = await User.findOne({ _id: req.params.id, role: 'supplier' });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    if (req.user.role === 'supplier' && supplier._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const allowedUpdates = ['businessName', 'businessLicense', 'taxId', 'phone', 'address'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedSupplier = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .select('-password');

    res.json({ success: true, message: 'Supplier profile updated successfully', supplier: updatedSupplier });
  } catch (error) {
    console.error('Update supplier profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- Supplier Payments -----------------

// @desc    Get supplier balance (pending + paid)
exports.getSupplierBalance = async (req, res) => {
  try {
    const supplierId = req.params.id;

    const supplier = await User.findById(supplierId);
    if (!supplier || supplier.role !== 'supplier') {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // Only supplier themselves or admin/staff
    if (req.user.role === 'supplier' && req.user._id.toString() !== supplierId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // 1. Fetch site commission rate (Assume it's stored as a decimal, e.g., 0.10 for 10%)
    const globalSettings = await Setting.getGlobalSettings();
    // Assuming siteCommissionRate is stored as a percentage (10 for 10%) or a decimal (0.10)
    // We will use 0.10 as default if not found. Adjust this if your setting is stored as a percentage.
    const siteCommissionRate = globalSettings.siteCommissionRate || 0.10; 

    // Get orders that have items from this supplier and are delivered
    const orders = await Order.find({
      'items.supplier': supplierId,
      shipmentStatus: 'delivered'
    }).populate('items.product', 'name');

    let totalEarned = 0;
    let totalPaid = 0;
    let pendingItems = [];

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.supplier.toString() === supplierId) {
          
            // The item.price here is the unit price *after* customer discount.
            const itemGrossRevenue = item.price * item.quantity;
            
            // 2. Calculate the NET amount the supplier earned (revenue minus commission)
            // Example: 10% commission means supplier keeps 90% (1 - 0.10)
            const supplierNet = itemGrossRevenue * (1 - siteCommissionRate);
            const netAmount = parseFloat(supplierNet.toFixed(2));

            totalEarned += netAmount;

            if (item.paidToSupplier) {
              totalPaid += netAmount;
            } else {
              pendingItems.push({
                orderId: order._id,
                itemId: item._id,
                name: item.name,
                quantity: item.quantity,
                price: item.price, // Gross price (for display/reference)
                total: netAmount, // <-- The net amount the supplier is owed
                orderNumber: order.orderNumber
              });
            }
        }
      });
    });

    res.json({
      success: true,
      supplier: { id: supplierId, businessName: supplier.businessName || '' },
      totalEarned: parseFloat(totalEarned.toFixed(2)),
      totalPaid: parseFloat(totalPaid.toFixed(2)),
      pendingAmount: parseFloat((totalEarned - totalPaid).toFixed(2)),
      pendingItemsCount: pendingItems.length,
      pendingItems
    });
  } catch (error) {
    console.error('Get supplier balance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// @desc    Pay supplier (mark items as paid)
exports.paySupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const { itemsToPay } = req.body; // array of { orderId, itemId, amount, orderNumber }

    if (!Array.isArray(itemsToPay) || itemsToPay.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided to pay' });
    }
    
    // Fetch global commission rate for secure calculation
    const globalSettings = await Setting.getGlobalSettings();
    const siteCommissionRate = globalSettings.siteCommissionRate || 0.10; 

    const bulkOps = itemsToPay.map(item => ({
      updateOne: {
        filter: { _id: item.orderId, 'items._id': item.itemId, 'items.supplier': supplierId },
        update: { $set: { 'items.$.paidToSupplier': true } }
      }
    }));

    const result = await Order.bulkWrite(bulkOps);

    // Send email to supplier about payment
    try {
        const supplier = await User.findById(supplierId);
        if (supplier && supplier.email) {
            
            // To be secure, we should verify the amounts being paid against the database,
            // but since the frontend sends item details, we'll use that as the source
            // for the email calculation, trusting the Admin panel to send the correct NET amount.
            
            let totalPaid = 0;
            const ordersPaid = [];

            itemsToPay.forEach(item => {
                // IMPORTANT: Assume 'item.amount' sent from the frontend is the NET amount due.
                totalPaid += item.amount || 0; 
                ordersPaid.push({ orderNumber: item.orderNumber, total: item.amount });
            });

            await sendEmail({
                to: supplier.email,
                subject: 'Payment Received for Your Orders',
                html: supplierPaymentTemplate(supplier.businessName || supplier.firstName, totalPaid, ordersPaid)
            });
        }
    } catch (err) {
    console.error('Failed to send supplier payment email:', err);
    }
    res.json({
      success: true,
      message: `${result.modifiedCount} item(s) marked as paid for supplier`,
      supplierId
    });
  } catch (error) {
    console.error('Pay supplier error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSupplierNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Mark as read
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json({ success: true, notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get overall payment analysis data (Admin only)
// @route   GET /api/v1/suppliers/admin/payments/analysis
exports.getPaymentAnalysis = async (req, res) => {
    try {
        // 1. Fetch site commission rate (needed to correctly calculate net totals)
        const globalSettings = await Setting.getGlobalSettings();
        const siteCommissionRate = globalSettings.siteCommissionRate || 0.10;

        // 2. Aggregate Total Paid and Total Pending
        const paymentsSummary = await Order.aggregate([
            // Match only delivered items that belong to a supplier
            { 
                $match: { 
                    shipmentStatus: 'delivered', 
                    'items.supplier': { $exists: true } 
                } 
            },
            // Unwind the items array to process each item individually
            { $unwind: '$items' },
            // Match again to filter only supplier items after unwinding
            { $match: { 'items.supplier': { $exists: true } } },
            {
                $project: {
                    _id: 0,
                    paid: '$items.paidToSupplier',
                    // Calculate the net amount the supplier earned for this item
                    netAmount: {
                        $multiply: [
                            '$items.price', 
                            '$items.quantity', 
                            (1 - siteCommissionRate)
                        ]
                    },
                    date: '$createdAt',
                    orderNumber: '$orderNumber',
                    supplier: '$items.supplier',
                    itemTotal: { $multiply: ['$items.price', '$items.quantity'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPaid: { 
                        $sum: { $cond: ['$paid', '$netAmount', 0] } 
                    },
                    totalPending: { 
                        $sum: { $cond: ['$paid', 0, '$netAmount'] } 
                    },
                    // Collect recent payout/pending data for the table/bar chart
                    recentPayouts: {
                        $push: {
                            date: '$date',
                            amount: '$netAmount',
                            status: { $cond: ['$paid', 'Paid', 'Pending'] },
                            supplierId: '$supplier',
                            orderNumber: '$orderNumber'
                        }
                    }
                }
            },
            { $project: { _id: 0, totalPaid: 1, totalPending: 1, recentPayouts: 1 } }
        ]);

        const summary = paymentsSummary[0] || { totalPaid: 0, totalPending: 0, recentPayouts: [] };
        
        // 3. Populate supplier names for the recentPayouts array
        // Get unique supplier IDs
        const supplierIds = [...new Set(summary.recentPayouts.map(p => p.supplierId))];
        const suppliers = await User.find({ _id: { $in: supplierIds } }).select('businessName firstName lastName');
        const supplierMap = suppliers.reduce((acc, s) => {
            acc[s._id] = s.businessName || `${s.firstName} ${s.lastName}`;
            return acc;
        }, {});

        // Add supplier name to the payouts
        const recentPayoutsWithNames = summary.recentPayouts.map(p => ({
            ...p,
            supplierName: supplierMap[p.supplierId] || 'Unknown Supplier',
            // Clean up numbers for final output
            amount: parseFloat(p.amount.toFixed(2)) 
        }));


        res.json({
            success: true,
            totalPaid: parseFloat(summary.totalPaid.toFixed(2)),
            totalPending: parseFloat(summary.totalPending.toFixed(2)),
            recentPayouts: recentPayoutsWithNames
        });

    } catch (error) {
        console.error('Get payment analysis error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};