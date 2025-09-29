const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const debugLogin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/sportify');
    console.log('Connected to MongoDB');
    
    const email = 'john.smith@sportify.com';
    const password = 'password123';
    
    console.log(`\nDebugging login for: ${email}`);
    
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ User found: ${user.firstName} ${user.lastName}`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.isActive}`);
    console.log(`Verified: ${user.isVerified}`);
    console.log(`Password field exists: ${!!user.password}`);
    console.log(`Password length: ${user.password ? user.password.length : 'N/A'}`);
    
    // Test password comparison
    try {
      const isPasswordMatch = await user.comparePassword(password);
      console.log(`Password match (method): ${isPasswordMatch}`);
    } catch (error) {
      console.log(`Password comparison error: ${error.message}`);
    }
    
    // Test direct bcrypt comparison
    try {
      const directMatch = await bcrypt.compare(password, user.password);
      console.log(`Direct bcrypt comparison: ${directMatch}`);
    } catch (error) {
      console.log(`Direct bcrypt error: ${error.message}`);
    }
    
    // Test with different password
    const wrongPassword = 'wrongpassword';
    const wrongMatch = await bcrypt.compare(wrongPassword, user.password);
    console.log(`Wrong password test: ${wrongMatch}`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

debugLogin();
