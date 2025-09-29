const express = require('express');
const { body, query } = require('express-validator');
const { protect, authorize, optionalAuth } = require('../middlewares/auth');
const { 
  getProducts, getProductById, createProduct, updateProduct, deleteProduct, 
  addReview, getCategories, getBrands 
} = require('../controllers/ProductController');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/products/' });


const router = express.Router();

// ========== Multer Upload Config ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/products/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
  }
});


// ========== Routes ==========
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('brand').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('search').optional().isString(),
  query('sort').optional().isIn(['price_asc','price_desc','name_asc','name_desc','newest','rating']),
  query('featured').optional().isBoolean()
], getProducts);

router.get('/:id', optionalAuth, getProductById);

router.post('/', protect, authorize('supplier','admin','staff'), upload.array('images', 5), [
  body('name').notEmpty(),
  body('description').notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('category').isMongoId().withMessage('Category must be a valid ObjectId'),
  body('brand').isMongoId().withMessage('Brand must be a valid ObjectId'),
  body('stock').isInt({ min: 0 }),
  body('sku').notEmpty()
], createProduct);

router.put('/:id', protect, authorize('supplier','admin','staff'), upload.array('images', 5), updateProduct);

router.delete('/:id', protect, authorize('supplier','admin','staff'), deleteProduct);

router.post('/:id/reviews', protect, authorize('customer'), [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 500 })
], addReview);

module.exports = router;
