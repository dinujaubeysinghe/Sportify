const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const debugPassword = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/sportify');
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'staff@sportify.com' }).select('+password');
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.firstName, user.lastName);
    console.log('Password field exists:', !!user.password);
    console.log('Password length:', user.password ? user.password.length : 'N/A');
    console.log('Password starts with:', user.password ? user.password.substring(0, 10) : 'N/A');
    
    // Test with bcrypt directly
    const password = 'staff123';
    const directMatch = await bcrypt.compare(password, user.password);
    console.log('Direct bcrypt comparison:', directMatch);
    
    // Test with user method
    try {
      const methodMatch = await user.comparePassword(password);
      console.log('User method comparison:', methodMatch);
    } catch (error) {
      console.log('User method error:', error.message);
    }
    
    // Test with wrong password
    const wrongMatch = await bcrypt.compare('wrongpassword', user.password);
    console.log('Wrong password test:', wrongMatch);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

debugPassword();
