const mongoose = require('mongoose');

const uniformRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: String,
    required: true,
    enum: ['1st Year', 'HM', 'BSBA', 'BSIT', 'BSED/BEED', 'Criminology', 'BSA', 'COE', 'TM']
  },
  uniform: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL']
  },
  preferredDate: {
    type: Date,
    required: true
  },
  image: {
    type: String, // URL to uploaded image
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  pickupLocation: {
    type: String,
    default: 'Campus Uniform Office - South Campus'
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  // IDINAGDAG: Notification field
  notifications: [{
    message: String,
    type: {
      type: String,
      enum: ['status_update', 'admin_note', 'system'],
      default: 'status_update'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Virtual for status display
uniformRequestSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': '🟡 Pending',
    'approved': '🟢 Approved', 
    'rejected': '🔴 Rejected',
    'cancelled': '⚪ Cancelled'
  };
  return statusMap[this.status] || this.status;
});

module.exports = mongoose.model('UniformRequest', uniformRequestSchema);