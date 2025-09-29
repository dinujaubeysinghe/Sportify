const mongoose = require('mongoose');
const User = require('./models/User');

const testServerDB = async () => {
  try {
    // Connect to the same database the server should be using
    await mongoose.connect('mongodb://localhost:27017/sportify');
    console.log('Connected to MongoDB');
    
    // Check if our staff user exists
    const staffUser = await User.findOne({ email: 'staff@sportify.com' }).select('+password');
    if (staffUser) {
      console.log('✅ Staff user found:', staffUser.firstName, staffUser.lastName);
      console.log('Active:', staffUser.isActive);
      console.log('Verified:', staffUser.isVerified);
      
      // Test password
      const isMatch = await staffUser.comparePassword('staff123');
      console.log('Password match:', isMatch);
      
      if (isMatch) {
        console.log('🎉 User and password are working correctly!');
      } else {
        console.log('❌ Password is not working');
      }
    } else {
      console.log('❌ Staff user not found');
    }
    
    // List all users
    const allUsers = await User.find({});
    console.log(`\nTotal users in database: ${allUsers.length}`);
    allUsers.forEach(u => {
      console.log(`- ${u.email} (${u.role})`);
    });
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

testServerDB();
