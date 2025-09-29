const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth');
const {
  getAllPayrolls,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
  approvePayroll,
  processPayroll,
  getPayrollStats,
  getStaffForPayroll
} = require('../controllers/payrollController');

// Validation middleware
const payrollValidation = [
  body('staffId').notEmpty().withMessage('Staff ID is required'),
  body('payPeriod.startDate').isISO8601().withMessage('Valid start date is required'),
  body('payPeriod.endDate').isISO8601().withMessage('Valid end date is required'),
  body('salaryDetails.baseSalary').isNumeric().withMessage('Base salary must be a number'),
  body('salaryDetails.baseSalary').isFloat({ min: 0 }).withMessage('Base salary must be positive'),
  body('paymentDetails.paymentDate').isISO8601().withMessage('Valid payment date is required')
];

const updatePayrollValidation = [
  body('salaryDetails.baseSalary').optional().isNumeric().withMessage('Base salary must be a number'),
  body('salaryDetails.baseSalary').optional().isFloat({ min: 0 }).withMessage('Base salary must be positive'),
  body('paymentDetails.paymentDate').optional().isISO8601().withMessage('Valid payment date is required')
];

// All routes require authentication
router.use(protect);

// Get all payroll records
router.get('/', getAllPayrolls);

// Get payroll statistics
router.get('/stats', getPayrollStats);

// Get staff members for payroll
router.get('/staff', getStaffForPayroll);

// Get single payroll record
router.get('/:id', getPayrollById);

// Create new payroll record
router.post('/', payrollValidation, createPayroll);

// Update payroll record
router.put('/:id', updatePayrollValidation, updatePayroll);

// Delete payroll record
router.delete('/:id', deletePayroll);

// Approve payroll record
router.patch('/:id/approve', approvePayroll);

// Process payroll record
router.patch('/:id/process', processPayroll);

module.exports = router;
