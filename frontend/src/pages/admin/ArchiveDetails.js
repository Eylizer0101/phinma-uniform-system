// src/pages/admin/ArchiveDetails.js - UPDATED WITH RESTORE BUTTON
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as RequestIcon,
  CalendarToday as DateIcon,
  Straighten as SizeIcon,
  LocationOn as LocationIcon,
  Style as UniformIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const statusColors = {
  approved: 'success',
  rejected: 'error',
  cancelled: 'default'
};

const statusLabels = {
  approved: '🟢 Approved',
  rejected: '🔴 Rejected',
  cancelled: '⚪ Cancelled'
};

// Size mapping to full text
const sizeLabels = {
  'XS': 'Extra Small',
  'S': 'Small',
  'M': 'Medium',
  'L': 'Large',
  'XL': 'Extra Large'
};

const ArchiveDetails = () => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const response = await axios.get(`/admin/requests/${id}`);
      setRequest(response.data.request);
    } catch (error) {
      setError('Failed to load request details');
      console.error('Error fetching request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`/admin/requests/${id}`);
      
      // Show success message
      setError('');
      
      // Navigate back to archive page after successful deletion
      navigate('/admin/archive');
      
    } catch (error) {
      setError('Failed to delete request');
      console.error('Error deleting request:', error);
    } finally {
      setDeleteLoading(false);
      setDeleteDialog(false);
    }
  };

  const handleRestoreRequest = async () => {
    setRestoreLoading(true);
    try {
      await axios.patch(`/admin/requests/${id}/restore`);
      
      // Show success message
      setError('');
      
      // Navigate back to requests page after successful restoration
      navigate('/admin/requests');
      
    } catch (error) {
      setError('Failed to restore request');
      console.error('Error restoring request:', error);
    } finally {
      setRestoreLoading(false);
      setRestoreDialog(false);
    }
  };

  // Function to get uniform image
  const getUniformImage = (request) => {
    if (!request.course || !request.uniform) {
      return '/images/default-uniform.jpg';
    }

    const uniformImages = {
      'Academic Uniform': '/images/academic-uniform.jpg',
      'P.E. Uniform': '/images/pe-uniform.jpg',
      'NSTP / ROTC / CAP': '/images/nstp-uniform.jpg',
      'Chef Uniform': '/images/chef-uniform.jpg',
      'Business Attire': '/images/business-attire.jpg',
      '2nd Year – Business Attire': '/images/business-attire.jpg',
      '3rd to 4th Year – Corporate Attire': '/images/corporate-attire.jpg',
      'Corporate Attire': '/images/corporate-attire.jpg',
      '2nd Year – School Uniform & Sun Uniform': '/images/school-uniform.jpg',
      '3rd Year – P.T. Uniform': '/images/pt-uniform.jpg',
      '2nd Year – Type A Uniform': '/images/type-a-uniform.jpg',
      '3rd Year – Type D Uniform': '/images/type-d-uniform.jpg',
      '4th Year – Type B Uniform': '/images/type-b-uniform.jpg',
      '2nd Year – Flight Attendant Uniform': '/images/flight-attendant-uniform.jpg'
    };

    return uniformImages[request.uniform] || '/images/default-uniform.jpg';
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (!request) {
    return (
      <AdminLayout>
        <Alert severity="error">Request not found</Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header with Gradient */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #4cc9f0 0%, #3a7bd5 100%)',
        color: 'white',
        p: 4,
        borderRadius: 3,
        mb: 4,
        boxShadow: '0 8px 32px rgba(58, 123, 213, 0.3)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/admin/archive')}
            variant="outlined"
            sx={{ 
              height: '45px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderColor: 'white'
              }
            }}
          >
            Back to Archive
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            Archive Details
          </Typography>
          <Chip 
            label={statusLabels[request.status]} 
            sx={{ 
              fontSize: '1rem', 
              fontWeight: 'bold', 
              px: 2,
              height: '45px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Box sx={{ minHeight: '70vh' }}>
        <Grid container spacing={3}>
          
          {/* Student Information */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ 
              p: 6, 
              height: '100%', 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
              border: '1px solid #e0e0e0',
              marginLeft: '110px',
              width: '95%',
              maxWidth: 'none'
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                color: '#1a237e', 
                mb: 3,
                fontWeight: 'bold'
              }}>
                <PersonIcon color="primary" />
                Student Information
              </Typography>
              <Divider sx={{ mb: 3, borderColor: '#c5cae9' }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    FULL NAME
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: '600', mt: 1, color: '#1a237e' }}>
                    {request.student?.fullName || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    STUDENT ID
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: '600', mt: 1, color: '#1a237e' }}>
                    {request.student?.studentId || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    EMAIL
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: '500', mt: 1, fontSize: '1.1rem', color: '#1a237e' }}>
                    {request.student?.email || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Academic Information */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ 
              p: 6, 
              height: '100%', 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
              border: '1px solid #e0e0e0',
              marginLeft: '85px',
              width: '101%',
              maxWidth: 'none'
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                color: '#1a237e', 
                mb: 3,
                fontWeight: 'bold'
              }}>
                <SchoolIcon color="primary" />
                Academic Information
              </Typography>
              <Divider sx={{ mb: 3, borderColor: '#c5cae9' }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    COURSE
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: '600', mt: 1, color: '#1a237e' }}>
                    {request.student?.course || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    YEAR LEVEL
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: '600', mt: 1, color: '#1a237e' }}>
                    {request.student?.yearLevel || 'N/A'}
                  </Typography>
                </Box>
                
                {request.student?.contactNumber && (
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      CONTACT NUMBER
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: '500', mt: 1, fontSize: '1.1rem', color: '#1a237e' }}>
                      {request.student.contactNumber}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Uniform Image and Details */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ 
              p: 4, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
              border: '1px solid #e0e0e0',
              marginLeft: '110px'
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                color: '#1a237e', 
                fontWeight: 'bold',
                mb: 3
              }}>
                <UniformIcon color="primary" sx={{ fontSize: 30 }} />
                Uniform Request
              </Typography>

              <Divider sx={{ mb: 4, borderColor: '#c5cae9' }} />

              <Grid container spacing={3} alignItems="center">
                {/* Uniform Image */}
                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                  <Card sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(58, 123, 213, 0.2)',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                        Requested Uniform
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        alignItems: 'center',
                        mt: 2
                      }}>
                        <img 
                          src={getUniformImage(request)} 
                          alt={request.uniform || request.type}
                          style={{
                            width: '200px',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '12px',
                            border: '3px solid #3a7bd5'
                          }}
                          onError={(e) => {
                            e.target.src = '/images/default-uniform.jpg';
                          }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', color: '#1a237e' }}>
                        {request.uniform || request.type}
                      </Typography>
                      {request.course && (
                        <Chip 
                          label={request.course} 
                          color="primary" 
                          variant="filled"
                          sx={{ 
                            mt: 1,
                            fontWeight: 'bold',
                            backgroundColor: '#3a7bd5'
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Request Details */}
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    {[
                      {
                        icon: <RequestIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />,
                        title: 'UNIFORM TYPE',
                        value: request.uniform || request.type,
                        color: 'primary',
                        bg: '#e3f2fd'
                      },
                      {
                        icon: <SizeIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />,
                        title: 'SIZE',
                        value: sizeLabels[request.size] || request.size,
                        color: 'secondary',
                        bg: '#f3e5f5'
                      },
                      {
                        icon: <PersonIcon color="info" sx={{ fontSize: 40, mb: 1 }} />,
                        title: 'GENDER',
                        value: request.gender,
                        color: 'info',
                        bg: '#e8f5e9'
                      },
                      {
                        icon: <DateIcon color="success" sx={{ fontSize: 40, mb: 1 }} />,
                        title: 'PREFERRED DATE',
                        value: new Date(request.preferredDate).toLocaleDateString(),
                        color: 'success',
                        bg: '#fff3e0'
                      }
                    ].map((card, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box
                          textAlign="center"
                          sx={{
                            p: 3,
                            backgroundColor: card.bg,
                            borderRadius: 3,
                            height: '140px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: '0.3s',
                            '&:hover': { 
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          {card.icon}
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" sx={{ fontSize: '0.8rem' }}>
                            {card.title}
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={`${card.color}.main`}
                            sx={{ mt: 0.5, fontSize: '1rem' }}
                          >
                            {card.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>

              {/* Additional Information */}
              <Box sx={{ 
                mt: 4,
                p: 3,
                backgroundColor: '#f8f9fa',
                borderRadius: 3,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2,
                  color: '#424242'
                }}>
                  <LocationIcon color="action" sx={{ fontSize: 26 }} />
                  Additional Information
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                    <strong>Pickup Location:</strong> {request.pickupLocation}
                  </Typography>

                  <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                    <strong>Request Date:</strong> {new Date(request.createdAt).toLocaleString()}
                  </Typography>

                  {request.approvedAt && (
                    <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                      <strong>Approved Date:</strong> {new Date(request.approvedAt).toLocaleString()}
                    </Typography>
                  )}

                  {request.rejectedAt && (
                    <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                      <strong>Rejected Date:</strong> {new Date(request.rejectedAt).toLocaleString()}
                    </Typography>
                  )}

                  {request.cancelledAt && (
                    <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                      <strong>Cancelled Date:</strong> {new Date(request.cancelledAt).toLocaleString()}
                    </Typography>
                  )}

                  {request.adminNotes && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        Admin Notes:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: 'italic',
                          mt: 0.5,
                          fontSize: '1rem',
                          color: '#616161',
                        }}
                      >
                        {request.adminNotes}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Archive Actions Section */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Card elevation={4} sx={{ 
                width: '100%', 
                maxWidth: '1400px',
                minWidth: '960px',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
                border: '1px solid #e0e0e0',
                marginLeft: '110px',
                mt: 2
              }}>
                <CardContent sx={{ p: 4 }}>
                  {/* Header */}
                  <Box sx={{ mb: 4 }}>
                    <SecurityIcon sx={{ fontSize: 50, color: '#1a237e', mb: 2 }} />
                    <Typography variant="h4" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                      Archive Actions
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ fontSize: '1.1rem' }}>
                      Manage this archived request
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 4, borderColor: '#c5cae9' }} />

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<RestoreIcon />}
                      onClick={() => setRestoreDialog(true)}
                      size="large"
                      sx={{ 
                        minWidth: '200px', 
                        height: '50px', 
                        fontSize: '1.1rem',
                        background: 'linear-gradient(135deg, #4cc9f0 0%, #3a7bd5 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #3a7bd5 0%, #4cc9f0 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(58, 123, 213, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Restore Request
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteDialog(true)}
                      size="large"
                      sx={{ 
                        minWidth: '200px', 
                        height: '50px', 
                        fontSize: '1.1rem',
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #ee5a52 0%, #ff6b6b 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(238, 90, 82, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Delete Request
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Restore Confirmation Dialog */}
      <Dialog
        open={restoreDialog}
        onClose={() => setRestoreDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#3a7bd5', 
          color: 'white',
          fontWeight: 'bold'
        }}>
          Restore Request
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to restore this request to pending status?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            The request will be moved back to the main Requests page with pending status.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRestoreDialog(false)}
            disabled={restoreLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRestoreRequest}
            color="primary"
            disabled={restoreLoading}
            variant="contained"
          >
            {restoreLoading ? 'Restoring...' : 'Restore to Pending'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#d32f2f', 
          color: 'white',
          fontWeight: 'bold'
        }}>
          Delete Request
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to permanently delete this request?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. The request will be permanently removed from the archive.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteRequest}
            color="error"
            disabled={deleteLoading}
            variant="contained"
          >
            {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default ArchiveDetails;