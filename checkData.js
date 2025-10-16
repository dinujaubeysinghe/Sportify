const mongoose = require('mongoose');

// Import models
const User = require('./models/User');
const Department = require('./models/Department');

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

// Function to check data
const checkData = async () => {
  try {
    console.log('Checking database data...\n');

    // Check departments
    const departments = await Department.find({});
    console.log(`📁 Departments found: ${departments.length}`);
    departments.forEach(dept => {
      console.log(`  - ${dept.name} (ID: ${dept._id})`);
    });

    // Check staff
    const staff = await User.find({ role: 'staff' }).populate('department');
    console.log(`\n👥 Staff members found: ${staff.length}`);
    staff.forEach(member => {
      console.log(`  - ${member.firstName} ${member.lastName} (${member.employeeId}) - ${member.department?.name || 'No Department'} - ${member.isActive ? 'Active' : 'Inactive'}`);
    });

    // Check if we have any users at all
    const allUsers = await User.find({});
    console.log(`\n👤 Total users in database: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });

  } catch (error) {
    console.error('Error checking data:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await checkData();
  await mongoose.connection.close();
  console.log('\nDatabase connection closed.');
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('Script execution error:', error);
  process.exit(1);
});
