const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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

// Test admin user and token
const testAdminAuth = async () => {
  try {
    console.log('🔍 Testing admin authentication...\n');

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found!');
      return;
    }

    console.log(`👤 Admin user found:`);
    console.log(`  - Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`  - Email: ${admin.email}`);
    console.log(`  - Role: ${admin.role}`);
    console.log(`  - Is Active: ${admin.isActive}`);
    console.log(`  - Is Verified: ${admin.isVerified}`);

    // Test JWT token generation
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log(`\n🔑 Generated token: ${token.substring(0, 50)}...`);

    // Test token verification
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log(`✅ Token verification successful`);
      console.log(`  - User ID: ${decoded.id}`);
      console.log(`  - Expires: ${new Date(decoded.exp * 1000)}`);
    } catch (error) {
      console.log(`❌ Token verification failed:`, error.message);
    }

    // Test if user can be found by token ID
    const userFromToken = await User.findById(admin._id).select('-password');
    if (userFromToken) {
      console.log(`✅ User found by token ID: ${userFromToken.email}`);
      console.log(`  - Role: ${userFromToken.role}`);
      console.log(`  - Is Active: ${userFromToken.isActive}`);
    } else {
      console.log(`❌ User not found by token ID`);
    }

  } catch (error) {
    console.error('❌ Error testing admin auth:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await testAdminAuth();
  await mongoose.connection.close();
  console.log('\nDatabase connection closed.');
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('Script execution error:', error);
  process.exit(1);
});
