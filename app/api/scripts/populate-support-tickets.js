const mongoose = require('mongoose');
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const Order = require('../models/Order');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sportify', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const populateSupportTickets = async () => {
  try {
    await connectDB();

    // Get some customers and orders for reference
    const customers = await User.find({ role: 'customer' }).limit(5);
    const orders = await Order.find().limit(3);
    const staff = await User.find({ role: 'staff' }).limit(2);

    if (customers.length === 0) {
      console.log('No customers found. Please run the customer population script first.');
      return;
    }

    // Clear existing support tickets
    await SupportTicket.deleteMany({});
    console.log('Cleared existing support tickets');

    const supportTickets = [
      {
        subject: 'Product delivery issue',
        description: 'My order was supposed to be delivered yesterday but I have not received it yet. The tracking shows it\'s still in transit.',
        customer: customers[0]._id,
        status: 'open',
        priority: 'high',
        category: 'delivery',
        assignedTo: staff[0] ? staff[0]._id : null,
        orderReference: orders[0] ? orders[0]._id : null,
        messages: [
          {
            sender: `${customers[0].firstName} ${customers[0].lastName}`,
            message: 'My order was supposed to be delivered yesterday but I have not received it yet. The tracking shows it\'s still in transit.',
            isCustomer: true,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
          },
          {
            sender: staff[0] ? `${staff[0].firstName} ${staff[0].lastName}` : 'Support Staff',
            message: 'Thank you for contacting us. I am looking into your order status and will get back to you shortly.',
            isCustomer: false,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
          }
        ]
      },
      {
        subject: 'Product quality concern',
        description: 'The shoes I received have a defect in the sole. The stitching is coming apart and the sole is separating from the upper.',
        customer: customers[1] ? customers[1]._id : customers[0]._id,
        status: 'in_progress',
        priority: 'medium',
        category: 'quality',
        assignedTo: staff[1] ? staff[1]._id : staff[0] ? staff[0]._id : null,
        orderReference: orders[1] ? orders[1]._id : null,
        messages: [
          {
            sender: customers[1] ? `${customers[1].firstName} ${customers[1].lastName}` : `${customers[0].firstName} ${customers[0].lastName}`,
            message: 'The shoes I received have a defect in the sole. The stitching is coming apart and the sole is separating from the upper.',
            isCustomer: true,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
          },
          {
            sender: staff[1] ? `${staff[1].firstName} ${staff[1].lastName}` : 'Support Staff',
            message: 'I apologize for the inconvenience. I have initiated a replacement process for you. Please send us photos of the defect.',
            isCustomer: false,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
          }
        ]
      },
      {
        subject: 'Payment processing issue',
        description: 'I am getting an error when trying to pay with my credit card. The payment keeps failing even though my card has sufficient funds.',
        customer: customers[2] ? customers[2]._id : customers[0]._id,
        status: 'resolved',
        priority: 'low',
        category: 'payment',
        assignedTo: staff[0] ? staff[0]._id : null,
        orderReference: orders[2] ? orders[2]._id : null,
        resolution: 'Payment gateway issue was resolved. Customer can now complete their purchase.',
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        messages: [
          {
            sender: customers[2] ? `${customers[2].firstName} ${customers[2].lastName}` : `${customers[0].firstName} ${customers[0].lastName}`,
            message: 'I am getting an error when trying to pay with my credit card. The payment keeps failing even though my card has sufficient funds.',
            isCustomer: true,
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
          },
          {
            sender: staff[0] ? `${staff[0].firstName} ${staff[0].lastName}` : 'Support Staff',
            message: 'The payment issue has been resolved. Please try again. If you still face issues, please contact us.',
            isCustomer: false,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
          }
        ]
      },
      {
        subject: 'Account access problem',
        description: 'I forgot my password and the reset email is not working. I have tried multiple times but no email is being sent.',
        customer: customers[3] ? customers[3]._id : customers[0]._id,
        status: 'open',
        priority: 'high',
        category: 'account',
        assignedTo: staff[0] ? staff[0]._id : null,
        messages: [
          {
            sender: customers[3] ? `${customers[3].firstName} ${customers[3].lastName}` : `${customers[0].firstName} ${customers[0].lastName}`,
            message: 'I forgot my password and the reset email is not working. I have tried multiple times but no email is being sent.',
            isCustomer: true,
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
          }
        ]
      },
      {
        subject: 'Refund request',
        description: 'I would like to request a refund for my recent order. The product does not match the description on the website.',
        customer: customers[4] ? customers[4]._id : customers[1] ? customers[1]._id : customers[0]._id,
        status: 'in_progress',
        priority: 'medium',
        category: 'refund',
        assignedTo: staff[1] ? staff[1]._id : staff[0] ? staff[0]._id : null,
        orderReference: orders[0] ? orders[0]._id : null,
        messages: [
          {
            sender: customers[4] ? `${customers[4].firstName} ${customers[4].lastName}` : customers[1] ? `${customers[1].firstName} ${customers[1].lastName}` : `${customers[0].firstName} ${customers[0].lastName}`,
            message: 'I would like to request a refund for my recent order. The product does not match the description on the website.',
            isCustomer: true,
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
          },
          {
            sender: staff[1] ? `${staff[1].firstName} ${staff[1].lastName}` : 'Support Staff',
            message: 'I understand your concern. Let me process your refund request. Please provide your order number.',
            isCustomer: false,
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
          }
        ]
      }
    ];

    // Create support tickets
    for (const ticketData of supportTickets) {
      const ticket = new SupportTicket(ticketData);
      await ticket.save();
      console.log(`Created support ticket: ${ticket.ticketNumber}`);
    }

    console.log(`Successfully created ${supportTickets.length} support tickets`);
    
    // Display summary
    const stats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\nSupport Ticket Summary:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error populating support tickets:', error);
    process.exit(1);
  }
};

// Run the script
populateSupportTickets();
