const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../../../middlewares/auth');
const staffController = require('../controllers/staffController');

const router = express.Router();

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

// ==================== ANALYTICS ROUTES ====================

// Get staff analytics
router.get('/staff/analytics', protect, authorize('admin'), staffController.getStaffAnalytics);

// Export staff data
router.post('/staff/export', protect, authorize('admin'), [
  body('format').optional().isIn(['csv', 'json']).withMessage('Format must be csv or json'),
  body('filters').optional().isObject().withMessage('Filters must be an object')
], staffController.exportStaffData);

module.exports = router;
