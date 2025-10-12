// routes/discountRoutes.js
const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');
const { protect, authorize } = require('../middlewares/auth');


router.post('/', protect,authorize('admin','staff'), discountController.createDiscount);
router.get('/', protect,authorize('admin','staff'), discountController.getDiscounts);
router.get('/:id', protect,authorize('admin','staff'), discountController.getDiscountById);
router.put('/:id', protect,authorize('admin','staff'), discountController.updateDiscount);
router.delete('/:id', protect,authorize('admin','staff'), discountController.deleteDiscount);
router.post('/validate',protect, discountController.validateDiscount);

module.exports = router;
