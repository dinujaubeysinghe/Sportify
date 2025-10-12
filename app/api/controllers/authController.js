const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { verifyEmailTemplate, forgotPasswordTemplate, passwordChangedTemplate } = require('../emails/emailTemplates');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Inventory = require('../models/Inventory');
const Setting = require('../models/Settings'); // Import Setting Model
require("dotenv").config();

// Generate JWT Token (unchanged)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { firstName, lastName, email, password, role = 'customer', phone, businessName, businessLicense, taxId, employeeId, department, hireDate } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // 1. Fetch global settings
    const globalSettings = await Setting.getGlobalSettings();
    const autoApprove = globalSettings.autoApproveSuppliers;
    const requireVerification = globalSettings.requireEmailVerification;


    const userData = { firstName, lastName, email, password, role, phone };

    if (role === 'supplier') {
      userData.businessName = businessName;
      userData.businessLicense = businessLicense;
      userData.taxId = taxId;
      userData.isApproved = autoApprove;
    } else if (role === 'staff') {
      userData.employeeId = employeeId;
      userData.department = department;
      userData.hireDate = hireDate;
    }
    
    // 2. Conditional Email Verification Logic
    // If verification is NOT required, set the user as verified immediately.
    if (!requireVerification) {
        userData.isVerified = true;
    }

    const user = await User.create(userData);

    // 3. Only proceed with token generation and email if verification IS required.
    if (requireVerification) {
        const verificationToken = crypto.randomBytes(20).toString('hex');
        // Save the hashed token to the user document
        user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        await user.save({ validateBeforeSave: false });

        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

        await sendEmail({
            to: user.email,
            subject: 'Verify your email',
            html: verifyEmailTemplate(verifyUrl, user.firstName)
        });
    }

    res.status(201).json({
      success: true,
      message: requireVerification
          ? 'User registered successfully. Please check your email to verify your account.'
          : 'User registered and account is active.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({ verificationToken: hashedToken });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: 'Server error during email verification' });
  }
};


exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account is deactivated. Please contact support.' });
    if (!user.isVerified) return res.status(401).json({ success: false, message: 'Please verify your email before logging in' });
    if (user.role === 'supplier' && !user.isApproved) return res.status(401).json({ success: false, message: 'Please wait until admin approve your account' });

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;

    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.cookie('token', token, options);
    res.json({ success: true, message: 'Login successful', token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) 
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Your password has been changed',
      html: passwordChangedTemplate(user.firstName)
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: forgotPasswordTemplate(resetUrl, user.firstName)
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Your password has been reset',
      html: passwordChangedTemplate(user.firstName)
    });

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteAccount = async (req, res) => {
  const _id = req.user._id;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin cannot delete their account' });
    } else if (user.role === 'supplier') {
      // Find supplier products
      const products = await Product.find({ supplier: _id });
      const productIds = products.map(p => p._id);

      // Delete products
      await Product.deleteMany({ supplier: _id });

      // Delete supplier orders
      await Order.deleteMany({ supplier: _id });

      // Delete Inventory
      await Inventory.deleteMany({performedBy:_id});

      // Remove deleted products from all carts
      await Cart.updateMany(
        { 'items.product': { $in: productIds } },
        { $pull: { items: { product: { $in: productIds } } } }
      );

    } else {
      // For regular users, delete their cart
      await Cart.findOneAndDelete({ user: _id });
    }

    // Finally, delete the user
    await User.findByIdAndDelete(_id);

    res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.testEmail = async (req, res) => {
  try {
    const { email, type = 'test', data = {} } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    let subject, html;
    
    switch (type) {
      case 'verification':
        subject = 'Email Verification - Sportify';
        html = verifyEmailTemplate(data.name || 'User', data.verificationLink || '#');
        break;
      case 'password-reset':
        subject = 'Password Reset - Sportify';
        html = forgotPasswordTemplate(data.name || 'User', data.resetLink || '#');
        break;
      case 'order-confirmation':
        subject = 'Order Confirmation - Sportify';
        html = `
          <h2>Order Confirmation</h2>
          <p>Hello ${data.name || 'User'},</p>
          <p>Your order #${data.orderNumber || 'N/A'} has been confirmed.</p>
          <p>Total: $${data.total || '0.00'}</p>
        `;
        break;
      case 'low-stock':
        subject = 'Low Stock Alert - Sportify';
        html = `
          <h2>Low Stock Alert</h2>
          <p>The following products are running low on stock:</p>
          <ul>
            ${data.products ? data.products.map(p => `<li>${p.name} - Current: ${p.currentStock}, Min: ${p.minStock}</li>`).join('') : ''}
          </ul>
        `;
        break;
      case 'welcome':
        subject = 'Welcome to Sportify!';
        html = `
          <h2>Welcome to Sportify!</h2>
          <p>Hello ${data.name || 'User'},</p>
          <p>Thank you for joining Sportify. We're excited to have you on board!</p>
        `;
        break;
      default:
        subject = 'Test Email - Sportify';
        html = `
          <h2>Test Email</h2>
          <p>This is a test email from Sportify system.</p>
          <p>If you received this email, the email system is working correctly.</p>
        `;
    }

    await sendEmail({
      to: email,
      subject,
      html
    });

    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send test email', error: error.message });
  }
};

