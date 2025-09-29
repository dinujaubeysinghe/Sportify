const mongoose = require('mongoose');
const Notification = require('./Notification'); 
const { sendEmail } = require('../utils/sendEmail');
const { lowStockTemplate } = require('../emails/emailTemplates');
const Product = require('./Product'); 


const stockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['stock_in', 'stock_out', 'adjustment', 'damage', 'return'], required: true },
  quantity: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reason: { type: String, required: true },
  reference: { type: String, trim: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String, trim: true },
  cost: { type: Number, min: 0 }
}, { timestamps: true });

const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  currentStock: { type: Number, required: true, min: 0, default: 0 },
  reservedStock: { type: Number, default: 0, min: 0 },
  availableStock: { type: Number, default: 0, min: 0 },
  minStockLevel: { type: Number, required: true, min: 0, default: 5 },
  maxStockLevel: { type: Number, min: 0 },
  reorderPoint: { type: Number, min: 0 },
  reorderQuantity: { type: Number, min: 0 },
  lastRestocked: Date,
  lastStockOut: Date,
  totalStockIn: { type: Number, default: 0 },
  totalStockOut: { type: Number, default: 0 },
  averageCost: { type: Number, default: 0 },
  isLowStock: { type: Boolean, default: false },
  isOutOfStock: { type: Boolean, default: false },
  stockMovements: [stockMovementSchema]
}, { timestamps: true });

// ----------------------
// Helper: recalc stock
// ----------------------
inventorySchema.methods.updateStockFlags = function() {
  this.availableStock = this.currentStock - this.reservedStock;
  this.isLowStock = this.availableStock <= this.minStockLevel;
  this.isOutOfStock = this.availableStock <= 0;
};

// ----------------------
// Pre-save hook
// ----------------------
inventorySchema.pre('save', function(next) {
  this.updateStockFlags();
  next();
});

// ----------------------
// Pre-update hook
// ----------------------
inventorySchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (!update) return next();

  let currentStock = update.currentStock ?? update.$set?.currentStock;
  let reservedStock = update.reservedStock ?? update.$set?.reservedStock;
  let minStockLevel = update.minStockLevel ?? update.$set?.minStockLevel;

  if (currentStock !== undefined || reservedStock !== undefined || minStockLevel !== undefined) {
    const newAvailable = (currentStock ?? 0) - (reservedStock ?? 0);
    const newFlags = {
      availableStock: newAvailable,
      isLowStock: newAvailable <= (minStockLevel ?? 5),
      isOutOfStock: newAvailable <= 0
    };

    if (!update.$set) update.$set = {};
    Object.assign(update.$set, newFlags);
  }

  next();
});


// Helper to notify supplier
async function notifySupplier(product, inventory) {
  const supplier = product.supplier;
  if (!supplier || !supplier.email) return;

  const emailHTML = lowStockTemplate(product, inventory);

  // Send email
  await sendEmail({
    to: supplier.email,
    subject: `Low Stock Alert: ${product.name}`,
    html: emailHTML
  });

  // Save in-app notification
  await Notification.create({
    user: supplier._id,
    title: `Low Stock Alert: ${product.name}`,
    message: `Your product "${product.name}" is low in stock. Current stock: ${inventory.currentStock}, Reorder point: ${inventory.reorderPoint}`,
    link: `/products/${product._id}`
  });

  console.log(`Low stock notification sent to supplier: ${supplier.email}`);
}

// ----------------------
// Stock methods
// ----------------------
inventorySchema.methods.addStock = async function(quantity, reason, performedBy, options = {}) {
  const previousStock = this.currentStock;
  this.currentStock += quantity;
  this.totalStockIn += quantity;
  this.lastRestocked = new Date();

  this.stockMovements.push({
    product: this.product,
    type: 'stock_in',
    quantity,
    previousStock,
    newStock: this.currentStock,
    reason,
    performedBy,
    notes: options.notes,
    cost: options.cost
  });

  this.updateStockFlags();
  return this.save();
};

inventorySchema.methods.removeStock = async function(quantity, reason, performedBy, options = {}) {
  if (this.availableStock < quantity) {
    throw new Error('Insufficient stock available');
  }

  const previousStock = this.currentStock;
  this.currentStock -= quantity;
  this.totalStockOut += quantity;
  this.lastStockOut = new Date();

  this.stockMovements.push({
    product: this.product,
    type: 'stock_out',
    quantity,
    previousStock,
    newStock: this.currentStock,
    reason,
    performedBy,
    notes: options.notes,
    reference: options.reference
  });

  await this.save();

  // Check for low stock and notify
  if (this.currentStock <= this.reorderPoint) {
    const product = await Product.findById(this.product).populate('supplier');
    await notifySupplier(product, this);
  }

  return this;
};

inventorySchema.methods.reserveStock = async function(quantity) {
  if ((this.currentStock - this.reservedStock) < quantity) throw new Error('Insufficient stock for reservation');
  this.reservedStock += quantity;
  this.updateStockFlags();
  return this.save();
};

inventorySchema.methods.releaseReservedStock = async function(quantity) {
  this.reservedStock = Math.max(0, this.reservedStock - quantity);
  this.updateStockFlags();
  return this.save();
};

inventorySchema.methods.adjustStock = async function(newQuantity, reason, performedBy, options = {}) {
  const previousStock = this.currentStock;
  const difference = newQuantity - this.currentStock;

  this.currentStock = newQuantity;

  this.stockMovements.push({
    product: this.product,
    type: 'adjustment',
    quantity: Math.abs(difference),
    previousStock,
    newStock: this.currentStock,
    reason,
    performedBy,
    notes: options.notes
  });

  await this.save();

  // Check for low stock and notify
  if (this.currentStock <= this.reorderPoint) {
    const product = await Product.findById(this.product).populate('supplier');
    await notifySupplier(product, this);
  }

  return this;
};

// ----------------------
// Statics
// ----------------------
inventorySchema.statics.getLowStockProducts = function() {
  return this.find({ $or: [{ isLowStock: true }, { isOutOfStock: true }] })
    .populate('product', 'name sku category brand');
};

inventorySchema.statics.getInventorySummary = async function() {
  const summary = await this.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalStock: { $sum: '$currentStock' },
        totalReserved: { $sum: '$reservedStock' },
        totalAvailable: { $sum: '$availableStock' },
        lowStockCount: { $sum: { $cond: ['$isLowStock', 1, 0] } },
        outOfStockCount: { $sum: { $cond: ['$isOutOfStock', 1, 0] } }
      }
    }
  ]);

  return summary[0] || { totalProducts: 0, totalStock: 0, totalReserved: 0, totalAvailable: 0, lowStockCount: 0, outOfStockCount: 0 };
};

module.exports = mongoose.model('Inventory', inventorySchema);
