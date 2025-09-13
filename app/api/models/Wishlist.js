const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Method to add item to wishlist
wishlistSchema.methods.addItem = function(productId) {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (!existingItem) {
    this.items.push({ product: productId });
  }
  
  return this.save();
};

// Method to remove item from wishlist
wishlistSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => 
    item.product.toString() !== productId.toString()
  );
  return this.save();
};

// Method to check if item is in wishlist
wishlistSchema.methods.hasItem = function(productId) {
  return this.items.some(item => 
    item.product.toString() === productId.toString()
  );
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
