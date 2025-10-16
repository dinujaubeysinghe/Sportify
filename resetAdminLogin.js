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
    console.log('🔧 Resetting admin password...\n');

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found!');
      return;
    }

    console.log(`👤 Admin found: ${admin.firstName} ${admin.lastName}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔐 Current password hash: ${admin.password.substring(0, 20)}...`);

    // Reset password to 'admin123'
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await User.findByIdAndUpdate(admin._id, { 
      password: hashedPassword,
      isActive: true,
      isVerified: true
    });

    console.log(`✅ Password reset successfully!`);
    console.log(`🔑 New password: ${newPassword}`);

    // Verify the password works
    const updatedAdmin = await User.findById(admin._id);
    const isPasswordValid = await bcrypt.compare(newPassword, updatedAdmin.password);
    console.log(`✅ Password verification: ${isPasswordValid ? 'SUCCESS' : 'FAILED'}`);

    // Test login credentials
    console.log('\n🔑 Login Credentials:');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${newPassword}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Active: ${updatedAdmin.isActive}`);
    console.log(`Verified: ${updatedAdmin.isVerified}`);

  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await resetAdminPassword();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed.');
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('Script execution error:', error);
  process.exit(1);
});
