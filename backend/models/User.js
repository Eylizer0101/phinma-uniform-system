const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  course: {
    type: String,
    required: true,
    enum: [
      "BS Accountancy",
      "BS Business Administration",
      "BS Business Administration (Marketing Management)",
      "BS Business Administration (Banking and Microfinance)",
      "BS Business Administration (Financial Management)",
      "BS Business Administration (Human Resource Management)",
      "BS Entrepreneurship",
      "BS Hospitality Management",
      "BS Tourism Management",
      "BS Criminology",
      "BS Civil Engineering",
      "BS Electrical Engineering",
      "BS Information Technology",
      "BS Information Technology (Business Informatics)",
      "BS Information Technology (System Development)",
      "BS Nursing",
      "BS Pharmacy",
      "BS Medical Laboratory Science",
      "BS Psychology",
      "BSED (Bachelor of Secondary Education)",
      "BSED (Science)",
      "BSED (Mathematics)",
      "BSED (English)",
      "BSED (Filipino)",
      "BA Political Science",
      "BA English Language"
    ]
  },
  yearLevel: {
    type: String,
    required: true,
    enum: [
      "1st Year College",
      "2nd Year College", 
      "3rd Year College",
      "4th Year College"
    ]
  },
  contactNumber: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  studentIdImage: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active'
  },
  // NEW FIELDS FOR EMAIL VERIFICATION
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  // IDINAGDAG: Password Reset Fields
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP method
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  };
  return otp;
};

// Verify OTP method
userSchema.methods.verifyOTP = function(enteredOTP) {
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
    return false;
  }
  
  const now = new Date();
  if (now > this.otp.expiresAt) {
    this.otp = undefined;
    return false;
  }
  
  if (this.otp.code === enteredOTP) {
    this.isVerified = true;
    this.otp = undefined;
    return true;
  }
  
  return false;
};

// IDINAGDAG: Generate Password Reset Token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);