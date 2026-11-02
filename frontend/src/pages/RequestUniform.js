import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardMedia,
  TextField,
  Grid,
  Stack
} from '@mui/material';
import { CloudUpload, CheckCircle, Info, Upload } from '@mui/icons-material'; 
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const RequestUniform = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    course: '',
    uniform: '',
    size: '',
    gender: '',
    preferredDate: null
  });
  const [uniforms, setUniforms] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    course: false,
    uniform: false,
    size: false,
    gender: false,
    preferredDate: false,
    image: false
  });

  const courses = [
    { value: '1st Year', label: '1st Year uniform' },
    { value: 'HM', label: 'HM (Hospitality Management)' },
    { value: 'BSBA', label: 'BSBA (Business Administration)' },
    { value: 'BSIT', label: 'BSIT (Information Technology)' },
    { value: 'Criminology', label: 'Criminology' },
    { value: 'BSA', label: 'BSA (Accountancy)' },
    { value: 'COE', label: 'COE (Engineering)' },
    { value: 'TM', label: 'TM (Tourism Management)' }
  ];

  const sizes = [
    { value: 'XS', label: 'XS' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' }
  ];

  const genders = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ];

  useEffect(() => {
    if (formData.course) {
      axios.get(`/uniform-requests/uniforms/${formData.course}`)
        .then(response => {
          setUniforms(response.data);
          setFormData(prev => ({ ...prev, uniform: '' }));
        })
        .catch(error => {
          console.error('Error fetching uniforms:', error);
          setUniforms([]);
        });
    } else {
      setUniforms([]);
    }
  }, [formData.course]);

  const validateForm = () => {
    const errors = {
      course: !formData.course,
      uniform: !formData.uniform,
      size: !formData.size,
      gender: !formData.gender,
      preferredDate: !formData.preferredDate,
      image: !image
    };
    setFieldErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (value) {
      setFieldErrors({
        ...fieldErrors,
        [name]: false
      });
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      preferredDate: date
    });
    if (date) {
      setFieldErrors({
        ...fieldErrors,
        preferredDate: false
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setFieldErrors({
        ...fieldErrors,
        image: false
      });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('course', formData.course);
      submitData.append('uniform', formData.uniform);
      submitData.append('size', formData.size);
      submitData.append('gender', formData.gender);
      submitData.append('preferredDate', formData.preferredDate.toISOString());
      submitData.append('image', image);

      const response = await axios.post('/uniform-requests', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Uniform request submitted successfully!');
      
      setTimeout(() => {
        navigate('/track-request');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedUniformImage = () => {
    const selectedUniform = uniforms.find(u => u.value === formData.uniform);
    return selectedUniform ? selectedUniform.image : null;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        minHeight: '100vh',
        background: "linear-gradient(180deg, #b9d9f9ff 0%, #ffffffff 100%)",
        py: { xs: 3, md: 5 },
        display: 'flex',
        alignItems: 'center'
      }}>
        <Container maxWidth="lg">
          <Paper elevation={12} sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 4,
            background: 'white',
            boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
            maxWidth: 1100,
            mx: 'auto'
          }}>
            
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
                Request Uniform
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Fill out the form below to submit your uniform request
              </Typography>
            </Box>

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 3, fontSize: '1rem' }} icon={<CheckCircle />}>
                {success}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontSize: '1rem' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={4} alignItems="flex-start">

                {/* LEFT COLUMN - Input Fields */}
                <Grid item xs={12} md={8}>
                  <Stack spacing={3.5}>
                    
                    {/* Course */}
                    <FormControl fullWidth required error={fieldErrors.course} size="medium">
                      <InputLabel shrink>Course</InputLabel>
                      <Select
                        name="course"
                        value={formData.course}
                        label="Course"
                        onChange={handleChange}
                        displayEmpty
                        sx={{ height: 56 }}
                      >
                        <MenuItem value="" disabled><em>Select Course</em></MenuItem>
                        {courses.map((course) => (
                          <MenuItem key={course.value} value={course.value}>
                            {course.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Uniform Type */}
                    <FormControl fullWidth required error={fieldErrors.uniform} disabled={!formData.course} size="medium">
                      <InputLabel shrink>Uniform Type</InputLabel>
                      <Select
                        name="uniform"
                        value={formData.uniform}
                        label="Uniform Type"
                        onChange={handleChange}
                        displayEmpty
                        sx={{ height: 56 }}
                      >
                        <MenuItem value="" disabled>
                          {uniforms.length === 0 ? 'Select a Course first' : 'Select Uniform'}
                        </MenuItem>
                        {uniforms.map((uniform) => (
                          <MenuItem key={uniform.value} value={uniform.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <img 
                                src={uniform.image} 
                                alt={uniform.label}
                                style={{ 
                                  width: 36,
                                  height: 36, 
                                  objectFit: 'cover',
                                  borderRadius: 6,
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                }}
                                onError={(e) => {
                                  e.target.src = '/images/default-uniform.jpg';
                                }}
                              />
                              <Typography variant="body1" fontWeight="medium">
                                {uniform.label}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Gender & Size */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required error={fieldErrors.gender} size="medium">
                          <InputLabel shrink>Gender</InputLabel>
                          <Select
                            name="gender"
                            value={formData.gender}
                            label="Gender"
                            onChange={handleChange}
                            displayEmpty
                            sx={{ height: 56 }}
                          >
                            <MenuItem value="" disabled><em>Select Gender</em></MenuItem>
                            {genders.map((gender) => (
                              <MenuItem key={gender.value} value={gender.value}>
                                {gender.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required error={fieldErrors.size} size="medium">
                          <InputLabel shrink>Size</InputLabel>
                          <Select
                            name="size"
                            value={formData.size}
                            label="Size"
                            onChange={handleChange}
                            displayEmpty
                            sx={{ height: 56 }}
                          >
                            <MenuItem value="" disabled><em>Select Size</em></MenuItem>
                            {sizes.map((size) => (
                              <MenuItem key={size.value} value={size.value}>
                                {size.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    
                    {/* Preferred Date */}
                    <DatePicker
                      label="Preferred Pickup Date"
                      value={formData.preferredDate}
                      onChange={handleDateChange}
                      minDate={new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: fieldErrors.preferredDate,
                          helperText: fieldErrors.preferredDate ? "This field is required" : "",
                          size: "medium",
                          sx: { '& .MuiInputBase-root': { height: 56 } }
                        }
                      }}
                    />

                    {/* Upload Button */}
                    <Box>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="uniform-image"
                        type="file"
                        onChange={handleImageChange}
                        required
                      />
                      <label htmlFor="uniform-image">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={image ? <CheckCircle color="success" /> : <Upload />}
                          fullWidth
                          sx={{
                            py: 2,
                            height: 56,
                            borderStyle: 'dashed',
                            borderWidth: 2.5,
                            borderColor: fieldErrors.image ? 'error.main' : (image ? 'success.main' : 'primary.main'),
                            backgroundColor: image ? 'success.light' : 'transparent',
                            color: fieldErrors.image ? 'error.main' : (image ? 'success.dark' : 'primary.main'),
                            borderRadius: 3,
                            fontWeight: 'bold',
                            fontSize: '1.05rem',
                            textTransform: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                              borderColor: fieldErrors.image ? 'error.dark' : (image ? 'success.dark' : 'primary.dark'),
                              backgroundColor: image ? 'success.light' : 'primary.light',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {image ? 'Document Uploaded' : 'Upload ORF or Receipt'}
                        </Button>
                      </label>
                      {fieldErrors.image && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, ml: 1 }}>
                          * ORF or receipt is required
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Grid>

                {/* RIGHT COLUMN - Previews SIDE BY SIDE */}
                <Grid item xs={12} md={4}>
                  
                  {/* GRID FOR SIDE-BY-SIDE PREVIEWS */}
                  <Grid container spacing={3}>
                    
                    {/* Selected Uniform - LEFT */}
                    <Grid item xs={12} md={6}>
                      <Paper 
                        sx={{ 
                          p: 2.5, 
                          borderRadius: 3,
                          border: '2px solid',
                          borderColor: formData.uniform ? 'primary.main' : 'grey.300',
                          bgcolor: formData.uniform ? 'primary.light' : 'grey.50',
                          boxShadow: formData.uniform ? '0 0 15px rgba(25, 118, 210, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                          height: 280,
                          transition: 'all 0.3s ease',
                          width: 300,
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1.5 }}>
                          Selected Uniform
                        </Typography>
                        {formData.uniform && getSelectedUniformImage() ? (
                          <Box sx={{ textAlign: 'center' }}>
                            <Card sx={{ 
                              maxWidth: 140, 
                              mx: 'auto', 
                              borderRadius: 2,
                              overflow: 'hidden',
                              boxShadow: 3
                            }}>
                              <CardMedia
                                component="img"
                                height="140"
                                image={getSelectedUniformImage()}
                                alt={formData.uniform}
                                sx={{ objectFit: 'contain', bgcolor: 'white' }}
                                onError={(e) => e.target.src = '/images/default-uniform.jpg'}
                              />
                            </Card>
                            <Typography variant="caption" fontWeight="bold" color="primary.dark" sx={{ mt: 1 }}>
                              {formData.uniform}
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'text.secondary',
                            gap: 1
                          }}>
                            <Info sx={{ fontSize: 24, opacity: 0.6 }} />
                            <Typography variant="caption" textAlign="center">
                              Select uniform
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Grid>

                    {/* Document Preview - RIGHT (KATABI NG UNIFORM) */}
                    <Grid item xs={12} md={6}>
                      <Paper 
                        sx={{ 
                          p: 2.5, 
                          borderRadius: 3,
                          border: '2px solid',
                          borderColor: imagePreview ? 'success.main' : 'grey.300',
                          bgcolor: imagePreview ? 'success.light' : 'grey.50',
                          boxShadow: imagePreview ? '0 0 15px rgba(76, 175, 80, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                          height: 280,
                          transition: 'all 0.3s ease',
                          width: 300,
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold" color="success" sx={{ mb: 1.5 }}>
                         Picture of ORF
                        </Typography>
                        {imagePreview ? (
                          <Box sx={{ textAlign: 'center' }}>
                            <Card sx={{ 
                              maxWidth: 140, 
                              mx: 'auto', 
                              borderRadius: 2,
                              overflow: 'hidden',
                              boxShadow: 3
                            }}>
                              <CardMedia
                                component="img"
                                height="140"
                                image={imagePreview}
                                alt="ORF Preview"
                                sx={{ objectFit: 'contain', bgcolor: 'white' }}
                              />
                            </Card>
                            <Typography variant="caption" color="success.dark" sx={{ mt: 1, fontWeight: 'bold' }}>
                              Ready ✓
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'text.secondary',
                            gap: 1
                          }}>
                            <Upload sx={{ fontSize: 24, opacity: 0.6 }} />
                            <Typography variant="caption" textAlign="center">
                              Upload document
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Info Alert - BOTTOM */}
                  <Alert severity="info" sx={{ 
                    borderRadius: 3, 
                    p: 2, 
                    fontSize: '0.9rem', 
                    mt: 3 
                  }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Upload Requirements:
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                      • <strong>First time?</strong> Upload your <strong>ORF</strong><br/>
                      • <strong>Returning?</strong> Upload your <strong>receipt photo</strong>
                    </Typography>
                  </Alert>
                    
                </Grid>

              </Grid>

              {/* Submit Button */}
              <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    minWidth: { xs: '100%', sm: 320 },
                    py: 2,
                    height: 56,
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #0071a5 0%, #005a8c 100%)',
                    boxShadow: '0 6px 20px rgba(0,113,165,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #005a8c 0%, #004a73 100%)',
                      boxShadow: '0 8px 25px rgba(0,113,165,0.4)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      background: 'grey.400',
                      transform: 'none'
                    },
                    transition: 'all 0.3s ease',
                    textTransform: 'none'
                  }}
                >
                  {loading ? 'Submitting Request...' : 'Submit Request'}
                </Button>
              </Box>

            </Box>
          </Paper>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default RequestUniform;