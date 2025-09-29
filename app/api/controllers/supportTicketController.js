const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get all support tickets
// @route   GET /api/support-tickets
// @access  Staff/Admin
exports.getSupportTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Filter by status
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    
    // Filter by priority
    if (req.query.priority && req.query.priority !== 'all') {
      query.priority = req.query.priority;
    }
    
    // Filter by category
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { subject: { $regex: req.query.search, $options: 'i' } },
        { ticketNumber: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const tickets = await SupportTicket.find(query)
      .populate('customer', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName')
      .populate('orderReference', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SupportTicket.countDocuments(query);

    res.json({
      success: true,
      count: tickets.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      tickets
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single support ticket
// @route   GET /api/support-tickets/:id
// @access  Staff/Admin
exports.getSupportTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName')
      .populate('orderReference', 'orderNumber');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Get support ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new support ticket
// @route   POST /api/support-tickets
// @access  Staff/Admin
exports.createSupportTicket = async (req, res) => {
  try {
    const { subject, description, customer, priority, category, orderReference } = req.body;

    // Validate required fields
    if (!subject || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject and description are required' 
      });
    }

    // Check if customer exists
    const customerExists = await User.findById(customer);
    if (!customerExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    // Check if order reference exists (if provided)
    if (orderReference) {
      const orderExists = await Order.findById(orderReference);
      if (!orderExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Order reference not found' 
        });
      }
    }

    const ticket = new SupportTicket({
      subject,
      description,
      customer,
      priority: priority || 'medium',
      category: category || 'general',
      assignedTo: req.user._id, // Assign to current user
      orderReference: orderReference || null,
      messages: [{
        sender: customerExists.firstName + ' ' + customerExists.lastName,
        message: description,
        isCustomer: true
      }]
    });

    await ticket.save();

    // Populate the ticket before sending response
    await ticket.populate([
      { path: 'customer', select: 'firstName lastName email phone' },
      { path: 'assignedTo', select: 'firstName lastName' },
      { path: 'orderReference', select: 'orderNumber' }
    ]);

    res.status(201).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update support ticket
// @route   PUT /api/support-tickets/:id
// @access  Staff/Admin
exports.updateSupportTicket = async (req, res) => {
  try {
    const { status, priority, assignedTo, resolution } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    // Update fields
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (assignedTo) ticket.assignedTo = assignedTo;
    if (resolution) ticket.resolution = resolution;

    // Set timestamps based on status
    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
    } else if (status === 'closed') {
      ticket.closedAt = new Date();
    }

    await ticket.save();

    // Populate the ticket before sending response
    await ticket.populate([
      { path: 'customer', select: 'firstName lastName email phone' },
      { path: 'assignedTo', select: 'firstName lastName' },
      { path: 'orderReference', select: 'orderNumber' }
    ]);

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Update support ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add message to support ticket
// @route   POST /api/support-tickets/:id/messages
// @access  Staff/Admin
exports.addMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    // Add message
    ticket.messages.push({
      sender: req.user.firstName + ' ' + req.user.lastName,
      message: message.trim(),
      isCustomer: false
    });

    ticket.updatedAt = new Date();
    await ticket.save();

    res.json({
      success: true,
      message: 'Message added successfully',
      ticket
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get support ticket statistics
// @route   GET /api/support-tickets/stats
// @access  Staff/Admin
exports.getSupportTicketStats = async (req, res) => {
  try {
    const stats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalTickets = await SupportTicket.countDocuments();
    
    const statusCounts = {
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      stats: {
        total: totalTickets,
        open: statusCounts.open,
        in_progress: statusCounts.in_progress,
        resolved: statusCounts.resolved,
        closed: statusCounts.closed
      }
    });
  } catch (error) {
    console.error('Get support ticket stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete support ticket
// @route   DELETE /api/support-tickets/:id
// @access  Admin only
exports.deleteSupportTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    await SupportTicket.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Support ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete support ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
