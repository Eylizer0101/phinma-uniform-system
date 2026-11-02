import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
  CircularProgress,
  Link
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmailVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState('');

  const otpRefs = useRef([]);
  const { verifyEmail, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state or from auth context
    const userEmail = location.state?.email || '';
    setEmail(userEmail);

    if (!userEmail) {
      setError('No email found. Please register again.');
    }

    // Start countdown for resend OTP
    setCountdown(60);
    
    // Focus first input on component mount
    if (otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [location]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        // Move to previous input if current is empty
        otpRefs.current[index - 1].focus();
      } else {
        // Clear current input and stay
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('').slice(0, 6);
      const updatedOtp = [...otp];
      newOtp.forEach((digit, index) => {
        updatedOtp[index] = digit;
      });
      setOtp(updatedOtp);
      
      // Focus the last filled input or the last one
      const lastFilledIndex = Math.min(newOtp.length - 1, 5);
      otpRefs.current[lastFilledIndex].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      // Focus first empty input
      const firstEmptyIndex = otp.findIndex(digit => digit === '');
      if (firstEmptyIndex !== -1) {
        otpRefs.current[firstEmptyIndex].focus();
      }
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email, otpCode);
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setError('');
    try {
      await resendOTP(email);
      setSuccess('New verification code sent to your email!');
      setCountdown(60);
      // Reset OTP and focus first input
      setOtp(['', '', '', '', '', '']);
      if (otpRefs.current[0]) {
        otpRefs.current[0].focus();
      }
    } catch (err) {
      setError(err.message || 'Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f7fa',
        padding: 2
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          maxWidth: 450,
          width: '100%',
          borderRadius: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="#3a7bd5" gutterBottom>
          Verify Your Email
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We've sent a 6-digit verification code to
        </Typography>

        <Typography variant="body1" fontWeight="bold" color="text.primary" sx={{ mb: 3 }}>
          {email}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleVerify} sx={{ mb: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 1, 
              mb: 3,
              '& .MuiTextField-root': {
                transition: 'all 0.2s ease-in-out',
                '&:focus-within': {
                  transform: 'scale(1.05)'
                }
              }
            }}
          >
            {otp.map((data, index) => (
              <TextField
                key={index}
                value={data}
                inputRef={(ref) => (otpRefs.current[index] = ref)}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                inputProps={{
                  maxLength: 1,
                  style: {
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    padding: '12px 8px'
                  }
                }}
                sx={{
                  width: 55,
                  height: 60,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    height: '100%',
                    '& input': {
                      textAlign: 'center',
                      padding: '12px 8px'
                    },
                    '&:hover': {
                      borderColor: '#3a7bd5'
                    }
                  }
                }}
              />
            ))}
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              backgroundColor: '#3a7bd5',
              fontWeight: 'bold',
              fontSize: '1rem',
              textTransform: 'none',
              borderRadius: 3,
              '&:hover': { backgroundColor: '#326cb3' },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify Email'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Didn't receive the code?
          </Typography>

          <Button
            onClick={handleResendOTP}
            disabled={resendLoading || countdown > 0}
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              color: countdown > 0 ? 'text.disabled' : '#3a7bd5',
              '&:hover': {
                backgroundColor: 'transparent',
                color: countdown > 0 ? 'text.disabled' : '#2a5b9b'
              }
            }}
          >
            {resendLoading ? (
              <CircularProgress size={20} />
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              'Resend Verification Code'
            )}
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Link
            href="/login"
            sx={{
              textDecoration: 'none',
              color: '#3a7bd5',
              fontWeight: 'bold',
              '&:hover': { 
                textDecoration: 'underline',
                color: '#2a5b9b'
              }
            }}
          >
            Back to Login
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmailVerification;