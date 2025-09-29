const mongoose = require('mongoose');
const User = require('./models/User');
const { body, validationResult } = require('express-validator');

const simulateLogin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/sportify');
    console.log('Connected to MongoDB');
    
    const email = 'john.smith@sportify.com';
    const password = 'password123';
    
    console.log(`\nSimulating login for: ${email}`);
    
    // Simulate validation
    const validationRules = [
      body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
      body('password').notEmpty().withMessage('Password is required')
    ];
    
    const req = { body: { email, password } };
    
    for (const rule of validationRules) {
      await rule.run(req);
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return;
    }
    
    console.log('✅ Validation passed');
    
    // Simulate user lookup
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ User found: ${user.firstName} ${user.lastName}`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.isActive}`);
    console.log(`Verified: ${user.isVerified}`);
    
    if (!user.isActive) {
      console.log('❌ Account is deactivated');
      return;
    }
    
    if (user.role === 'supplier' && !user.isApproved) {
      console.log('❌ Supplier account not approved');
      return;
    }
    
    // Test password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      console.log('❌ Invalid password');
      return;
    }
    
    console.log('✅ Login successful!');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

simulateLogin();
