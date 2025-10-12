const Brand = require('../models/Brand');
const { validationResult } = require('express-validator');

exports.createBrand = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name } = req.body;
    const logo = req.file ? { url: req.file.path, alt: name } : undefined;

    const brand = await Brand.create({ name, logo });
    res.status(201).json({ success: true, brand });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}).sort({ name: 1 });
    res.json({ success: true, brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, brand });
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });

    if (name) brand.name = name;
    if (req.file) brand.logo = { url: req.file.path, alt: name || brand.name };

    await brand.save();
    res.json({ success: true, brand });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });


    res.json({ success: true, message: 'Brand deactivated successfully' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.activeBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });

    brand.isActive = true;
    await brand.save();
    res.json({ success: true, message: 'Brand activated successfully' });
  } catch (error) {
    console.error('Activate brand error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
