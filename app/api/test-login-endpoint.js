const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Connect to database
mongoose.connect('mongodb://localhost:27017/sportify');

// Simple login endpoint
app.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Test login for:', email);
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    console.log('User found:', user.firstName, user.lastName);
    console.log('User active:', user.isActive);
    console.log('User verified:', user.isVerified);
    
    const isPasswordMatch = await user.comparePassword(password);
    console.log('Password match:', isPasswordMatch);
    
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Password mismatch' });
    }
    
    const token = jwt.sign({ id: user._id }, 'fallback-secret-key-for-development');
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.listen(5003, () => {
  console.log('Test server running on port 5003');
});
