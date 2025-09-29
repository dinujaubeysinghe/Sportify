const express = require('express');
const { body } = require('express-validator');
const {
  getDashboardStats,
  getRecentOrders,
  getSupportTickets,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket,
  updateOrderStatus,
  getDashboardUsers,
  getDashboardProducts,
  getDashboardAnalytics
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication and admin/staff authorization
router.use(protect);
router.use(authorize('admin', 'staff'));

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Recent orders
router.get('/recent-orders', getRecentOrders);

// Support tickets (Notifications)
router.get('/support-tickets', getSupportTickets);
router.post('/support-tickets', [
  body('user').isMongoId().withMessage('Valid user ID is required'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('link').optional().isURL().withMessage('Link must be a valid URL')
], createSupportTicket);

router.put('/support-tickets/:id', [
  body('read').optional().isBoolean().withMessage('Read status must be boolean'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('message').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('link').optional().isURL().withMessage('Link must be a valid URL')
], updateSupportTicket);

router.delete('/support-tickets/:id', deleteSupportTicket);

// Order management
router.put('/orders/:id/status', [
  body('shipmentStatus').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).withMessage('Invalid shipment status'),
  body('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded', 'partially_refunded']).withMessage('Invalid payment status'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], updateOrderStatus);

// User management
router.get('/users', getDashboardUsers);

// Product management
router.get('/products', getDashboardProducts);

// Analytics
router.get('/analytics', getDashboardAnalytics);

module.exports = router;
