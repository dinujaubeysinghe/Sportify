const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  deleteAccount,
  testEmail
} = require('../controllers/authController');

const router = express.Router();

// Register
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['customer', 'supplier', 'staff', 'admin']).withMessage('Invalid role')
], register);

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], login);

// Logout
router.post('/logout', logout);

// Current user
router.get('/me', protect, getMe);

// Update profile
router.put('/profile', protect, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim()
], updateProfile);

// Change password
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], changePassword);

router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], forgotPassword);

// Reset password
router.put('/reset-password/:token', [
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], resetPassword);

router.post('/verify-email/:token', verifyEmail);

router.delete('/delete',protect, deleteAccount);

// Test email endpoint
router.post('/test-email', testEmail);

module.exports = router;
