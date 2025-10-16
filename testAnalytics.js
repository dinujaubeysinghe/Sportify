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

// Test analytics function
const testAnalytics = async () => {
  try {
    console.log('🧪 Testing analytics function...\n');

    // Test 1: Count staff
    const totalStaff = await User.countDocuments({ role: 'staff' });
    console.log(`✅ Total staff count: ${totalStaff}`);

    const activeStaff = await User.countDocuments({ role: 'staff', isActive: true });
    console.log(`✅ Active staff count: ${activeStaff}`);

    // Test 2: Get departments
    const departments = await Department.find();
    console.log(`✅ Departments found: ${departments.length}`);
    departments.forEach(dept => {
      console.log(`  - ${dept.name} (${dept._id})`);
    });

    // Test 3: Staff by department
    const staffByDepartment = await Promise.all(
      departments.map(async (dept) => {
        const count = await User.countDocuments({ 
          role: 'staff', 
          department: dept._id 
        });
        return {
          _id: dept._id,
          name: dept.name,
          count
        };
      })
    );
    console.log(`✅ Staff by department:`, staffByDepartment);

    // Test 4: Recent hires
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentHires = await User.find({
      role: 'staff',
      createdAt: { $gte: thirtyDaysAgo }
    })
      .select('firstName lastName email department createdAt')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`✅ Recent hires: ${recentHires.length}`);
    recentHires.forEach(hire => {
      console.log(`  - ${hire.firstName} ${hire.lastName} (${hire.department?.name || 'No Department'})`);
    });

    console.log('\n✅ All analytics tests passed!');

  } catch (error) {
    console.error('❌ Analytics test failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await testAnalytics();
  await mongoose.connection.close();
  console.log('\nDatabase connection closed.');
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('Script execution error:', error);
  process.exit(1);
});
