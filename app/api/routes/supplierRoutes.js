const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middlewares/auth');
const supplierController = require('../controllers/supplierController');

const router = express.Router();

// GET all suppliers
router.get('/', protect, authorize('admin', 'staff'), supplierController.getSuppliers);

// GET single supplier
router.get('/:id', protect, supplierController.getSupplier);

// Approve/Reject supplier
router.put('/:id/approval',
  protect,
  authorize('admin'),
  [body('isApproved').isBoolean().withMessage('Approval status must be a boolean'), body('notes').optional().trim()],
  supplierController.updateApproval
);

// Supplier’s products
router.get('/:id/products', protect, supplierController.getSupplierProducts);

// Supplier stats
router.get('/:id/stats', protect, supplierController.getSupplierStats);

// Update supplier profile
router.put('/:id/profile',
  protect,
  [
    body('businessName').optional().trim().notEmpty().withMessage('Business name cannot be empty'),
    body('businessLicense').optional().trim(),
    body('taxId').optional().trim(),
    body('phone').optional().trim(),
    body('address.street').optional().trim(),
    body('address.city').optional().trim(),
    body('address.state').optional().trim(),
    body('address.zipCode').optional().trim(),
    body('address.country').optional().trim()
  ],
  supplierController.updateProfile
);

router.get('/:id/balance', protect, authorize('admin', 'staff', 'supplier'), supplierController.getSupplierBalance);
router.post('/:id/pay', protect, authorize('admin'), supplierController.paySupplier);


module.exports = router;
