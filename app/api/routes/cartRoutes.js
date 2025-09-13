const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middlewares/auth');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.get('/', protect, authorize('customer', 'admin', 'staff'), cartController.getCart);

router.post('/items',
  protect, authorize('customer', 'admin', 'staff'),
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),
  body('selectedSize').optional().isString(),
  body('selectedColor').optional().isString(),
  cartController.addItem
);

router.put('/items/:itemId',
  protect, authorize('customer'),
  body('quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),
  cartController.updateItem
);

router.delete('/items/:itemId', protect, authorize('customer'), cartController.removeItem);
router.delete('/', protect, authorize('customer'), cartController.clearCart);

router.post('/discount',
  protect, authorize('customer'),
  body('code').trim().notEmpty().withMessage('Discount code is required'),
  cartController.applyDiscount
);

router.delete('/discount', protect, authorize('customer'), cartController.removeDiscount);

router.put('/shipping',
  protect, authorize('customer'),
  body('street').notEmpty(),
  body('city').notEmpty(),
  body('state').notEmpty(),
  body('zipCode').notEmpty(),
  body('country').notEmpty(),
  cartController.updateShipping
);

router.get('/summary', protect, authorize('customer'), cartController.getSummary);

router.delete('/clear', protect, authorize('customer'),cartController.clearCart);


module.exports = router;
