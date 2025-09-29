const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define user schema inline
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
  phone: String,
  isEmailVerified: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  employeeId: String,
  department: String,
  hireDate: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const createStaffUser = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/sportify');
    console.log('Connected to MongoDB');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'staff@sportify.com' });
    if (existingUser) {
      console.log('✅ Staff user already exists:', existingUser.email);
      mongoose.disconnect();
      return;
    }
    
    // Create staff user
    const hashedPassword = await bcrypt.hash('staff123', 12);
    
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
    
    console.log('✅ Created staff user:', staffUser.email);
    console.log('Password: staff123');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

createStaffUser();
