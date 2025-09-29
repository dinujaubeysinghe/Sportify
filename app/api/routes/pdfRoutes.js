const express = require('express');
const router = express.Router();
const { generateCustomerReport } = require('../controllers/pdfController');
const { protect, authorize } = require('../middlewares/auth');

// All routes are protected and require staff/admin access
router.use(protect);
router.use(authorize('staff', 'admin'));

// @route   POST /api/pdf/customer-report
// @desc    Generate PDF report for customers
// @access  Staff/Admin
router.post('/customer-report', generateCustomerReport);

module.exports = router;
