const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'free_shipping'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrderAmount: {
    type: Number,
    default: 0
  },
  maximumDiscountAmount: {
    type: Number
  },
  applicableCategories: [{
    type: String,
    enum: [
      'football', 'basketball', 'soccer', 'tennis', 'golf', 
      'baseball', 'hockey', 'swimming', 'running', 'fitness',
      'outdoor', 'winter-sports', 'water-sports', 'combat-sports',
      'accessories', 'clothing', 'shoes', 'equipment'
    ]
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  userUsageLimit: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
discountSchema.index({ code: 1, isActive: 1 });
discountSchema.index({ startDate: 1, endDate: 1 });

// Method to check if discount is valid
discountSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive &&
         this.startDate <= now &&
         this.endDate >= now &&
         (this.usageLimit === null || this.usedCount < this.usageLimit);
};

// Method to check if user can use discount
discountSchema.methods.canUserUse = function(userId, orderAmount) {
  if (!this.isValid()) return false;
  
  if (orderAmount < this.minimumOrderAmount) return false;
  
  // Check user usage limit (would need to track user usage in a separate collection)
  // For now, we'll assume it's valid if the discount itself is valid
  
  return true;
};

// Method to calculate discount amount
discountSchema.methods.calculateDiscount = function(orderAmount) {
  if (!this.isValid() || orderAmount < this.minimumOrderAmount) {
    return 0;
  }
  
  let discountAmount = 0;
  
  switch (this.type) {
    case 'percentage':
      discountAmount = orderAmount * (this.value / 100);
      if (this.maximumDiscountAmount && discountAmount > this.maximumDiscountAmount) {
        discountAmount = this.maximumDiscountAmount;
      }
      break;
    case 'fixed_amount':
      discountAmount = Math.min(this.value, orderAmount);
      break;
    case 'free_shipping':
      // This would be handled separately in shipping calculation
      discountAmount = 0;
      break;
  }
  
  return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
};

// Method to increment usage count
discountSchema.methods.incrementUsage = function() {
  this.usedCount += 1;
  return this.save();
};

module.exports = mongoose.model('Discount', discountSchema);
