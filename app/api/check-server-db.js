const mongoose = require('mongoose');
const User = require('./models/User');

const checkServerDB = async () => {
  try {
    // Connect to the same database the server is using
    await mongoose.connect('mongodb://localhost:27017/sportify');
    console.log('Connected to MongoDB');
    
    const users = await User.find({});
    console.log(`\nFound ${users.length} users in database:`);
    users.forEach(u => {
      console.log(`- ${u.email} (${u.role}) - Active: ${u.isActive}, Verified: ${u.isVerified}`);
    });
    
    // Check specific user
    const staffUser = await User.findOne({ email: 'staff@sportify.com' }).select('+password');
    if (staffUser) {
      console.log(`\n✅ Staff user found: ${staffUser.firstName} ${staffUser.lastName}`);
      console.log(`Active: ${staffUser.isActive}`);
      console.log(`Verified: ${staffUser.isVerified}`);
      console.log(`Password exists: ${!!staffUser.password}`);
    } else {
      console.log('\n❌ Staff user not found');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkServerDB();
