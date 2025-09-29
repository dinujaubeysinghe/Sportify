const mongoose = require('mongoose');
const User = require('./models/User');

const testStaffLogin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/sportify');
    console.log('Connected to MongoDB');
    
    const email = 'staff@sportify.com';
    const password = 'staff123';
    
    console.log(`\nTesting login for: ${email}`);
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ User found: ${user.firstName} ${user.lastName}`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.isActive}`);
    console.log(`Verified: ${user.isEmailVerified}`);
    console.log(`Password field exists: ${!!user.password}`);
    console.log(`Password length: ${user.password ? user.password.length : 'N/A'}`);
    
    // Test password comparison
    const isPasswordMatch = await user.comparePassword(password);
    console.log(`Password match: ${isPasswordMatch}`);
    
    if (isPasswordMatch) {
      console.log('✅ Login should work!');
    } else {
      console.log('❌ Password mismatch');
      
      // Test with bcrypt directly
      const directMatch = await bcrypt.compare(password, user.password);
      console.log(`Direct bcrypt comparison: ${directMatch}`);
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

testStaffLogin();
