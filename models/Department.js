const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional - department might not have a manager initially
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'admin'],
    default: 'read'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better performance
departmentSchema.index({ name: 1 });
departmentSchema.index({ manager: 1 });
departmentSchema.index({ isActive: 1 });

// Virtual for staff count
departmentSchema.virtual('staffCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  count: true
});

// Ensure virtual fields are serialized
departmentSchema.set('toJSON', { virtuals: true });
departmentSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update updatedAt
departmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get department statistics
departmentSchema.statics.getDepartmentStats = async function() {
  try {
    const stats = await this.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'department',
          as: 'staff'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          manager: 1,
          staffCount: { $size: '$staff' },
          activeStaffCount: {
            $size: {
              $filter: {
                input: '$staff',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      },
      {
        $sort: { staffCount: -1 }
      }
    ]);

    return stats;
  } catch (error) {
    console.error('Error getting department stats:', error);
    throw error;
  }
};

// Instance method to check if department can be deleted
departmentSchema.methods.canBeDeleted = async function() {
  const staffCount = await mongoose.model('User').countDocuments({ 
    department: this._id 
  });
  return staffCount === 0;
};

// Instance method to get department staff
departmentSchema.methods.getStaff = async function() {
  return await mongoose.model('User').find({ 
    department: this._id,
    role: 'staff'
  }).select('-password');
};

module.exports = mongoose.model('Department', departmentSchema);