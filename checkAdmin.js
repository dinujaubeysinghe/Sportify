const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sjayashan25672_db_user:Sjay.sportify12@sportify.mxwubha.mongodb.net/?retryWrites=true&w=majority&appName=sportify', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Function to check admin user
const checkAdmin = async () => {
  try {
    console.log('Checking admin user...\n');

    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log(`Admin found: ${admin.firstName} ${admin.lastName}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Role: ${admin.role}`);
      console.log(`Is Active: ${admin.isActive}`);
      console.log(`Is Verified: ${admin.isVerified}`);
      
      // Test password
      const testPassword = 'admin123';
      const isPasswordValid = await bcrypt.compare(testPassword, admin.password);
      console.log(`Password 'admin123' is valid: ${isPasswordValid}`);
      
      if (!isPasswordValid) {
        console.log('Trying to reset password...');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        await User.findByIdAndUpdate(admin._id, { password: hashedPassword });
        console.log('Password reset to: admin123');
      }
    } else {
      console.log('No admin user found');
    }

  } catch (error) {
    console.error('Error checking admin:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await checkAdmin();
  await mongoose.connection.close();
  console.log('\nDatabase connection closed.');
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('Script execution error:', error);
  process.exit(1);
});
