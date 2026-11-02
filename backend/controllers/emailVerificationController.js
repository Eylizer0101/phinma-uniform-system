const User = require('../models/User');
const { sendOTPEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Send OTP to email
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('🔍 Looking for user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      console.log('ℹ️ User already verified:', email);
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate OTP
    console.log('🔑 Generating OTP for user:', email);
    const otpCode = user.generateOTP();
    await user.save();
    console.log('✅ OTP generated and saved:', otpCode);

    // Send OTP via email
    console.log('📨 Attempting to send email...');
    const emailSent = await sendOTPEmail(user.email, user.fullName, otpCode);
    
    if (!emailSent) {
      console.log('❌ Email sending failed for:', email);
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    console.log('✅ Email sent successfully to:', email);
    res.json({ 
      message: 'Verification code sent to your email',
      email: user.email 
    });

  } catch (error) {
    console.error('💥 Send OTP error:', error);
    res.status(500).json({ 
      message: 'Server error while sending OTP', 
      error: error.message 
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        message: 'Email and OTP are required' 
      });
    }

    console.log('🔍 Verifying OTP for:', email);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Verify OTP
    console.log('🔑 Checking OTP:', otp);
    const isOTPValid = user.verifyOTP(otp);
    if (!isOTPValid) {
      console.log('❌ Invalid OTP for user:', email);
      return res.status(400).json({ 
        message: 'Invalid or expired verification code' 
      });
    }

    await user.save();
    console.log('✅ Email verified successfully for:', email);

    // Generate token after successful verification
    const token = generateToken(user._id);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        studentId: user.studentId,
        email: user.email,
        course: user.course,
        yearLevel: user.yearLevel,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('💥 Verify OTP error:', error);
    res.status(500).json({ 
      message: 'Server error while verifying OTP', 
      error: error.message 
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('🔁 Resending OTP to:', email);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new OTP
    const otpCode = user.generateOTP();
    await user.save();
    console.log('✅ New OTP generated:', otpCode);

    // Send new OTP via email
    const emailSent = await sendOTPEmail(user.email, user.fullName, otpCode);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to resend verification email' });
    }

    console.log('✅ Resent email successfully to:', email);
    res.json({ 
      message: 'New verification code sent to your email',
      email: user.email 
    });

  } catch (error) {
    console.error('💥 Resend OTP error:', error);
    res.status(500).json({ 
      message: 'Server error while resending OTP', 
      error: error.message 
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP
};