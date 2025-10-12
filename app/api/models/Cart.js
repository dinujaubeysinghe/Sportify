const mongoose = require('mongoose');
const Setting = require('./Settings'); 


const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [100, 'Quantity cannot exceed 100']
  },
  selectedSize: String,
  selectedColor: String,
  price: {
    type: Number,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  appliedDiscount: {
    code: String,
    percentage: Number,
    amount: Number
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight'],
    default: 'standard'
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', async function(next) {
    // 1. Fetch settings and calculate subtotal
    const globalSettings = await Setting.getGlobalSettings();
    const globalTaxRate = globalSettings.taxRate / 100; // e.g., 8 / 100 = 0.08

    let subtotal = 0;
  
    this.items.forEach(item => {
        subtotal += item.price * item.quantity;
    });
  
    // 2. Apply discount
    let discountAmount = 0;
    if (this.appliedDiscount) {
        if (this.appliedDiscount.percentage) {
            discountAmount = subtotal * (this.appliedDiscount.percentage / 100);
        } else if (this.appliedDiscount.amount) {
            discountAmount = this.appliedDiscount.amount;
        }
    }
  
    // 3. Calculate tax using the dynamic globalTaxRate
    this.tax = (subtotal - discountAmount) * globalTaxRate; // <-- CORRECTED LINE
  
    // 4. Calculate total
    this.total = subtotal - discountAmount + this.tax + this.shippingCost;
  
    next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity, options = {}) {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString() &&
    item.selectedSize === options.size &&
    item.selectedColor === options.color
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity,
      selectedSize: options.size,
      selectedColor: options.color,
      price: options.price
    });
  }
  
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.find(item => item._id.toString() === itemId.toString());
  if (item) {
    item.quantity = quantity;
  }
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.appliedDiscount = null;
  return this.save();
};

// Method to get cart summary
cartSchema.methods.getSummary = function() {
  const itemCount = this.items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  return {
    itemCount,
    subtotal,
    tax: this.tax,
    shipping: this.shippingCost,
    discount: this.appliedDiscount ? this.appliedDiscount.amount || 0 : 0,
    total: this.total
  };
};

module.exports = mongoose.model('Cart', cartSchema);
