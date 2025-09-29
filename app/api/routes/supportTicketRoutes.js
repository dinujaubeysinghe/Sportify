const express = require('express');
const router = express.Router();
const {
  getSupportTickets,
  getSupportTicket,
  createSupportTicket,
  updateSupportTicket,
  addMessage,
  getSupportTicketStats,
  deleteSupportTicket,
  getStaffMembers
} = require('../controllers/supportTicketController');
const { protect, authorize } = require('../middlewares/auth');

// All routes are protected and require staff/admin access
router.use(protect);
router.use(authorize('staff', 'admin'));

// @route   GET /api/support-tickets/stats
// @desc    Get support ticket statistics
// @access  Staff/Admin
router.get('/stats', getSupportTicketStats);

// @route   GET /api/support-tickets/staff
// @desc    Get all staff members for assignment
// @access  Staff/Admin
router.get('/staff', getStaffMembers);

// @route   GET /api/support-tickets
// @desc    Get all support tickets
// @access  Staff/Admin
router.get('/', getSupportTickets);

// @route   GET /api/support-tickets/:id
// @desc    Get single support ticket
// @access  Staff/Admin
router.get('/:id', getSupportTicket);

// @route   POST /api/support-tickets
// @desc    Create new support ticket
// @access  Staff/Admin
router.post('/', createSupportTicket);

// @route   PUT /api/support-tickets/:id
// @desc    Update support ticket
// @access  Staff/Admin
router.put('/:id', updateSupportTicket);

// @route   POST /api/support-tickets/:id/messages
// @desc    Add message to support ticket
// @access  Staff/Admin
router.post('/:id/messages', addMessage);

// @route   DELETE /api/support-tickets/:id
// @desc    Delete support ticket
// @access  Admin only
router.delete('/:id', authorize('admin'), deleteSupportTicket);

module.exports = router;
