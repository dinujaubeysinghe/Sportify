const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedSize: String,
  selectedColor: String,
  image: String,
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // supplier reference
    required: true
  },
  paidToSupplier: {
    type: Boolean,
    default: false
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  discount: {
    code: String,
    amount: Number,
    percentage: Number
  },
  total: {
    type: Number,
    required: true
  },

  // Shipment fields for the whole order
  trackingNumber: String,
  carrier: String,
  shipmentStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  shippedAt: Date,
  deliveredAt: Date,
  shipmentNotes: String,

  estimatedDelivery: Date,
  notes: String,
  cancellationReason: String,
  refundAmount: Number,
  refundDate: Date
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `SPF-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(status, notes = '') {
  this.orderStatus = status;
  if (notes) this.notes = notes;
  return this.save();
};

// Method to cancel order
orderSchema.methods.cancelOrder = function(reason) {
  this.orderStatus = 'cancelled';
  this.cancellationReason = reason;
  return this.save();
};

// Method to process refund
orderSchema.methods.processRefund = function(amount) {
  this.paymentStatus = 'refunded';
  this.refundAmount = amount;
  this.refundDate = new Date();
  return this.save();
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' }
      }
    }
  ]);

  const statusStats = await this.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    overview: stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
    statusBreakdown: statusStats
  };
};

// Inside orderSchema.methods

// Supplier updates shipment status
orderSchema.methods.updateShipmentStatus = function({ status, trackingNumber, carrier, notes }) {
  // Only allow valid statuses
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
  if (!validStatuses.includes(status)) throw new Error('Invalid shipment status');

  this.shipmentStatus = status;
  if (trackingNumber !== undefined) this.trackingNumber = trackingNumber;
  if (carrier !== undefined) this.carrier = carrier;
  if (notes !== undefined) this.shipmentNotes = notes;

  // Update shippedAt or deliveredAt automatically
  if (status === 'shipped') this.shippedAt = new Date();
  if (status === 'delivered') this.deliveredAt = new Date();

  return this.save();
};

// Admin or Staff updates payment status
orderSchema.methods.updatePaymentStatus = function(newStatus) {
  const validPayments = ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'];
  if (!validPayments.includes(newStatus)) throw new Error('Invalid payment status');

  this.paymentStatus = newStatus;
  return this.save();
};


module.exports = mongoose.model('Order', orderSchema);
