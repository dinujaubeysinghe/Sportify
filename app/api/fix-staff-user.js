const mongoose = require('mongoose');
const User = require('./models/User');

const fixStaffUser = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/sportify');
    console.log('Connected to MongoDB');
    
    const result = await User.updateOne(
      { email: 'staff@sportify.com' },
      { 
        isVerified: true,
        isActive: true
      }
    );
    
    console.log(`Updated ${result.modifiedCount} user(s)`);
    
    // Verify the update
    const user = await User.findOne({ email: 'staff@sportify.com' });
    console.log(`User verified: ${user.isVerified}`);
    console.log(`User active: ${user.isActive}`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

fixStaffUser();
