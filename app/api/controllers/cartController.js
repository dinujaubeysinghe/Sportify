const { validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Discount = require('../models/Discount'); // Make sure this is imported
const Setting = require('../models/Settings');


exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price images stock category brand sku',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'brand', select: 'name' }
        ]
      });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id });
    }

    res.json({ success: true, cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { productId, quantity, selectedSize, selectedColor } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or not available' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock` });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id });

    const existingItem = cart.items.find(item =>
      item.product.toString() === productId &&
      item.selectedSize === selectedSize &&
      item.selectedColor === selectedColor
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock` });
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity, selectedSize, selectedColor, price: product.price });
    }

    await cart.save();
    await cart.populate({
        path: 'items.product',
        select: 'name price images stock category brand sku',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'brand', select: 'name' }
        ]
      });

    res.json({ success: true, message: 'Item added to cart successfully', cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { quantity } = req.body;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });

    const product = await Product.findById(item.product);
    if (!product || !product.isActive) return res.status(400).json({ success: false, message: 'Product is no longer available' });

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock` });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate({
        path: 'items.product',
        select: 'name price images stock category brand sku',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'brand', select: 'name' }
        ]
      });

    res.json({ success: true, message: 'Cart item updated successfully', cart });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });

    await cart.removeItem(itemId);
    await cart.populate({
        path: 'items.product',
        select: 'name price images stock category brand sku',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'brand', select: 'name' }
        ]
      });

    res.json({ success: true, message: 'Item removed from cart successfully', cart });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    await cart.clearCart();
    res.json({ success: true, message: 'Cart cleared successfully', cart });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.applyDiscount = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }

        const { code } = req.body;

        // 1. Fetch Cart
        const cart = await Cart.findOne({ user: req.user._id }).populate({
            path: 'items.product',
            select: 'price', // Only need price to calculate subtotal
        });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // 2. Calculate Subtotal (required for discount calculation)
        const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // 3. Find and Validate Discount from Model
        const discountDoc = await Discount.findOne({ code: code.toUpperCase() });
        
        if (!discountDoc) {
            return res.status(400).json({ success: false, message: 'Invalid discount code' });
        }
        
        if (!discountDoc.isValid()) {
            return res.status(400).json({ success: false, message: 'Discount code expired or inactive' });
        }

        // 4. Calculate Discount Amount using the model method
        const discountAmount = discountDoc.calculateDiscount(subtotal);
        
        // Handle $0 discount case (e.g., Free Shipping, though that logic isn't fully reflected here)
        if (discountAmount < 0) {
            // Should not happen with the current calculateDiscount, but acts as a safeguard
            return res.status(400).json({ success: false, message: 'Discount calculation failed' });
        }

        // 5. Apply Discount to Cart Document
        cart.appliedDiscount = { 
            code: discountDoc.code, 
            percentage: discountDoc.type === 'percentage' ? discountDoc.value : undefined, 
            amount: discountAmount 
        };
        
        // Note on Free Shipping: If discount.type was 'free_shipping', you would 
        // set cart.shippingCost = 0 and cart.appliedDiscount.amount = 0 here,
        // but for now, we only handle percentage/fixed and assume fixed $0 discounts
        // mean 0 monetary discount.

        await cart.save(); // This triggers the cartSchema pre('save') hook, which calculates cart.total

        // 6. Respond with the updated cart (including the new discounted total)
        // Re-populate for the response to the frontend
        await cart.populate({
            path: 'items.product',
            select: 'name price images stock category brand sku',
            populate: [
                { path: 'category', select: 'name' },
                { path: 'brand', select: 'name' }
            ]
        });

        res.json({ success: true, message: 'Discount code applied successfully', cart });
    } catch (error) {
        console.error('Apply discount error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.removeDiscount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.appliedDiscount = null;
    await cart.save();
    await cart.populate({
        path: 'items.product',
        select: 'name price images stock category brand sku',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'brand', select: 'name' }
        ]
      });

    res.json({ success: true, message: 'Discount code removed successfully', cart });
  } catch (error) {
    console.error('Remove discount error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateShipping = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.shippingAddress = req.body;
    await cart.save();

    res.json({ success: true, message: 'Shipping address updated successfully', cart });
  } catch (error) {
    console.error('Update shipping address error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price images stock category brand sku',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'brand', select: 'name' }
        ]
      });

    if (!cart) {
      return res.json({
        success: true,
        summary: { itemCount: 0, subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 }
      });
    }

    // Use a temporary save/reload to ensure totals are fresh before fetching summary
    // Since getSummary is mostly for displaying the final computed values (which should be correct after every save/update), 
    // we'll rely on the pre-save hook having fired previously, but re-run it safely here if needed.
    // For simplicity, we assume cart.tax and cart.total are correct based on the last save.

    const summary = cart.getSummary();
    
    // NOTE: If cart.getSummary() returns raw subtotal/discount, you must recalculate 
    // tax here for display purposes ONLY, as the Mongoose hook handles the actual save.
    // However, since the Mongoose pre-save hook is now the source of truth,
    // we should fetch the current rate to verify the summary logic:
    const globalSettings = await Setting.getGlobalSettings();
    const globalTaxRate = globalSettings.taxRate / 100;
    const undiscountedSubtotal = summary.subtotal - (summary.discount || 0);

    summary.tax = +(undiscountedSubtotal * globalTaxRate).toFixed(2); // <--- DYNAMIC TAX RATE APPLIED
    summary.total = +(summary.subtotal + summary.tax - (summary.discount || 0) + (summary.shipping || 0)).toFixed(2);
    
    res.json({ success: true, summary });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];           // Remove all items
    cart.appliedDiscount = null; // Reset any applied discount
    cart.shippingAddress = null; 
    await cart.save();

    res.json({ success: true, message: 'Cart cleared successfully', cart });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
