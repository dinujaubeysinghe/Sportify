const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  payPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  salaryDetails: {
    baseSalary: {
      type: Number,
      required: true,
      min: 0
    },
    overtime: {
      type: Number,
      default: 0,
      min: 0
    },
    overtimeRate: {
      type: Number,
      default: 1.5
    },
    bonuses: {
      type: Number,
      default: 0,
      min: 0
    },
    commissions: {
      type: Number,
      default: 0,
      min: 0
    },
    allowances: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  deductions: {
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    socialSecurity: {
      type: Number,
      default: 0,
      min: 0
    },
    healthInsurance: {
      type: Number,
      default: 0,
      min: 0
    },
    retirement: {
      type: Number,
      default: 0,
      min: 0
    },
    other: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  calculatedAmounts: {
    grossPay: {
      type: Number,
      required: true,
      min: 0
    },
    totalDeductions: {
      type: Number,
      required: true,
      min: 0
    },
    netPay: {
      type: Number,
      required: true,
      min: 0
    }
  },
  paymentDetails: {
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'check', 'cash', 'direct_deposit'],
      default: 'direct_deposit'
    },
    bankAccount: {
      accountNumber: String,
      routingNumber: String,
      bankName: String
    },
    paymentDate: {
      type: Date,
      required: true
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    }
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true
});

// Pre-save middleware to calculate amounts
payrollSchema.pre('save', function(next) {
  const salary = this.salaryDetails;
  const deductions = this.deductions;
  
  // Calculate gross pay
  this.calculatedAmounts.grossPay = 
    salary.baseSalary + 
    (salary.overtime * salary.overtimeRate) + 
    salary.bonuses + 
    salary.commissions + 
    salary.allowances;
  
  // Calculate total deductions
  this.calculatedAmounts.totalDeductions = 
    deductions.tax + 
    deductions.socialSecurity + 
    deductions.healthInsurance + 
    deductions.retirement + 
    deductions.other;
  
  // Calculate net pay
  this.calculatedAmounts.netPay = 
    this.calculatedAmounts.grossPay - this.calculatedAmounts.totalDeductions;
  
  next();
});

// Index for better query performance
payrollSchema.index({ staffId: 1, 'payPeriod.startDate': 1 });
payrollSchema.index({ 'paymentDetails.status': 1 });
payrollSchema.index({ 'payPeriod.startDate': 1, 'payPeriod.endDate': 1 });

module.exports = mongoose.model('Payroll', payrollSchema);
