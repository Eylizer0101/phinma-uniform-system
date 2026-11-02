import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  MenuItem,
  Paper,
  FormControlLabel,
  Checkbox,
  Link,
  Snackbar
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Person,
  Badge,
  Email,
  School,
  CalendarToday,
  Lock,
  Visibility,
  VisibilityOff,
  AdminPanelSettings
} from '@mui/icons-material';
import SchoolIcon from '@mui/icons-material/School';
import GradeIcon from '@mui/icons-material/Grade';

const courses = [
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
  "BA English Language",
];

const yearLevels = [
  "1st Year College",
  "2nd Year College",
  "3rd Year College",
  "4th Year College"
];

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    course: '',
    yearLevel: '',
    isAdmin: false,
    adminCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Manual validation functions
  const validateFullName = (name) => {
    if (name.length < 6) return "Full Name should have at least 6 characters";
    if (/[0-9]/.test(name)) return "Full Name should not contain numbers";
    return "";
  };

  const validateStudentId = (id) => {
    if (!/^\d{2}-\d{4}-\d{5,6}$/.test(id)) return "Please use your PHINMA AU student ID (Format: XX-XXXX-XXXXX)";
    return "";
  };

  const validateEmail = (email) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address";
    if (!/@phinmaed\.com$/.test(email)) return "Use only your PHINMA AU email";
    return "";
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/^(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) return "Password must contain at least one special character";
    return "";
  };

  const validateForm = () => {
    const errors = {};

    // Validate each field
    const fullNameError = validateFullName(formData.fullName);
    if (fullNameError) errors.fullName = fullNameError;

    const studentIdError = validateStudentId(formData.studentId);
    if (studentIdError) errors.studentId = studentIdError;

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    if (!formData.course) errors.course = "Course is required";
    if (!formData.yearLevel) errors.yearLevel = "Year Level is required";

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSuccess(false);
    setRequiresVerification(false);

    // Manual validation
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (formData.isAdmin) {
      if (formData.adminCode !== 'ADMIN2024') {
        return setError('Invalid admin registration code');
      }
      if (formData.studentId !== 'admin') {
        return setError('Admin accounts must use "admin" as Student ID');
      }
    }

    setLoading(true);

    try {
      const userData = {
        fullName: formData.fullName,
        studentId: formData.studentId,
        email: formData.email,
        password: formData.password,
        course: formData.course,
        yearLevel: formData.yearLevel,
        role: formData.isAdmin ? 'admin' : 'student'
      };

      // Register the user
      const result = await register(userData);

      if (result.requiresVerification) {
        // Redirect to email verification page
        setRegisteredEmail(formData.email);
        setRequiresVerification(true);
        setSuccess(true);
        setSnackbarOpen(true);
        
        // Redirect to verification page after 2 seconds
        setTimeout(() => {
          navigate('/email-verification', { 
            state: { email: formData.email } 
          });
        }, 2000);
      } else {
        // For admin users or if no verification required
        setSuccess(true);
        setSnackbarOpen(true);
        
        // Redirect to appropriate page based on role
        setTimeout(() => {
          const redirectPath = result.user.role === 'admin' ? '/admin/dashboard' : '/';
          navigate(redirectPath);
        }, 2000);
      }

    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // If requires verification, show different message
  if (requiresVerification) {
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
            maxWidth: 500,
            width: '100%',
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="#3a7bd5" gutterBottom>
            Check Your Email
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            We've sent a verification code to <strong>{registeredEmail}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please check your inbox and follow the instructions to verify your email address.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/email-verification', { state: { email: registeredEmail } })}
            sx={{
              backgroundColor: '#3a7bd5',
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: 3,
              px: 4,
              '&:hover': { backgroundColor: '#326cb3' }
            }}
          >
            Enter Verification Code
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      className="uniform-auth-page"
      sx={{
        minHeight: 'calc(100dvh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #eef7ff 0%, #f4f9ff 52%, #e2f1ff 100%)',
        overflow: 'visible',
        padding: { xs: 2, md: 3 },
        position: 'relative',
        mt: 0,
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
          transform: 'none',
            mt: 0,
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

        {/* RIGHT PANEL */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: 'white',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'auto',
            minWidth: 0,
            p: { xs: 2.5, sm: 4 },
            mt: 0,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color="#092b60"
            gutterBottom
            textAlign="center"
          >
            Register
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, textAlign: 'center' }}
          >
            Create your account
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                width: '100%',
                maxWidth: 360,
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 2,
                width: '100%',
                maxWidth: 360,
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              Registration successful! Redirecting to verification page...
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              maxWidth: 440,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <TextField
              fullWidth
              placeholder="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              size="small"
              error={!!fieldErrors.fullName}
              helperText={fieldErrors.fullName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#3a7bd5' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />

            <TextField
              fullWidth
              placeholder="Student ID (e.g., 20-1234-12345)"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
              size="small"
              error={!!fieldErrors.studentId}
              helperText={fieldErrors.studentId || ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge sx={{ color: '#3a7bd5' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />

            <TextField
              fullWidth
              placeholder="PHINMA Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              size="small"
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#3a7bd5' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />

            <TextField
              fullWidth
              select
              label="Course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              size="small"
              error={!!fieldErrors.course}
              helperText={fieldErrors.course}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SchoolIcon sx={{ color: '#3a7bd5' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 3 },
              }}
            >
              <MenuItem value="" disabled>
                Select Course
              </MenuItem>
              {courses.map((course) => (
                <MenuItem key={course} value={course}>
                  {course}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="Year Level"
              name="yearLevel"
              value={formData.yearLevel}
              onChange={handleChange}
              required
              size="small"
              error={!!fieldErrors.yearLevel}
              helperText={fieldErrors.yearLevel}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SchoolIcon sx={{ color: '#3a7bd5' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 3 },
              }}
            >
              <MenuItem value="" disabled>
                Select Year Level
              </MenuItem>
              {yearLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              placeholder="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              size="small"
              error={!!fieldErrors.password}
              helperText={fieldErrors.password || "Min. 8 characters with special character"}
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || success}
              sx={{
                py: 1.3,
                mt: 1,
                background: 'linear-gradient(100deg, #0098d0 0%, #00549e 100%)',
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: '35px',
                '&:hover': { backgroundColor: '#326cb3' },
              }}
            >
              {loading ? 'Creating Account...' : success ? 'Registration Successful!' : 'Create Account'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* SUCCESS SNACKBAR */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Registration successful! Redirecting to verification...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Register;