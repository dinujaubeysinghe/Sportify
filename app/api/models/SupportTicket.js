const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  isCustomer: {
    type: Boolean,
    default: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: false
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'delivery', 'quality', 'payment', 'account', 'technical', 'refund'],
    default: 'general'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [messageSchema],
  orderReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  tags: [String],
  resolution: {
    type: String,
    maxlength: [1000, 'Resolution cannot exceed 1000 characters']
  },
  resolvedAt: Date,
  closedAt: Date
}, {
  timestamps: true
});

// Generate ticket number before saving
supportTicketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    try {
      const count = await mongoose.model('SupportTicket').countDocuments();
      this.ticketNumber = `TKT-${String(count + 1).padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating ticket number:', error);
      // Fallback to timestamp-based ticket number
      this.ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

// Method to update status
supportTicketSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  if (newStatus === 'resolved') {
    this.resolvedAt = new Date();
  } else if (newStatus === 'closed') {
    this.closedAt = new Date();
  }
  
  return this.save();
};

// Method to add message
supportTicketSchema.methods.addMessage = function(sender, message, isCustomer = false) {
  this.messages.push({
    sender,
    message,
    isCustomer,
    timestamp: new Date()
  });
  
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
