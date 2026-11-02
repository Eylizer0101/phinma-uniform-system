// src/pages/admin/AdminUserDetails.js - USER DETAILS PAGE
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const statusColors = {
  active: 'success',
  disabled: 'error'
};

const statusLabels = {
  active: '🟢 Active',
  disabled: '🔴 Disabled'
};

const verificationLabels = {
  true: '✅ Verified',
  false: '❌ Not Verified'
};

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`/admin/users/${id}`);
      setUser(response.data.user);
    } catch (error) {
      setError('Failed to load user details');
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    setActionLoading(true);
    try {
      const newStatus = user.status === 'active' ? 'disabled' : 'active';
      await axios.patch(`/admin/users/${id}/status`, { status: newStatus });
      setUser(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      setError('Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`/admin/users/${id}`);
      setDeleteDialog(false);
      navigate('/admin/users');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete user');
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (!user) {
    return (
      <AdminLayout>
        <Alert severity="error">User not found</Alert>
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
            onClick={() => navigate('/admin/users')}
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
            Back to Users
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            User Details
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={statusLabels[user.status]} 
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
            <Chip 
              label={verificationLabels[user.isVerified]} 
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
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Grid container spacing={3}>
        
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ 
            p: 4, 
            height: '100%', 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
            border: '1px solid #e0e0e0'
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
              Personal Information
            </Typography>
            <Divider sx={{ mb: 3, borderColor: '#c5cae9' }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                  FULL NAME
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: '600', mt: 1, color: '#1a237e' }}>
                  {user.fullName}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                  STUDENT ID
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: '600', mt: 1, color: '#1a237e' }}>
                  {user.studentId}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                  EMAIL ADDRESS
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: '500', mt: 1, fontSize: '1.1rem', color: '#1a237e' }}>
                  {user.email}
                </Typography>
              </Box>

              {user.contactNumber && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    CONTACT NUMBER
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: '500', mt: 1, fontSize: '1.1rem', color: '#1a237e' }}>
                    {user.contactNumber}
                  </Typography>
                </Box>
              )}

              {user.address && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    ADDRESS
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: '500', mt: 1, fontSize: '1rem', color: '#1a237e' }}>
                    {user.address}
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Academic Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ 
            p: 4, 
            height: '100%', 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
            border: '1px solid #e0e0e0'
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
                  {user.course}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                  YEAR LEVEL
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: '600', mt: 1, color: '#1a237e' }}>
                  {user.yearLevel}
                </Typography>
              </Box>
              
            
            </Box>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12}>
          <Card elevation={3} sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
            border: '1px solid #e0e0e0'
          }}>
            <Typography variant="h5" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              color: '#1a237e', 
              mb: 3,
              fontWeight: 'bold'
            }}>
              <SecurityIcon color="primary" />
              Account Information
            </Typography>
            <Divider sx={{ mb: 3, borderColor: '#c5cae9' }} />
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                      ACCOUNT STATUS
                    </Typography>
                    <Chip
                      label={statusLabels[user.status]}
                      color={statusColors[user.status]}
                      sx={{ mt: 1, fontWeight: 'bold' }}
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                      EMAIL VERIFICATION
                    </Typography>
                    <Chip
                      label={verificationLabels[user.isVerified]}
                      color={user.isVerified ? 'success' : 'warning'}
                      sx={{ mt: 1, fontWeight: 'bold' }}
                    />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                      MEMBER SINCE
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: '500' }}>
                      {formatDate(user.createdAt)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                      LAST UPDATED
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: '500' }}>
                      {formatDate(user.updatedAt)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Action Buttons Card */}
        <Grid item xs={12}>
          <Card elevation={4} sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
            border: '1px solid #e0e0e0'
          }}>
            <Typography variant="h5" gutterBottom sx={{ 
              color: '#1a237e', 
              mb: 3,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <SecurityIcon />
              User Actions
            </Typography>

            <Divider sx={{ mb: 4, borderColor: '#c5cae9' }} />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color={user.status === 'active' ? 'warning' : 'success'}
                startIcon={user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                onClick={handleStatusToggle}
                disabled={actionLoading}
                size="large"
                sx={{ 
                  minWidth: '200px',
                  height: '50px',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                {actionLoading ? 'Processing...' : user.status === 'active' ? 'Disable User' : 'Enable User'}
              </Button>

              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialog(true)}
                disabled={actionLoading}
                size="large"
                sx={{ 
                  minWidth: '200px',
                  height: '50px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ee5a52 0%, #ff6b6b 100%)',
                  }
                }}
              >
                Delete User
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#3a7bd5', 
          color: 'white',
          fontWeight: 'bold'
        }}>
          Confirm User Deletion
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this user?
          </Typography>
          <Paper sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {user.fullName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Student ID: {user.studentId}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Email: {user.email}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Course: {user.course}
            </Typography>
          </Paper>
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              ⚠️ Warning: This action cannot be undone! All user data and requests will be permanently deleted.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog(false)}
            variant="outlined"
            sx={{ color: '#3a7bd5', borderColor: '#3a7bd5' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={actionLoading}
            sx={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ee5a52 0%, #ff6b6b 100%)',
              }
            }}
          >
            {actionLoading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUserDetails;