const { validationResult } = require('express-validator');
const Product = require('../models/Product');

// ===================== GET ALL PRODUCTS =====================
exports.getProducts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { };

    // --- CRITICAL FIX START: Filter by isActive ---
    // The frontend sends isActive=true. We filter based on that.
    // If the frontend does NOT send the parameter (e.g., admin route), 
    // you might skip this line or apply different logic. 
    // Here, we explicitly listen for the 'true' string from the query param.
    if (req.query.isActive === 'true') {
        filter.isActive = true;
    } 
    // If you want all public-facing routes to ONLY show active products by default:
    // else { filter.isActive = true; } 
    // For now, we only apply the filter when requested by the client.
    // --- CRITICAL FIX END ---

    if (req.query.category) filter.category = req.query.category;
    if (req.query.brand) filter.brand = new RegExp(req.query.brand, 'i');
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    if (req.query.search) filter.$text = { $search: req.query.search };
    if (req.query.featured === 'true') filter.isFeatured = true;

    let sort = { createdAt: -1 };
    switch (req.query.sort) {
      case 'price_asc': sort = { price: 1 }; break;
      case 'price_desc': sort = { price: -1 }; break;
      case 'name_asc': sort = { name: 1 }; break;
      case 'name_desc': sort = { name: -1 }; break;
      case 'newest': sort = { createdAt: -1 }; break;
      case 'rating': sort = { 'ratings.average': -1 }; break;
    }

    const products = await Product.find(filter)
      .populate('supplier', 'businessName firstName lastName')
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort(sort).skip(skip).limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== GET SINGLE PRODUCT =====================
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'businessName firstName lastName email')
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('reviews.user', 'firstName lastName profileImage');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== CREATE PRODUCT =====================
exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    console.log('req',req.body);
    const productData = { ...req.body };   // ✅ FIXED

    // Clean up images field if frontend sends it as a string
    if (typeof productData.images === "string") {
      delete productData.images;
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        alt: productData.name,
        isPrimary: index === 0,
      }));
    }

    productData.supplier = req.user._id;

    // Check for duplicate SKU
    const existing = await Product.findOne({
      sku: productData.sku.toUpperCase(),
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Product with this SKU already exists" });
    }

    const product = await Product.create(productData);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// ===================== UPDATE PRODUCT =====================
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role === 'supplier' && product.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }

    const updateData = { ...req.body };

    // Remove any invalid "images" string coming from the form
    if (typeof updateData.images === 'string') {
      delete updateData.images;
    }

    // Handle new uploaded files
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        alt: updateData.name || product.name,
        isPrimary: index === 0
      }));

      updateData.images = [...product.images, ...newImages];
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('supplier', 'businessName firstName lastName');

    res.json({ success: true, message: 'Product updated successfully', product: updated });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// ===================== DELETE PRODUCT =====================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.user.role === 'supplier' && product.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== ADD REVIEW =====================
exports.addReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const existing = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this product' });

    const review = { user: req.user._id, rating: req.body.rating, comment: req.body.comment };
    product.reviews.push(review);

    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.ratings.average = totalRating / product.reviews.length;
    product.ratings.count = product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: 'Review added successfully' });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== GET CATEGORIES & BRANDS =====================
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true });
    res.json({ success: true, brands });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
