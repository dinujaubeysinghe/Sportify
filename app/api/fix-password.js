const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const fixPassword = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/sportify');
    console.log('Connected to MongoDB');
    
    // Find the staff user
    const user = await User.findOne({ email: 'staff@sportify.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.firstName, user.lastName);
    
    // Hash the password properly
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('staff123', salt);
    
    // Update the user's password
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password updated successfully');
    
    // Test the password
    const isMatch = await user.comparePassword('staff123');
    console.log('✅ Password test result:', isMatch);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

fixPassword();
