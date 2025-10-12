const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Check if discount is still valid
discountSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

// Calculate discount amount
discountSchema.methods.calculateDiscount = function(orderAmount) {
  if (!this.isValid()) return 0;
  
  if (this.type === 'percentage') {
    return (orderAmount * this.value) / 100;
  } else if (this.type === 'fixed') {
    return Math.min(this.value, orderAmount);
  }
  return 0;
};

module.exports = mongoose.model('Discount', discountSchema);
