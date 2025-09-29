const { validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

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
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { code } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'items.product',
        select: 'name price images stock category brand sku',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'brand', select: 'name' }
        ]
      });
    if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

    const validDiscountCodes = {
      'WELCOME10': { percentage: 10, type: 'percentage' },
      'SAVE20': { percentage: 20, type: 'percentage' },
      'FREESHIP': { amount: 0, type: 'free_shipping' }
    };

    const discount = validDiscountCodes[code.toUpperCase()];
    if (!discount) return res.status(400).json({ success: false, message: 'Invalid discount code' });

    const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    let discountAmount = 0;
    if (discount.type === 'percentage') discountAmount = subtotal * (discount.percentage / 100);
    else if (discount.type === 'fixed_amount') discountAmount = discount.amount;

    cart.appliedDiscount = { code: code.toUpperCase(), percentage: discount.percentage, amount: discountAmount };
    await cart.save();

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

    const summary = cart.getSummary();
    // Calculate tax (example: 8% tax rate)
    summary.tax = +(summary.subtotal * 0.08).toFixed(2);
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
