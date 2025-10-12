const Discount = require('../models/Discount');

// Create a new discount
exports.createDiscount = async (req, res) => {
  try {
    const discount = new Discount(req.body);
    await discount.save();
    res.status(201).json({ success: true, message: 'Discount created successfully', discount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all discounts
exports.getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.json({ success: true, discounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single discount by ID
exports.getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) return res.status(404).json({ success: false, message: 'Discount not found' });
    res.json({ success: true, discount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a discount
exports.updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!discount) return res.status(404).json({ success: false, message: 'Discount not found' });
    res.json({ success: true, message: 'Discount updated successfully', discount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a discount
exports.deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) return res.status(404).json({ success: false, message: 'Discount not found' });
    res.json({ success: true, message: 'Discount deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Validate a discount code and calculate discount amount
exports.validateDiscount = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const discount = await Discount.findOne({ code: code.toUpperCase() });
    console.log(code);
    if (!discount) return res.status(404).json({ success: false, message: 'Invalid discount code' });

    if (!discount.isValid()) {
      return res.status(400).json({ success: false, message: 'Discount code expired or inactive' });
    }

    const discountAmount = discount.calculateDiscount(orderAmount);
    res.json({
      success: true,
      message: 'Discount applied successfully',
      discountAmount,
      finalAmount: orderAmount - discountAmount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
