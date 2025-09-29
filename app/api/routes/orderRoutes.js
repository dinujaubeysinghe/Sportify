const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  getOrderStats,
  getSupplierOrders,
  updateOrderShipment,
  updatePaymentStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// ----------------------------
// Create order
// ----------------------------
router.post(
  '/',
  protect,
  authorize('customer', 'admin', 'staff'),
  [
    body('paymentMethod').isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery']).withMessage('Invalid payment method'),
    body('shippingAddress.firstName').trim().notEmpty().withMessage('First name is required'),
    body('shippingAddress.lastName').trim().notEmpty().withMessage('Last name is required'),
    body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
    body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
    body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
    body('shippingAddress.zipCode').trim().notEmpty().withMessage('ZIP code is required'),
    body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
    body('shippingAddress.phone').trim().notEmpty().withMessage('Phone number is required')
  ],
  createOrder
);

// ----------------------------
// User orders
// ----------------------------
router.get('/', protect, authorize('customer'), getUserOrders);
router.get('/:id', protect, getOrderById);

// ----------------------------
// Admin/Staff routes
// ----------------------------

router.put(
  '/:id/payment',
  protect,
  authorize('admin', 'staff'),
  [
    body('paymentStatus').isIn(['pending', 'paid', 'failed', 'refunded', 'partially_refunded']).withMessage('Invalid payment status')
  ],
  updatePaymentStatus
);

router.put(
  '/:id/cancel',
  protect,
  [body('reason').trim().notEmpty().withMessage('Cancellation reason is required')],
  cancelOrder
);

router.get('/admin/all', protect, authorize('admin', 'staff'), getAllOrders);
router.get('/admin/stats', protect, authorize('admin', 'staff'), getOrderStats);

// ----------------------------
// Supplier routes (order-level shipment update)
// ----------------------------
router.get('/supplier/my', protect, authorize('supplier'), getSupplierOrders);
router.put(
  '/:id/shipment',
  protect,
  authorize('supplier'),
  [
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).withMessage('Invalid shipment status'),
    body('trackingNumber').optional().isString(),
    body('carrier').optional().isString(),
    body('shipmentNotes').optional().isString()
  ],
  updateOrderShipment
);

module.exports = router;
