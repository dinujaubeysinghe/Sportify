const { validationResult } = require('express-validator');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// ----------------------
// Get Inventory Summary
// ----------------------
exports.getInventorySummary = async (req, res) => {
  try {
    const summary = await Inventory.getInventorySummary();
    console.log(summary);
    res.json({ success: true, summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ----------------------
// Get Low Stock Products
// ----------------------
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Inventory.getLowStockProducts();
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ----------------------
// Supplier-scoped: Summary
// ----------------------
exports.getSupplierInventorySummary = async (req, res) => {
  try {
    const supplierId = req.user.role === 'supplier' ? req.user._id : req.query.supplierId;
    if (!supplierId) return res.status(400).json({ success: false, message: 'supplierId is required' });
    
    const supplierObjectId = new mongoose.Types.ObjectId(supplierId);
    console.log('supplierId:', supplierObjectId);

    // Get only inventory items where product belongs to supplier
    const items = await Inventory.find()
      .populate({
        path: 'product',
        select: 'supplier price',
        match: { supplier: supplierObjectId }
      })
      .lean(); // ⚡ better performance since we don’t need mongoose doc methods

    console.log('Inventory:', items);

    const ownItems = items.filter(i => i.product); // filtered by populate match
    console.log('own: ', ownItems);
    const summary = ownItems.reduce((acc, inv) => {
      acc.totalProducts += 1;
      acc.totalStock += inv.currentStock;
      acc.totalReserved += inv.reservedStock;
      acc.totalAvailable += inv.availableStock;
      if (inv.isLowStock) acc.lowStockCount += 1;
      if (inv.isOutOfStock) acc.outOfStockCount += 1;
      return acc;
    }, { totalProducts: 0, totalStock: 0, totalReserved: 0, totalAvailable: 0, lowStockCount: 0, outOfStockCount: 0 });

    res.json({ success: true, summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ----------------------
// Supplier-scoped: Low Stock
// ----------------------
exports.getSupplierLowStockProducts = async (req, res) => {
  try {
    const supplierId = req.user.role === 'supplier' ? req.user._id : req.query.supplierId;
    if (!supplierId) return res.status(400).json({ success: false, message: 'supplierId is required' });

    const products = await Inventory.find({ $or: [{ isLowStock: true }, { isOutOfStock: true }] })
      .populate({ path: 'product', select: 'name sku category brand images supplier', match: { supplier: supplierId } });

    const own = products.filter(p => p.product);
    res.json({ success: true, count: own.length, products: own });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ----------------------
// Supplier-scoped: List
// ----------------------
exports.getSupplierInventories = async (req, res) => {
  try {
    const supplierId = req.user.role === 'supplier' ? req.user._id : req.query.supplierId;
    if (!supplierId) return res.status(400).json({ success: false, message: 'supplierId is required' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const baseQuery = Inventory.find()
      .populate({ path: 'product', select: 'name sku category brand price images supplier', match: { supplier: supplierId } })
      .sort({ updatedAt: -1 });

    const all = await baseQuery.clone();
    const filtered = all.filter(i => i.product);
    const total = filtered.length;
    const pageItems = filtered.slice(skip, skip + limit);

    res.json({ success: true, count: pageItems.length, total, page, pages: Math.ceil(total / limit), inventory: pageItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ----------------------
// Get Inventory List
// ----------------------
exports.getInventories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.isLowStock === 'true') filter.isLowStock = true;
    if (req.query.isOutOfStock === 'true') filter.isOutOfStock = true;

    const inventory = await Inventory.find(filter)
      .populate('product', 'name sku category brand price images')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inventory.countDocuments(filter);

    res.json({ success: true, count: inventory.length, total, page, pages: Math.ceil(total / limit), inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ----------------------
// Get Single Inventory
// ----------------------
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate('product', 'name sku category brand price images')
      .populate('stockMovements.performedBy', 'firstName lastName email');

    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found' });

    res.json({ success: true, inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ----------------------
// Stock Movements
// ----------------------
exports.getStockMovements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found' });

    const movements = inventory.stockMovements
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit);

    const total = inventory.stockMovements.length;

    res.json({ success: true, count: movements.length, total, page, pages: Math.ceil(total / limit), movements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all stock movements for logged-in supplier
// @route   GET /inventory/supplier/movements
// @access  Private (Supplier)
exports.getSupplierStockMovements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Step 1: Get all products of the logged-in supplier
    const supplierProducts = await Product.find({ supplier: req.user.id }, '_id name sku');

    if (!supplierProducts.length) {
      return res.status(404).json({ success: false, message: 'No products found for this supplier' });
    }

    const productIds = supplierProducts.map(p => p._id);

    // Step 2: Get all inventories for these products
    const inventories = await Inventory.find({ product: { $in: productIds } }).populate('product', 'name sku');

    // Step 3: Combine all stock movements
    let allMovements = [];
    inventories.forEach(inv => {
      const movements = inv.stockMovements.map(m => ({
        ...m.toObject(),
        productName: inv.product.name,
        sku: inv.product.sku
      }));
      allMovements = allMovements.concat(movements);
    });

    // Step 4: Sort by newest first
    allMovements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Step 5: Paginate
    const paginated = allMovements.slice(skip, skip + limit);

    res.json({
      success: true,
      count: paginated.length,
      total: allMovements.length,
      page,
      pages: Math.ceil(allMovements.length / limit),
      movements: paginated
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ----------------------
// Add Stock
// ----------------------
exports.addStock = async (req, res) => {
  try {
    const errors = validationResult(req);
    console.log('error: ', errors);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { quantity, reason, cost, notes } = req.body;
    const { productId } = req.params;

    const qty = Number(quantity); // <-- convert to number
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Only supplier can add own products
    if (req.user.role === 'supplier' && !product.supplier.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Cannot add stock for this product' });
    }

    let inventory = await Inventory.findOne({ product: productId });
    if (!inventory) {
      inventory = await Inventory.create({ product: productId, currentStock: product.stock, minStockLevel: product.minStockLevel || 5 });
    }

    await inventory.addStock(qty, reason, req.user._id, { cost, notes });

    // Update product stock
    if(reason != 'Adding New Product'){
      product.stock = Number(product.stock) + qty;
      await product.save();
    }
    
    await inventory.populate('product', 'name sku category brand price images');
    res.json({ success: true, message: 'Stock added', inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ----------------------
// Remove Stock
// ----------------------
exports.removeStock = async (req, res) => {
  try {
    const errors = validationResult(req);
        console.log('error: ', errors);

    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { quantity, reason, reference, notes } = req.body;
    const { productId } = req.params;

    const qty = Number(quantity); // <-- convert to number
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const inventory = await Inventory.findOne({ product: productId });
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found' });

    await inventory.removeStock(qty, reason, req.user._id, { reference, notes });

    product.stock = Number(product.stock) - qty;
    if (product.stock < 0) product.stock = 0; // prevent negative stock
    await product.save();

    await inventory.populate('product', 'name sku category brand price images');
    res.json({ success: true, message: 'Stock removed', inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ----------------------
// Adjust Stock
// ----------------------
exports.adjustStock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { newQuantity, reason, notes } = req.body;
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let inventory = await Inventory.findOne({ product: productId });
    if (!inventory) {
      inventory = await Inventory.create({ product: productId, currentStock: product.stock, minStockLevel: product.minStockLevel || 5 });
    }

    await inventory.adjustStock(newQuantity, reason, req.user._id, { notes });

    product.stock = newQuantity;
    await product.save();

    await inventory.populate('product', 'name sku category brand price images');
    res.json({ success: true, message: 'Stock adjusted', inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ----------------------
// Update Inventory Settings
// ----------------------
exports.updateInventorySettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const allowedFields = ['minStockLevel', 'maxStockLevel', 'reorderPoint', 'reorderQuantity'];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const updatedInventory = await Inventory.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('product', 'name sku category brand price images');

    if (!updatedInventory) return res.status(404).json({ success: false, message: 'Inventory not found' });

    res.json({ success: true, message: 'Inventory settings updated', inventory: updatedInventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// ----------------------
// Reserve Stock
// ----------------------
exports.reserveStock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { quantity } = req.body;
    const { productId } = req.params;

    const inventory = await Inventory.findOne({ product: productId });
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found' });

    await inventory.reserveStock(quantity);

    await inventory.populate('product', 'name sku category brand price images');
    res.json({ success: true, message: `${quantity} units reserved`, inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ----------------------
// Release Reserved Stock
// ----------------------
exports.releaseReservedStock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { quantity } = req.body;
    const { productId } = req.params;

    const inventory = await Inventory.findOne({ product: productId });
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found' });

    await inventory.releaseReservedStock(quantity);

    await inventory.populate('product', 'name sku category brand price images');
    res.json({ success: true, message: `${quantity} units released from reservation`, inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
