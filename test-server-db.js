const mongoose = require('mongoose');
const User = require('./app/api/models/User');

const testServerDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/sportify');
    console.log('Connected to MongoDB');
    
    const users = await User.find({});
    console.log(`\nFound ${users.length} users in database:`);
    users.forEach(u => {
      console.log(`- ${u.email} (${u.role}) - Active: ${u.isActive}, Verified: ${u.isVerified}`);
    });
    
    // Test specific user
    const testUser = await User.findOne({ email: 'john.smith@sportify.com' }).select('+password');
    if (testUser) {
      console.log(`\n✅ Test user found: ${testUser.firstName} ${testUser.lastName}`);
      console.log(`Password field exists: ${!!testUser.password}`);
      console.log(`Password length: ${testUser.password ? testUser.password.length : 'N/A'}`);
    } else {
      console.log('\n❌ Test user not found');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

testServerDB();
