const Payroll = require('../models/Payroll');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all payroll records
exports.getAllPayrolls = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      department, 
      startDate, 
      endDate,
      staffId 
    } = req.query;

    const query = {};
    
    if (status) query['paymentDetails.status'] = status;
    if (department) query.department = department;
    if (staffId) query.staffId = staffId;
    if (startDate && endDate) {
      query['payPeriod.startDate'] = { $gte: new Date(startDate) };
      query['payPeriod.endDate'] = { $lte: new Date(endDate) };
    }

    const payrolls = await Payroll.find(query)
      .populate('staffId', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payroll.countDocuments(query);

    res.json({
      success: true,
      data: {
        payrolls,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get payrolls error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single payroll record
exports.getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('staffId', 'firstName lastName email phone department position')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    res.json({ success: true, data: payroll });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new payroll record
exports.createPayroll = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      staffId,
      payPeriod,
      salaryDetails,
      deductions,
      paymentDetails,
      notes
    } = req.body;

    // Verify staff exists
    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    // Check for duplicate payroll for the same period
    const existingPayroll = await Payroll.findOne({
      staffId,
      'payPeriod.startDate': new Date(payPeriod.startDate),
      'payPeriod.endDate': new Date(payPeriod.endDate)
    });

    if (existingPayroll) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payroll record already exists for this period' 
      });
    }

    const payrollData = {
      staffId,
      employeeId: staff.employeeId,
      firstName: staff.firstName,
      lastName: staff.lastName,
      department: staff.department,
      position: staff.position,
      payPeriod: {
        startDate: new Date(payPeriod.startDate),
        endDate: new Date(payPeriod.endDate)
      },
      salaryDetails: {
        baseSalary: salaryDetails.baseSalary,
        overtime: salaryDetails.overtime || 0,
        overtimeRate: salaryDetails.overtimeRate || 1.5,
        bonuses: salaryDetails.bonuses || 0,
        commissions: salaryDetails.commissions || 0,
        allowances: salaryDetails.allowances || 0
      },
      deductions: {
        tax: deductions.tax || 0,
        socialSecurity: deductions.socialSecurity || 0,
        healthInsurance: deductions.healthInsurance || 0,
        retirement: deductions.retirement || 0,
        other: deductions.other || 0
      },
      paymentDetails: {
        paymentMethod: paymentDetails.paymentMethod || 'direct_deposit',
        bankAccount: paymentDetails.bankAccount || {},
        paymentDate: new Date(paymentDetails.paymentDate),
        status: paymentDetails.status || 'pending'
      },
      notes: notes || '',
      createdBy: req.user.id
    };

    const payroll = await Payroll.create(payrollData);

    // Populate the created payroll
    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('staffId', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Payroll record created successfully',
      data: populatedPayroll
    });
  } catch (error) {
    console.error('Create payroll error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update payroll record
exports.updatePayroll = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    // Check if payroll is already processed
    if (payroll.paymentDetails.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify completed payroll record' 
      });
    }

    const {
      payPeriod,
      salaryDetails,
      deductions,
      paymentDetails,
      notes
    } = req.body;

    // Update fields
    if (payPeriod) {
      payroll.payPeriod.startDate = new Date(payPeriod.startDate);
      payroll.payPeriod.endDate = new Date(payPeriod.endDate);
    }

    if (salaryDetails) {
      Object.assign(payroll.salaryDetails, salaryDetails);
    }

    if (deductions) {
      Object.assign(payroll.deductions, deductions);
    }

    if (paymentDetails) {
      Object.assign(payroll.paymentDetails, paymentDetails);
      if (paymentDetails.paymentDate) {
        payroll.paymentDetails.paymentDate = new Date(paymentDetails.paymentDate);
      }
    }

    if (notes !== undefined) {
      payroll.notes = notes;
    }

    await payroll.save();

    // Populate the updated payroll
    const updatedPayroll = await Payroll.findById(payroll._id)
      .populate('staffId', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Payroll record updated successfully',
      data: updatedPayroll
    });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete payroll record
exports.deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    // Check if payroll is already processed
    if (payroll.paymentDetails.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete completed payroll record' 
      });
    }

    await Payroll.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Payroll record deleted successfully'
    });
  } catch (error) {
    console.error('Delete payroll error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Approve payroll record
exports.approvePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    if (payroll.paymentDetails.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only pending payroll records can be approved' 
      });
    }

    payroll.paymentDetails.status = 'processing';
    payroll.approvedBy = req.user.id;
    payroll.approvedAt = new Date();

    await payroll.save();

    const updatedPayroll = await Payroll.findById(payroll._id)
      .populate('staffId', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Payroll record approved successfully',
      data: updatedPayroll
    });
  } catch (error) {
    console.error('Approve payroll error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Process payroll (mark as completed)
exports.processPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    if (payroll.paymentDetails.status !== 'processing') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only processing payroll records can be completed' 
      });
    }

    const { transactionId } = req.body;

    payroll.paymentDetails.status = 'completed';
    payroll.paymentDetails.transactionId = transactionId;

    await payroll.save();

    const updatedPayroll = await Payroll.findById(payroll._id)
      .populate('staffId', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Payroll processed successfully',
      data: updatedPayroll
    });
  } catch (error) {
    console.error('Process payroll error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get payroll statistics
exports.getPayrollStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query['payPeriod.startDate'] = { $gte: new Date(startDate) };
      query['payPeriod.endDate'] = { $lte: new Date(endDate) };
    }

    const stats = await Payroll.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalGrossPay: { $sum: '$calculatedAmounts.grossPay' },
          totalDeductions: { $sum: '$calculatedAmounts.totalDeductions' },
          totalNetPay: { $sum: '$calculatedAmounts.netPay' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$paymentDetails.status', 'pending'] }, 1, 0] }
          },
          processingCount: {
            $sum: { $cond: [{ $eq: ['$paymentDetails.status', 'processing'] }, 1, 0] }
          },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$paymentDetails.status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalRecords: 0,
        totalGrossPay: 0,
        totalDeductions: 0,
        totalNetPay: 0,
        pendingCount: 0,
        processingCount: 0,
        completedCount: 0
      }
    });
  } catch (error) {
    console.error('Get payroll stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get staff members for payroll
exports.getStaffForPayroll = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff', isActive: true })
      .select('_id firstName lastName email employeeId department position')
      .sort({ firstName: 1 });

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Get staff for payroll error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
