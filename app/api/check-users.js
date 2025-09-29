const mongoose = require('mongoose');
const User = require('./models/User');

const checkUsers = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/sportify');
    console.log('Connected to MongoDB');
    
    const users = await User.find({});
    console.log('\nUsers in database:');
    users.forEach(u => {
      console.log(`- Email: ${u.email}`);
      console.log(`  Role: ${u.role}`);
      console.log(`  Active: ${u.isActive}`);
      console.log(`  Verified: ${u.isVerified}`);
      console.log(`  Name: ${u.firstName} ${u.lastName}`);
      console.log('');
    });
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUsers();
