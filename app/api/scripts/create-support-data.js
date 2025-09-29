const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define schemas inline
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
  phone: String,
  isEmailVerified: { type: Boolean, default: true }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  message: { type: String, required: true },
  isCustomer: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now }
});

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  category: { type: String, enum: ['general', 'delivery', 'quality', 'payment', 'account', 'technical', 'refund'], default: 'general' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages: [messageSchema]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/sportify');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createUsersAndTickets = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await SupportTicket.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await User.create([
      {
        firstName: 'Kamal',
        lastName: 'Perera',
        email: 'kamal.perera@gmail.com',
        password: hashedPassword,
        role: 'customer',
        phone: '+94 77 123 4567'
      },
      {
        firstName: 'Priya',
        lastName: 'Fernando',
        email: 'priya.fernando@gmail.com',
        password: hashedPassword,
        role: 'customer',
        phone: '+94 77 234 5678'
      },
      {
        firstName: 'Saman',
        lastName: 'Silva',
        email: 'saman.silva@gmail.com',
        password: hashedPassword,
        role: 'customer',
        phone: '+94 77 345 6789'
      },
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@sportify.com',
        password: hashedPassword,
        role: 'staff',
        phone: '+94 77 456 7890'
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@sportify.com',
        password: hashedPassword,
        role: 'staff',
        phone: '+94 77 567 8901'
      }
    ]);

    console.log(`Created ${users.length} users`);

    const customers = users.filter(u => u.role === 'customer');
    const staff = users.filter(u => u.role === 'staff');

    // Create support tickets
    const tickets = await SupportTicket.create([
      {
        ticketNumber: 'TKT-001',
        subject: 'Product delivery issue',
        description: 'My order was supposed to be delivered yesterday but I have not received it yet.',
        customer: customers[0]._id,
        status: 'open',
        priority: 'high',
        category: 'delivery',
        assignedTo: staff[0]._id,
        messages: [
          {
            sender: `${customers[0].firstName} ${customers[0].lastName}`,
            message: 'My order was supposed to be delivered yesterday but I have not received it yet.',
            isCustomer: true,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            sender: `${staff[0].firstName} ${staff[0].lastName}`,
            message: 'Thank you for contacting us. I am looking into your order status and will get back to you shortly.',
            isCustomer: false,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        ticketNumber: 'TKT-002',
        subject: 'Product quality concern',
        description: 'The shoes I received have a defect in the sole.',
        customer: customers[1]._id,
        status: 'in_progress',
        priority: 'medium',
        category: 'quality',
        assignedTo: staff[1]._id,
        messages: [
          {
            sender: `${customers[1].firstName} ${customers[1].lastName}`,
            message: 'The shoes I received have a defect in the sole. Can I get a replacement?',
            isCustomer: true,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            sender: `${staff[1].firstName} ${staff[1].lastName}`,
            message: 'I apologize for the inconvenience. I have initiated a replacement process for you.',
            isCustomer: false,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        ticketNumber: 'TKT-003',
        subject: 'Payment processing issue',
        description: 'I am getting an error when trying to pay with my credit card.',
        customer: customers[2]._id,
        status: 'resolved',
        priority: 'low',
        category: 'payment',
        assignedTo: staff[0]._id,
        messages: [
          {
            sender: `${customers[2].firstName} ${customers[2].lastName}`,
            message: 'I am getting an error when trying to pay with my credit card.',
            isCustomer: true,
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
          },
          {
            sender: `${staff[0].firstName} ${staff[0].lastName}`,
            message: 'The payment issue has been resolved. Please try again.',
            isCustomer: false,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    ]);

    console.log(`Created ${tickets.length} support tickets`);
    console.log('✅ Support ticket system populated successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createUsersAndTickets();
