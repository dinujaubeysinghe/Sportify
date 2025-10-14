const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

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

    if (req.query.isActive === 'true') {
        filter.isActive = true;
    } 


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

    // Destructure inventory-related fields and product details from the request body
    const {
      currentStock,
      minStockLevel,
      ...productDetails
    } = req.body;

    // Check for duplicate SKU first to avoid unnecessary operations
    const existing = await Product.findOne({
      sku: productDetails.sku.toUpperCase(),
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Product with this SKU already exists" });
    }

    const productData = { ...productDetails };
    productData.supplier = req.user._id;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        alt: productData.name,
        isPrimary: index === 0,
      }));
    }

    // --- Create Product and Inventory ---
    // Note: For better data integrity, you should wrap these two database
    // operations in a Mongoose transaction. This ensures that if the inventory
    // creation fails, the product creation is rolled back.

    const product = await Product.create(productData);

    // Prepare data for the new inventory document
    const inventoryData = {
      product: product._id,
      currentStock: product.stock || 0,
      minStockLevel: minStockLevel || 5,
    };

    const inventory = await Inventory.create(inventoryData);

    res.status(201).json({
      success: true,
      message: "Product and inventory created successfully",
      product,
      inventory, // Include the new inventory record in the response
    });
    
  } catch (error) {
    console.error("Create product error:", error);
    // If an error occurs, especially between product and inventory creation,
    // you might have an orphaned product without inventory. Transactions prevent this.
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

    const inventoryUpdated = await Inventory.findOneAndUpdate(
      {product:updated._id},
      {currentStock: updated.stock, minStockLevel:updated.minStockLevel },
      { new: true}
    );

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
