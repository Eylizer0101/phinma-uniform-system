const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/emailService');
const { sendPasswordResetEmail, sendPasswordResetSuccessEmail } = require('../services/brevoEmailService');
const crypto = require('crypto');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { fullName, studentId, email, password, course, yearLevel, role } = req.body;

    console.log('👤 Registration attempt for:', email);

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { studentId }] 
    });

    if (existingUser) {
      console.log('❌ User already exists:', { email, studentId });
      return res.status(400).json({ 
        message: 'User already exists with this email or student ID' 
      });
    }

    // Create user (initially unverified)
    console.log('✅ Creating new user...');
    const user = await User.create({
      fullName,
      studentId,
      email,
      password,
      course,
      yearLevel,
      role: role || 'student',
      isVerified: false
    });

    // Generate OTP and send verification email
    console.log('🔑 Generating OTP...');
    const otpCode = user.generateOTP();
    await user.save();
    console.log('✅ OTP generated:', otpCode);

    // Send OTP via email
    console.log('📨 Sending verification email...');
    const emailSent = await sendOTPEmail(user.email, user.fullName, otpCode);

    if (!emailSent) {
      console.log('❌ Email sending failed, but user created');
      return res.status(201).json({
        message: 'User registered successfully but verification email failed. Please contact support.',
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
        },
        requiresVerification: true,
        emailSent: false
      });
    }

    console.log('✅ Registration successful with email sent');
    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification code.',
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
      },
      requiresVerification: true,
      emailSent: true
    });

  } catch (error) {
    console.error('💥 Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// LOGIN (UPDATED TO CHECK VERIFICATION)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if account is disabled
    if (user.status === 'disabled') {
      console.log('❌ Account disabled:', email);
      return res.status(400).json({ message: 'Account has been disabled' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      console.log('❌ Email not verified, sending new OTP:', email);
      // Generate new OTP for unverified users trying to login
      const otpCode = user.generateOTP();
      await user.save();
      
      // Send new OTP
      await sendOTPEmail(user.email, user.fullName, otpCode);

      return res.status(403).json({
        message: 'Email not verified. A new verification code has been sent to your email.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('✅ Login successful for:', email);

    res.json({
      message: 'Login successful',
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
        isVerified: user.isVerified,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// IDINAGDAG: FORGOT PASSWORD - Request Password Reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('🔐 Forgot password request for:', email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user doesn't exist for security
      console.log('📧 User not found, but returning success for security');
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Check if account is disabled
    if (user.status === 'disabled') {
      return res.status(400).json({ message: 'Account has been disabled' });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    console.log('🔑 Reset token generated for:', email);

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.fullName);

    if (!emailResult.success) {
      console.error('❌ Failed to send reset email:', emailResult.error);
      // Clear the reset token since email failed
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({
        message: 'Failed to send reset email. Please try again later.'
      });
    }

    console.log('✅ Password reset email sent successfully to:', email);
    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('💥 Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// IDINAGDAG: RESET PASSWORD - Validate Token and Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    console.log('🔐 Reset password attempt with token');

    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: 'Token and new password are required' 
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ Invalid or expired reset token');
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('✅ Password reset successful for:', user.email);

    // Send success notification email
    await sendPasswordResetSuccessEmail(user.email, user.fullName);

    res.json({
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('💥 Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// IDINAGDAG: VALIDATE RESET TOKEN
router.get('/validate-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    console.log('🔐 Validating reset token');

    if (!token) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Token is required' 
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ Invalid or expired reset token');
      return res.json({ 
        valid: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    console.log('✅ Reset token is valid for:', user.email);
    res.json({ 
      valid: true, 
      email: user.email 
    });

  } catch (error) {
    console.error('💥 Validate token error:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;