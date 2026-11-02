const express = require('express');
const {
  sendOTP,
  verifyOTP,
  resendOTP
} = require('../controllers/emailVerificationController');

const router = express.Router();

// Send OTP to email
router.post('/send-otp', sendOTP);

// Verify OTP
router.post('/verify-otp', verifyOTP);

// Resend OTP
router.post('/resend-otp', resendOTP);

module.exports = router;