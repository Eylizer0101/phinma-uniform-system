import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  Snackbar,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Visibility, VisibilityOff, Email, Lock, Key } from '@mui/icons-material';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Forgot Password States
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail
      }));
      setRememberMe(true);
    }
    
    if (savedPassword) {
      setFormData(prev => ({
        ...prev,
        password: savedPassword
      }));
    }
  }, []);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);

      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('rememberedPassword', formData.password);
      } else {
        // Clear saved credentials if remember me is unchecked
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      // Show success message
      setSnackbarOpen(true);

      // Redirect after showing success message
      setTimeout(() => {
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/request-uniform');
        }
      }, 1500);

    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setError('Please enter your email address');
      return;
    }

    setForgotPasswordLoading(true);
    setError('');

    try {
      await axios.post('/auth/forgot-password', { 
        email: forgotPasswordEmail 
      });
      
      setForgotPasswordSuccess('Password reset instructions have been sent to your email!');
      setForgotPasswordEmail('');
      
      setTimeout(() => {
        setForgotPasswordOpen(false);
        setForgotPasswordSuccess('');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleForgotPasswordOpen = () => {
    setForgotPasswordOpen(true);
    setForgotPasswordEmail('');
    setForgotPasswordSuccess('');
    setError('');
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordEmail('');
    setForgotPasswordSuccess('');
    setError('');
  };

  return (
    <Box
      className="uniform-auth-page"
      sx={{
        position: 'relative',
        top: 0,
        left: 0,
        width: '100%',
        minHeight: 'calc(100dvh - 70px)',
        overflow: 'visible',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #eef7ff 0%, #f4f9ff 52%, #e2f1ff 100%)',
        padding: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Paper
        className="uniform-auth-card"
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%',
          maxWidth: '1080px',
          height: 'auto',
          minHeight: { md: 530 },
          borderRadius: '26px',
          overflow: 'hidden',
          mt: { xs: 1, md: 2 },
        }}
      >
        {/* LEFT PANEL - PHINMA AU uniform branding */}
        <Box
          className="uniform-auth-brand"
          sx={{
            flex: { md: '0 0 47%' },
            minWidth: 0,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: { xs: 2.5, md: 5 },
            py: { xs: 3, md: 6 },
            color: '#102d60',
            overflow: 'hidden',
            bgcolor: '#ffffff',
          }}
        >
          <Box
            component="img"
            src="/images/CornerFlourish.png"
            alt=""
            aria-hidden="true"
            className="uniform-auth-flourish"
          />
          <Box className="uniform-auth-brand-content">
            <Box className="uniform-auth-shirt-circle">
              <Box component="img" src="/images/PoloShirt.png" alt="PHINMA AU uniform polo shirt" className="uniform-auth-shirt" />
            </Box>
            <Typography component="h2" sx={{ fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2rem' }, fontWeight: 800, color: '#092b60', lineHeight: 1.2, mt: 2 }}>
              Uniform Request
            </Typography>
            <Typography sx={{ mt: 1.5, fontSize: { xs: '.88rem', md: '1rem' }, color: '#506078', maxWidth: 290, mx: 'auto', lineHeight: 1.6 }}>
              Request, track, and manage your uniform request with ease.
            </Typography>
          </Box>
        </Box>

        {/* RIGHT PANEL (LOGIN FORM) */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: 'white',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 3, sm: 4, md: 5 },
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color="#092b60"
            gutterBottom
            sx={{ mb: 1 }}
          >
            Login
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Use your PHINMA email to login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 360 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: '100%', maxWidth: 360 }}
          >
            {/* Email */}
            <TextField
              fullWidth
              placeholder="PHINMA Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#3a7bd5' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': { borderRadius: 3 },
              }}
            />

            {/* Password */}
            <TextField
              fullWidth
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#3a7bd5' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': { borderRadius: 3 },
              }}
            />

            {/* Remember Me Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: '#3a7bd5',
                    '&.Mui-checked': {
                      color: '#3a7bd5',
                    },
                  }}
                />
              }
              label="Remember me"
              sx={{
                mb: 1,
                '& .MuiTypography-root': {
                  fontSize: '0.9rem',
                  color: 'text.secondary'
                }
              }}
            />

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Button
                onClick={handleForgotPasswordOpen}
                sx={{
                  color: '#3a7bd5',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  }
                }}
              >
                Forgot Password?
              </Button>
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.7,
                background: 'linear-gradient(100deg, #0098d0 0%, #00549e 100%)',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textTransform: 'none',
                borderRadius: '35px',
                '&:hover': { backgroundColor: '#326cb3' },
              }}
            >
              {loading ? 'Signing In...' : 'Login'}
            </Button>
          </Box>
          <Typography sx={{ mt: 2.5, fontSize: '.9rem', color: '#57647a', textAlign: 'center' }}>
            Don't have an account?{' '}
            <Box component={RouterLink} to="/register" sx={{ color: '#0071a5', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Register
            </Box>
          </Typography>
        </Box>
      </Paper>

      {/* SUCCESS SNACKBAR */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1500}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Login successful! Redirecting...
        </Alert>
      </Snackbar>

      {/* FORGOT PASSWORD DIALOG */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={handleForgotPasswordClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#3a7bd5', 
          color: 'white',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Key />
          Reset Your Password
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {forgotPasswordSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {forgotPasswordSuccess}
            </Alert>
          ) : (
            <>
              <Typography variant="body1" gutterBottom>
                Enter your email address and we'll send you instructions to reset your password.
              </Typography>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your PHINMA email"
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleForgotPasswordClose}
            disabled={forgotPasswordLoading}
          >
            Cancel
          </Button>
          {!forgotPasswordSuccess && (
            <Button
              onClick={handleForgotPassword}
              variant="contained"
              disabled={forgotPasswordLoading || !forgotPasswordEmail}
              sx={{
                backgroundColor: '#3a7bd5',
                '&:hover': { backgroundColor: '#326cb3' },
              }}
            >
              {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;