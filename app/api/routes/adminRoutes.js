const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Dashboard
router.get('/dashboard', protect, authorize('admin'), adminController.getDashboard);

// Users
router.get('/users', protect, authorize('admin'), adminController.getUsers);
router.put('/users/:id/status', protect, authorize('admin'), [
  body('isActive').isBoolean().withMessage('Active status must be a boolean')
], adminController.updateUserStatus);

// Supplier
router.put('/supplier/:id/status', protect, authorize('admin'), [
  body('isApproved').isBoolean().withMessage('Active status must be a boolean')
], adminController.updateSupplierStatus);

// Staff
router.post('/staff', protect, authorize('admin'), [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('hireDate').isISO8601().withMessage('Valid hire date is required'),
  body('phone').optional().trim()
], adminController.createStaff);

// Settings
router.get('/settings', protect, authorize('admin'), adminController.getSettings);
router.put('/settings', protect, authorize('admin'), [
  body('siteName').optional().trim().notEmpty().withMessage('Site name cannot be empty'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),
  body('lowStockThreshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a non-negative integer'),
  body('autoApproveSuppliers').optional().isBoolean().withMessage('Auto approve suppliers must be a boolean'),
  body('requireEmailVerification').optional().isBoolean().withMessage('Require email verification must be a boolean'),
  body('allowGuestCheckout').optional().isBoolean().withMessage('Allow guest checkout must be a boolean')
], adminController.updateSettings);

// Reports
router.get('/reports', protect, authorize('admin'), adminController.getReports);

module.exports = router;
