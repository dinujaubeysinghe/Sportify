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

// Function to reset admin password
const resetAdminPassword = async () => {
  try {
    console.log('Resetting admin password...\n');

    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log(`Admin found: ${admin.firstName} ${admin.lastName}`);
      console.log(`Email: ${admin.email}`);
      
      // Reset password
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.findByIdAndUpdate(admin._id, { password: hashedPassword });
      console.log('✅ Password reset to: admin123');
      
      // Verify the password works
      const updatedAdmin = await User.findById(admin._id);
      const isPasswordValid = await bcrypt.compare('admin123', updatedAdmin.password);
      console.log(`✅ Password verification: ${isPasswordValid}`);
      
    } else {
      console.log('No admin user found');
    }

  } catch (error) {
    console.error('Error resetting admin password:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await resetAdminPassword();
  await mongoose.connection.close();
  console.log('\nDatabase connection closed.');
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('Script execution error:', error);
  process.exit(1);
});
