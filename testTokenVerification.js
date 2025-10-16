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

// Test token verification
const testTokenVerification = async () => {
  try {
    console.log('🔍 Testing token verification...\n');

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found!');
      return;
    }

    console.log(`👤 Admin user:`);
    console.log(`  - ID: ${admin._id}`);
    console.log(`  - Email: ${admin.email}`);
    console.log(`  - Role: ${admin.role}`);

    // Generate token with the same secret as server
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { id: admin._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`\n🔑 Generated token: ${token.substring(0, 50)}...`);

    // Test token verification
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log(`✅ Token verification successful`);
      console.log(`  - Decoded ID: ${decoded.id}`);
      console.log(`  - Expires: ${new Date(decoded.exp * 1000)}`);
      
      // Test if user can be found by decoded ID
      const userFromToken = await User.findById(decoded.id).select('-password');
      if (userFromToken) {
        console.log(`✅ User found by token ID: ${userFromToken.email}`);
        console.log(`  - Role: ${userFromToken.role}`);
        console.log(`  - Is Active: ${userFromToken.isActive}`);
      } else {
        console.log(`❌ User not found by token ID`);
      }
    } catch (error) {
      console.log(`❌ Token verification failed:`, error.message);
    }

    // Test the exact token from the API call
    const apiToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjAxYzM2MmJmZDZmMjlhN2U0ZTgwNSIsImlhdCI6MTc2MDU3MDk3NywiZXhwIjoxNzYxMTc1Nzc3fQ.jvjyDajOFit3ZCvYcF';
    console.log(`\n🔍 Testing API token: ${apiToken.substring(0, 50)}...`);
    
    try {
      const decodedApi = jwt.verify(apiToken, JWT_SECRET);
      console.log(`✅ API token verification successful`);
      console.log(`  - Decoded ID: ${decodedApi.id}`);
      console.log(`  - Expires: ${new Date(decodedApi.exp * 1000)}`);
    } catch (error) {
      console.log(`❌ API token verification failed:`, error.message);
    }

  } catch (error) {
    console.error('❌ Error testing token verification:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await testTokenVerification();
  await mongoose.connection.close();
  console.log('\nDatabase connection closed.');
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('Script execution error:', error);
  process.exit(1);
});
