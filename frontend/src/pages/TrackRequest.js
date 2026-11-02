import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Stack
} from '@mui/material';
import { 
  Visibility, 
  Cancel, 
  AccessTime,
  CheckCircle,
  Cancel as CancelIcon,
  Warning,
  CalendarToday,
  Person,
  Straighten,
  LocalMall
} from '@mui/icons-material';
import axios from 'axios';

const TrackRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);
  const navigate = useNavigate();

  const statusConfig = {
    pending: { 
      color: 'warning', 
      icon: <AccessTime />, 
      label: 'Pending Review',
      bgColor: '#FFF3E0',
      textColor: '#E65100'
    },
    approved: { 
      color: 'success', 
      icon: <CheckCircle />, 
      label: 'Approved',
      bgColor: '#E8F5E8',
      textColor: '#2E7D32'
    },
    rejected: { 
      color: 'error', 
      icon: <CancelIcon />, 
      label: 'Rejected',
      bgColor: '#FFEBEE',
      textColor: '#D32F2F'
    },
    cancelled: { 
      color: 'default', 
      icon: <Warning />, 
      label: 'Cancelled',
      bgColor: '#F5F5F5',
      textColor: '#757575'
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/uniform-requests/my-requests');
      setRequests(response.data);
    } catch (err) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleViewDetails = (request) => {
    navigate(`/request-details/${request._id}`);
  };

  const handleCancelClick = (request) => {
    setRequestToCancel(request);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      await axios.patch(`/uniform-requests/${requestToCancel._id}/cancel`);
      setCancelDialogOpen(false);
      setRequestToCancel(null);
      fetchRequests(); // Refresh the list
    } catch (err) {
      setError('Failed to cancel request');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusConfig = (status) => {
    return statusConfig[status] || statusConfig.pending;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center', background: "linear-gradient(180deg, #b9d9f9ff 0%, #ffffffff 100%)", }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }} color="textSecondary">
          Loading your requests...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4, background: "linear-gradient(180deg, #b9d9f9ff 0%, #ffffffff 100%)",}}>
      {/* Header */}
      <Box textAlign="center" mb={4} >
        <Typography variant="h3" component="h1" gutterBottom color="primary" fontWeight="bold">
          Track My Requests
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Monitor the status of your uniform requests
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {requests.length === 0 ? (
      <Paper 
  elevation={3} 
  sx={{ 
    p: 6, 
    textAlign: 'center',
    borderRadius: 3,

  }}
>
  <LocalMall sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
  <Typography variant="h5" gutterBottom color="primary">
    No Uniform Requests Yet
  </Typography>
  <Typography variant="body1" color="textSecondary">
    You haven't made any uniform requests yet. Start by requesting a uniform!
  </Typography>
</Paper>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid container spacing={3} sx={{ maxWidth: '1400px' }}>
            {requests.map((request) => {
              const status = getStatusConfig(request.status);
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={request._id}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Card 
                      elevation={4} 
                      sx={{ 
                        borderRadius: 3,
                        border: `2px solid ${status.bgColor}`,
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '320px', // Fixed width for consistency
                        minHeight: '380px', // Minimum height
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 35px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      <CardContent sx={{ 
                        p: 3, 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        width: '100%'
                      }}>
                        {/* Header Section */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start', 
                          mb: 2,
                          width: '100%'
                        }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="h6" 
                              fontWeight="bold" 
                              gutterBottom 
                              sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {request.type} Uniform
                            </Typography>
                            <Chip
                              icon={status.icon}
                              label={status.label}
                              color={status.color}
                              variant="filled"
                              sx={{ 
                                fontWeight: 'bold',
                                backgroundColor: status.bgColor,
                                color: status.textColor,
                                border: `1px solid ${status.textColor}20`,
                                maxWidth: '100%'
                              }}
                              size="small"
                            />
                          </Box>
                          <Avatar sx={{ 
                            bgcolor: 'primary.main', 
                            width: 40, 
                            height: 40,
                            ml: 1,
                            flexShrink: 0
                          }}>
                            <CalendarToday />
                          </Avatar>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Details Section */}
                        <Stack spacing={1.5} sx={{ flex: 1, width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person color="action" sx={{ fontSize: 18, flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              <strong>Gender:</strong> {request.gender || 'Not specified'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Straighten color="action" sx={{ fontSize: 18, flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              <strong>Size:</strong> {request.size}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday color="action" sx={{ fontSize: 18, flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              <strong>Pickup:</strong> {request.preferredDate ? formatDateShort(request.preferredDate) : 'Not specified'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime color="action" sx={{ fontSize: 18, flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              <strong>Requested:</strong> {formatDateShort(request.createdAt)}
                            </Typography>
                          </Box>
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        {/* Action Buttons */}
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1, 
                          justifyContent: 'space-between',
                          width: '100%'
                        }}>
                          <Button
                            startIcon={<Visibility />}
                            onClick={() => handleViewDetails(request)}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              borderRadius: 2, 
                              flex: 1,
                              fontSize: '0.75rem',
                              py: 1,
                              minWidth: '120px'
                            }}
                          >
                            View Details
                          </Button>
                          
                          {request.status === 'pending' && (
                            <Button
                              startIcon={<Cancel />}
                              onClick={() => handleCancelClick(request)}
                              color="error"
                              variant="outlined"
                              size="small"
                              sx={{ 
                                borderRadius: 2, 
                                flex: 1,
                                fontSize: '0.75rem',
                                py: 1,
                                minWidth: '120px'
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <CancelIcon color="error" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Cancel Request
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" textAlign="center" sx={{ mb: 2 }}>
            Are you sure you want to cancel this uniform request?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
          <Button 
            onClick={() => setCancelDialogOpen(false)} 
            variant="outlined" 
            sx={{ borderRadius: 2, px: 4 }}
          >
            Keep Request
          </Button>
          <Button 
            onClick={handleCancelConfirm} 
            color="error" 
            variant="contained" 
            sx={{ borderRadius: 2, px: 4 }}
          >
            Cancel Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TrackRequest;