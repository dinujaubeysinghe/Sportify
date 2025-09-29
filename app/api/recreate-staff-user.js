const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const recreateStaffUser = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/sportify');
    console.log('Connected to MongoDB');
    
    // Delete existing staff user
    await User.deleteOne({ email: 'staff@sportify.com' });
    console.log('✅ Deleted existing staff user');
    
    // Create new staff user with proper password hashing
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('staff123', salt);
    
    const staffUser = await User.create({
      firstName: 'Staff',
      lastName: 'Member',
      email: 'staff@sportify.com',
      password: hashedPassword,
      role: 'staff',
      phone: '+94 77 000 0000',
      isEmailVerified: true,
      isActive: true,
      employeeId: 'EMP-001',
      department: 'Customer Support',
      hireDate: new Date()
    });
    
    console.log('✅ Created new staff user:', staffUser.email);
    
    // Test the password immediately
    const testUser = await User.findOne({ email: 'staff@sportify.com' }).select('+password');
    const isMatch = await testUser.comparePassword('staff123');
    console.log('✅ Password test result:', isMatch);
    
    if (isMatch) {
      console.log('🎉 Login should work now!');
    } else {
      console.log('❌ Password still not working');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

recreateStaffUser();
