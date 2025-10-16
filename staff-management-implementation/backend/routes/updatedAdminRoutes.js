const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');
const staffController = require('./staff-management-implementation/backend/controllers/staffController');

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

// ==================== STAFF MANAGEMENT ROUTES ====================

// Get all staff members
router.get('/staff', protect, authorize('admin'), staffController.getStaff);

// Get specific staff member
router.get('/staff/:id', protect, authorize('admin'), staffController.getStaffById);

// Create new staff member
router.post('/staff', protect, authorize('admin'), [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('department').optional().isMongoId().withMessage('Invalid department ID'),
  body('hireDate').optional().isISO8601().withMessage('Valid hire date is required'),
  body('phone').optional().trim(),
  body('permissions').optional().isArray().withMessage('Permissions must be an array')
], staffController.createStaff);

// Update staff member
router.put('/staff/:id', protect, authorize('admin'), [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').optional().trim(),
  body('employeeId').optional().trim().notEmpty().withMessage('Employee ID cannot be empty'),
  body('department').optional().isMongoId().withMessage('Invalid department ID'),
  body('hireDate').optional().isISO8601().withMessage('Valid hire date is required'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array'),
  body('isActive').optional().isBoolean().withMessage('Active status must be a boolean')
], staffController.updateStaff);

// Delete staff member
router.delete('/staff/:id', protect, authorize('admin'), staffController.deleteStaff);

// Update staff status (activate/deactivate)
router.put('/staff/:id/status', protect, authorize('admin'), [
  body('isActive').isBoolean().withMessage('Active status must be a boolean')
], staffController.updateStaffStatus);

// Bulk operations on staff
router.post('/staff/bulk-action', protect, authorize('admin'), [
  body('action').isIn(['activate', 'deactivate', 'delete']).withMessage('Invalid action'),
  body('staffIds').isArray({ min: 1 }).withMessage('Staff IDs must be an array with at least one item'),
  body('staffIds.*').isMongoId().withMessage('Invalid staff ID format')
], staffController.bulkStaffAction);

// ==================== DEPARTMENT MANAGEMENT ROUTES ====================

// Get all departments
router.get('/departments', protect, authorize('admin'), staffController.getDepartments);

// Create department
router.post('/departments', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('description').optional().trim(),
  body('manager').optional().isMongoId().withMessage('Invalid manager ID'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array')
], staffController.createDepartment);

// Update department
router.put('/departments/:id', protect, authorize('admin'), [
  body('name').optional().trim().notEmpty().withMessage('Department name cannot be empty'),
  body('description').optional().trim(),
  body('manager').optional().isMongoId().withMessage('Invalid manager ID'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array')
], staffController.updateDepartment);

// Delete department
router.delete('/departments/:id', protect, authorize('admin'), staffController.deleteDepartment);

// ==================== STAFF ANALYTICS ROUTES ====================

// Get staff analytics
router.get('/staff/analytics', protect, authorize('admin'), staffController.getStaffAnalytics);

// Export staff data
router.post('/staff/export', protect, authorize('admin'), [
  body('format').optional().isIn(['csv', 'json']).withMessage('Format must be csv or json'),
  body('filters').optional().isObject().withMessage('Filters must be an object')
], staffController.exportStaffData);

// Settings
router.get('/settings', adminController.getSettings);
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
