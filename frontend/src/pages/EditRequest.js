import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Grid,
  Stack
} from '@mui/material';
import { CloudUpload, CheckCircle, Info, Save } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const EditRequest = () => {
  const { id } = useParams();
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
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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

  // Fetch uniforms when course changes
  useEffect(() => {
    if (formData.course) {
      axios.get(`/uniform-requests/uniforms/${formData.course}`)
        .then(response => {
          setUniforms(response.data);
        })
        .catch(error => {
          console.error('Error fetching uniforms:', error);
          setUniforms([]);
        });
    } else {
      setUniforms([]);
    }
  }, [formData.course]);

  // Fetch request data
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await axios.get(`/uniform-requests/${id}`);
        const request = response.data;
        
        setFormData({
          course: request.course,
          uniform: request.uniform,
          size: request.size,
          gender: request.gender,
          preferredDate: new Date(request.preferredDate)
        });
        
        if (request.image) {
          setCurrentImage(request.image);
          setImagePreview(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${request.image}`);
        }
        
      } catch (err) {
        setError('Failed to fetch request details');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      preferredDate: date
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview
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

    // Validate preferred date
    if (!formData.preferredDate) {
      setError('Please select your preferred pickup date');
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
      
      // Only append image if a new one is selected
      if (image) {
        submitData.append('image', image);
      }

      const response = await axios.put(`/uniform-requests/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Request updated successfully!');
      
      // Redirect back to request details after 2 seconds
      setTimeout(() => {
        navigate(`/request-details/${id}`);
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedUniformImage = () => {
    const selectedUniform = uniforms.find(u => u.value === formData.uniform);
    return selectedUniform ? selectedUniform.image : null;
  };

  const isFormValid = formData.course && formData.uniform && formData.size && formData.gender && formData.preferredDate;

  if (fetchLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: "linear-gradient(180deg, #b9d9f9ff 0%, #ffffffff 100%)",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="xl" sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }} color="textSecondary">
            Loading request data...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        minHeight: '100vh',
        background: "linear-gradient(180deg, #b9d9f9ff 0%, #ffffffff 100%)",
        py: 4
      }}>
        <Container maxWidth="lg" sx={{ height: '100%' }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            {/* Header */}
            <Box textAlign="center" mb={3}>
              <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
                Edit Uniform Request
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Update your uniform request details below
              </Typography>
            </Box>

            {/* Alerts */}
            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 1 }} icon={<CheckCircle />}>
                {success}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3} alignItems="flex-start">
                
                {/* LEFT COLUMN - Form Fields */}
                <Grid item xs={12} md={8}>
                  <Stack spacing={2}>
                    
                    {/* Course */}
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel>Course *</InputLabel>
                      <Select
                        name="course"
                        value={formData.course}
                        label="Course *"
                        onChange={handleChange}
                        required
                      >
                        {courses.map((course) => (
                          <MenuItem key={course.value} value={course.value}>
                            {course.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Uniform Type */}
                    <FormControl fullWidth margin="normal" required disabled={!formData.course}>
                      <InputLabel>Uniform Type *</InputLabel>
                      <Select
                        name="uniform"
                        value={formData.uniform}
                        label="Uniform Type *"
                        onChange={handleChange}
                        required
                      >
                        <MenuItem value="" disabled>
                          {uniforms.length === 0 ? 'Select a Course first' : 'Select Uniform Type'}
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
                        <FormControl fullWidth margin="normal" required>
                          <InputLabel>Gender *</InputLabel>
                          <Select
                            name="gender"
                            value={formData.gender}
                            label="Gender *"
                            onChange={handleChange}
                            required
                          >
                            {genders.map((gender) => (
                              <MenuItem key={gender.value} value={gender.value}>
                                {gender.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal" required>
                          <InputLabel>Size *</InputLabel>
                          <Select
                            name="size"
                            value={formData.size}
                            label="Size *"
                            onChange={handleChange}
                            required
                          >
                            {sizes.map((size) => (
                              <MenuItem key={size.value} value={size.value}>
                                {size.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    
                    {/* Preferred Pickup Date */}
                    <FormControl fullWidth margin="normal" required>
                      <DatePicker
                        label="Preferred Pickup Date *"
                        value={formData.preferredDate}
                        onChange={handleDateChange}
                        renderInput={(params) => <TextField {...params} />}
                        minDate={new Date()}
                      />
                    </FormControl>

                    {/* ORF/Receipt Upload - Optional for edit */}
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="uniform-image"
                        type="file"
                        onChange={handleImageChange}
                      />
                      <label htmlFor="uniform-image">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUpload />}
                          fullWidth
                          sx={{
                            py: 1.5,
                            borderStyle: image || currentImage ? 'solid' : 'dashed',
                            borderWidth: 2,
                            borderColor: (image || currentImage) ? 'primary.main' : 'grey.400',
                            backgroundColor: (image || currentImage) ? 'primary.light' : 'transparent'
                          }}
                        >
                          {image ? 'New Document Uploaded ✓' : currentImage ? 'Change ORF/Receipt (Optional)' : 'Upload ORF or Receipt (Optional)'}
                        </Button>
                      </label>
                      
                      {/* Instructions */}
                      <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          <strong>Note:</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          • Upload a new ORF or receipt only if you want to change the current one<br/>
                          • If you don't select a new file, the current document will be kept
                        </Typography>
                      </Box>
                    </Box>

                    {/* Image Preview */}
                    {imagePreview && (
                      <Box sx={{ textAlign: 'center', mt: 2, mb: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {image ? 'New Document Preview:' : 'Current Document:'}
                        </Typography>
                        <Card sx={{ maxWidth: 300, mx: 'auto', borderRadius: 2, display: 'inline-block' }}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={imagePreview}
                            alt="ORF or Receipt preview"
                            sx={{ objectFit: 'contain' }}
                          />
                        </Card>
                      </Box>
                    )}
                  </Stack>
                </Grid>

                {/* RIGHT COLUMN - Previews */}
                <Grid item xs={12} md={4}>
                  <Stack spacing={3}>
                    
                    {/* Selected Uniform Preview */}
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
                            Select uniform type
                          </Typography>
                        </Box>
                      )}
                    </Paper>

                    {/* Document Preview */}
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
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold" color="success" sx={{ mb: 1.5 }}>
                        Document Preview
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
                              alt="Document Preview"
                              sx={{ objectFit: 'contain', bgcolor: 'white' }}
                            />
                          </Card>
                          <Typography variant="caption" color="success.dark" sx={{ mt: 1, fontWeight: 'bold' }}>
                            {image ? 'New Document ✓' : 'Current Document'}
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
                          <CloudUpload sx={{ fontSize: 24, opacity: 0.6 }} />
                          <Typography variant="caption" textAlign="center">
                            No document uploaded
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Stack>
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  onClick={() => navigate(`/request-details/${id}`)}
                  variant="outlined"
                  size="large"
                  sx={{ 
                    flex: 1,
                    py: 1.5,
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Save />}
                  sx={{ 
                    flex: 1,
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                  disabled={loading || !isFormValid}
                >
                  {loading ? 'Updating Request...' : 'Update Request'}
                </Button>
              </Box>
            </Box>

            {/* Information Box */}
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: 'primary.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.200'
            }}>
              <Box display="flex" alignItems="flex-start" gap={1}>
                <Info color="primary" sx={{ mt: 0.2 }} />
                <Box>
                  <Typography variant="body2" fontWeight="medium" color="primary.main" gutterBottom>
                    Editing Information
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • You can only edit requests with "Pending Review" status<br/>
                    • All fields except the document are required<br/>
                    • Your request will maintain its position in the review queue<br/>
                    • You'll receive a notification once your updated request is reviewed
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default EditRequest;