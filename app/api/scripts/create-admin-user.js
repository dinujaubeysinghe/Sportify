const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sjayashan25672_db_user:Sjay.sportify12@sportify.mxwubha.mongodb.net/?retryWrites=true&w=majority&appName=sportify');
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@sportify.com' });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      console.log('Email: admin@sportify.com');
      console.log('Password: admin123');
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@sportify.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1-555-0123',
      isVerified: true,
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@sportify.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('User ID:', adminUser._id);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Create a staff user as well
const createStaffUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sjayashan25672_db_user:Sjay.sportify12@sportify.mxwubha.mongodb.net/?retryWrites=true&w=majority&appName=sportify');
    console.log('✅ Connected to MongoDB');

    // Check if staff user already exists
    const existingStaff = await User.findOne({ email: 'staff@sportify.com' });
    if (existingStaff) {
      console.log('ℹ️ Staff user already exists');
      console.log('Email: staff@sportify.com');
      console.log('Password: staff123');
      return;
    }

    // Create staff user
    const staffUser = await User.create({
      firstName: 'Staff',
      lastName: 'User',
      email: 'staff@sportify.com',
      password: 'staff123',
      role: 'staff',
      phone: '+1-555-0124',
      employeeId: 'EMP001',
      department: 'Operations',
      hireDate: new Date(),
      isVerified: true,
      isActive: true
    });

    console.log('✅ Staff user created successfully!');
    console.log('Email: staff@sportify.com');
    console.log('Password: staff123');
    console.log('Role: staff');
    console.log('User ID:', staffUser._id);

  } catch (error) {
    console.error('❌ Error creating staff user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the functions
const main = async () => {
  console.log('🚀 Creating test users for Dashboard CRUD operations...\n');
  
  console.log('👑 Creating Admin User...');
  await createAdminUser();
  
  console.log('\n👤 Creating Staff User...');
  await createStaffUser();
  
  console.log('\n✅ Test users creation completed!');
  console.log('\nYou can now use these credentials to test the dashboard:');
  console.log('Admin: admin@sportify.com / admin123');
  console.log('Staff: staff@sportify.com / staff123');
};

main().catch(console.error);
