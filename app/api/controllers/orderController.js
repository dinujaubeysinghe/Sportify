const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const sendEmail = require('../utils/sendEmail');

const {
    orderConfirmationTemplate,
    orderShippedTemplate,
    orderDeliveredTemplate,
    orderCancelledTemplate,
} = require('../emails/emailTemplates');

// Supplier endpoints
// @desc    Get orders containing items for the authenticated supplier
// @route   GET /api/orders/supplier/my
// @access  Private (Supplier)
exports.getSupplierOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const matchSupplier = { 'items.supplier': req.user._id };
    if (req.query.status) matchSupplier['items.shipmentStatus'] = req.query.status;

    const orders = await Order.find(matchSupplier)
      .populate('user', 'firstName lastName')
      .populate('items.product', 'name images supplier')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(matchSupplier);

    // Map to only include supplier-relevant items
    const mapped = orders.map(o => ({
      _id: o._id,
      createdAt: o.createdAt,
      orderNumber: o.orderNumber,
      user: o.user,
      items: o.items.filter(it => it.supplier?.toString() === req.user._id.toString()),
      shipmentStatus: o.shipmentStatus,
      paymentStatus: o.paymentStatus,
      subtotal:o.subtotal,
      trackingNumber:o.trackingNumber,
    }));

    res.json({ success: true, count: mapped.length, total, page, pages: Math.ceil(total / limit), orders: mapped });
  } catch (error) {
    console.error('Get supplier orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update shipment for a specific order item by supplier
// @route   PUT /api/orders/:orderId/items/:itemId/shipment
// @access  Private (Supplier)
exports.updateSupplierShipment = async (req, res) => {
  try {
    const { trackingNumber, carrier, shipmentStatus, shipmentNotes } = req.body;
    const order = await Order.findById(req.params.orderId).populate('items.product', 'supplier name');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const item = order.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Order item not found' });

    if (item.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
    }

    if (trackingNumber !== undefined) item.trackingNumber = trackingNumber;
    if (carrier !== undefined) item.carrier = carrier;
    if (shipmentNotes !== undefined) item.shipmentNotes = shipmentNotes;
    if (shipmentStatus) {
      const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
      if (!allowed.includes(shipmentStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid shipment status' });
      }
      item.shipmentStatus = shipmentStatus;
      if (shipmentStatus === 'shipped') item.shippedAt = new Date();
      if (shipmentStatus === 'delivered') item.deliveredAt = new Date();
    }

    await order.save();

    res.json({ success: true, message: 'Shipment updated', item });
  } catch (error) {
    console.error('Update supplier shipment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price images stock supplier');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Check stock
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`
        });
      }
    }

    // Map cart items to order items, including supplier and paidToSupplier
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.price,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      image: item.product.images[0]?.url || '',
      supplier: item.product.supplier, // automatically assign supplier
      paidToSupplier: false           // initialize as unpaid
    }));

    // Calculate totals
    const subtotal = cart.items.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
    const discountAmount = cart.appliedDiscount?.amount || 0;
    const tax = parseFloat(((subtotal - discountAmount) * 0.08).toFixed(2));
    const shippingCost = parseFloat(cart.shippingCost || 0);
    const total = parseFloat((subtotal - discountAmount + tax + shippingCost).toFixed(2));

    // Create order
    const orderData = {
      user: req.user._id,
      items: orderItems,
      shippingAddress: req.body.shippingAddress,
      billingAddress: req.body.billingAddress || req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      subtotal,
      tax,
      shippingCost,
      discount: cart.appliedDiscount ? {
        code: cart.appliedDiscount.code,
        amount: discountAmount,
        percentage: cart.appliedDiscount.percentage
      } : null,
      total
    };

    const order = await Order.create(orderData);

    // Decrement stock product
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }
    // Decrement stock inventory
    for (const item of cart.items) {
      await Inventory.findOneAndUpdate({product:item.product._id}, { $inc: { currentStock: -item.quantity, availableStock: -item.quantity } });
    }

    // Clear cart
    await cart.clearCart();

    // Send email
    try {
        await sendEmail({
            to: req.user.email,
            subject: 'Your Order Confirmation',
            html: orderConfirmationTemplate(order, req.user.firstName)
        });
    } catch (err) {
        console.error('Failed to send order confirmation email:', err);
    }

    res.status(201).json({ success: true, message: 'Order created successfully', order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private (Customer)
exports.getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({ success: true, count: orders.length, total, page, pages: Math.ceil(total / limit), orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (Customer, Admin, Staff)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images category brand');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (req.user.role === 'customer' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateOrderShipment = async (req, res) => {
  try {
    const { trackingNumber, carrier, shipmentStatus, shipmentNotes } = req.body;
    console.log('s',shipmentStatus);

    const order = await Order.findById(req.params.id).populate('items.product', 'supplier name');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.paymentStatus) return res.status(401).json({ success: false, message: 'Payment not completed!' });
    // Ensure supplier is responsible for at least one item
    const hasItem = order.items.some(it => it.supplier?.toString() === req.user._id.toString());
    if (!hasItem) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order shipment' });
    }

    if (shipmentStatus) {
      const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
      if (!allowed.includes(shipmentStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid shipment status' });
      }
      order.shipmentStatus = shipmentStatus;
      if (shipmentStatus === 'shipped') order.shippedAt = new Date();
      if (shipmentStatus === 'delivered') order.deliveredAt = new Date();
    }

    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (carrier !== undefined) order.carrier = carrier;
    if (shipmentNotes !== undefined) order.shipmentNotes = shipmentNotes;

    await order.save();
    console.log(order);
    res.json({ success: true, message: 'Order shipment updated', order });
  } catch (error) {
    console.error('Update order shipment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer, Admin, Staff)
exports.cancelOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (req.user.role === 'customer' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    await order.cancelOrder(reason);

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
    // Send cancellation email
    try {
        await sendEmail({
            to: order.user.email,
            subject: 'Your Order is Cancelled',
            html: orderCancelledTemplate(order, order.user.firstName, reason)
        });
    } catch (err) {
        console.error('Failed to send order cancelled email:', err);
    }

    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all orders (Admin/Staff)
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({ success: true, count: orders.length, total, page, pages: Math.ceil(total / limit), orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.getOrderStats();
    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ success: true, stats, recentOrders });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// @desc    Update payment status (Admin/Staff only)
// @route   PUT /api/orders/:id/payment
// @access  Private (Admin, Staff)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.paymentStatus = paymentStatus;
    await order.save();

    res.json({ success: true, message: 'Payment status updated', order });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};