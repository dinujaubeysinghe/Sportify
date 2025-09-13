const express = require('express');
const router = express.Router();

// Import route modules
router.use('/auth', require('./routes/authRoutes'));
router.use('/users', require('./routes/userRoutes'));
router.use('/products', require('./routes/productRoutes'));
router.use('/categories', require('./routes/categoryRoutes'));
router.use('/brands', require('./routes/brandRoutes'));
router.use('/cart', require('./routes/cartRoutes'));
router.use('/orders', require('./routes/orderRoutes'));
router.use('/suppliers', require('./routes/supplierRoutes'));
router.use('/inventory', require('./routes/inventoryRoutes'));
router.use('/admin', require('./routes/adminRoutes'));

// Health check
router.get('/health', (req, res) => {
  res.json({ message: 'Sportify API is running!', timestamp: new Date().toISOString() });
});

module.exports = router;
