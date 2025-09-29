const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload'); // Multer middleware
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  getRecentUsers,
  getCustomers
} = require('../controllers/userController');

const router = express.Router();

router.get('/', protect, authorize('admin', 'staff'), getUsers);
router.get('/customers', protect, authorize('admin', 'staff'), getCustomers);
router.get('/stats/overview', protect, authorize('admin', 'staff'), getUserStats);
router.get('/recent', protect, authorize('admin', 'staff'), getRecentUsers);
router.get('/:id', protect, getUser);

// Updated PUT route to support profile image
router.put('/:id', protect, upload.single('profileImage'), [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim()
], updateUser);

router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
