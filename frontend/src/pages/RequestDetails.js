import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Stack,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack,
  AccessTime,
  CheckCircle,
  Cancel as CancelIcon,
  Warning,
  CalendarToday,
  Person,
  Straighten,
  LocationOn,
  Description,
  ReceiptLong,
  Edit,
  Delete,
  School,
  Style
} from '@mui/icons-material';
import axios from 'axios';

const DetailItem = ({ icon: Icon, title, value, color = 'text.primary', bgcolor = 'white' }) => (
  <Box>
    <Typography variant="body2" color="textSecondary" gutterBottom>{title}</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: 1, bgcolor: bgcolor }}>
      {Icon && <Icon color="primary" />}
      <Typography variant="body1" fontWeight="medium" color={color}>{value}</Typography>
    </Box>
  </Box>
);

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const fetchRequestDetails = async () => {
    try {
      // Assuming your environment variable or a base URL is configured for axios
      const response = await axios.get(`/uniform-requests/${id}`);
      setRequest(response.data);
    } catch (err) {
      setError('Failed to fetch request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      await axios.patch(`/uniform-requests/${request._id}/cancel`);
      setCancelDialogOpen(false);
      fetchRequestDetails(); // Refresh the details
    } catch (err) {
      setError('Failed to cancel request');
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/uniform-requests/${request._id}`);
      setDeleteDialogOpen(false);
      navigate('/track-request'); // Redirect to track request page after deletion
    } catch (err) {
      setError('Failed to delete request');
    }
  };

  const handleEditClick = () => {
    navigate(`/edit-request/${request._id}`);
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

  const getStatusConfig = (status) => {
    return statusConfig[status] || statusConfig.pending;
  };

  // --- LOADING / ERROR / NOT FOUND STATES ---
  if (loading) {
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
            Loading request details...
          </Typography>
        </Container>
      </Box>
    );
  }

  if (error || !request) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: "linear-gradient(180deg, #b9d9f9ff 0%, #ffffffff 100%)",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="xl">
          <Alert severity={error ? "error" : "warning"} sx={{ mb: 3, borderRadius: 2 }}>
            {error || 'Request not found'}
          </Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/track-request')}>
            Back to Requests
          </Button>
        </Container>
      </Box>
    );
  }
  // --- END LOADING / ERROR / NOT FOUND STATES ---

  const status = getStatusConfig(request.status);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: "linear-gradient(180deg, #b9d9f9ff 0%, #ffffffff 100%)",
      py: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/track-request')}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Back to Requests
          </Button>
        </Box>

        {/* Main Card */}
        <Card elevation={8} sx={{
          borderRadius: 4,
          overflow: 'hidden',
          background: 'white',
          position: 'relative'
        }}>
          {/* Header Section */}
          <Box sx={{
            background: 'linear-gradient(135deg, #0071a5 0%, #5397dfff 100%)',
            color: 'white',
            p: 3,
            textAlign: 'center'
          }}>
            <Avatar sx={{
              width: 70,
              height: 70,
              mx: 'auto',
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.2)'
            }}>
              <ReceiptLong sx={{ fontSize: 35 }} />
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Uniform Request 
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                icon={status.icon}
                label={status.label}
                color={status.color}
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  py: 1.5,
                  px: 2,
                  bgcolor: status.bgColor,
                  color: status.textColor,
                }}
              />
            </Box>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              {/* Left Column: Uniform and ORF/Receipt Image */}
              <Grid item xs={12} md={5}>
                <Stack spacing={3}>
                  {/* Uniform Image and Details */}
                  {request.uniformImage && (
                    <Box sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: 'grey.50', textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                        Requested Uniform
                      </Typography>
                      <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'white',
                        boxShadow: 1
                      }}>
                        <img
                          src={request.uniformImage}
                          alt={request.uniform || request.type}
                          style={{
                            width: '100%',
                            maxWidth: '300px',
                            maxHeight: '250px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            display: 'block',
                            margin: '0 auto'
                          }}
                          onError={(e) => {
                            e.target.src = '/images/default-uniform.jpg';
                          }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ mt: 2 }} fontWeight="medium">
                        {request.uniform || request.type}
                      </Typography>
                      {request.course && (
                        <Typography variant="body1" color="textSecondary">
                          {request.course}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Uploaded ORF/Receipt Image */}
                  {request.image && (
                    <Box sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: 'grey.50', textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                        Uploaded ORF/Receipt
                      </Typography>
                      <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'white',
                        boxShadow: 1
                      }}>
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${request.image}`}
                          alt="ORF or Receipt"
                          style={{
                            width: '100%',
                            maxWidth: '350px',
                            maxHeight: '300px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            display: 'block',
                            margin: '0 auto'
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Grid>

              {/* Right Column: Request Information and Timeline */}
              <Grid item xs={12} md={7}>
                <Stack spacing={3}>
                  {/* Request Information Block */}
                  <Box sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="h5" gutterBottom color="text.primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <Description color="primary" />
                      Request Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <DetailItem
                          icon={School}
                          title="Course"
                          value={request.course || 'N/A'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DetailItem
                          icon={Style}
                          title="Uniform Type"
                          value={request.uniform || (request.type ? `${request.type} Uniform` : 'N/A')}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DetailItem
                          icon={Person}
                          title="Gender"
                          value={request.gender || 'Not specified'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DetailItem
                          icon={Straighten}
                          title="Size"
                          value={request.size || 'N/A'}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Timeline and Dates Block */}
                  <Box sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="h5" gutterBottom color="text.primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <CalendarToday color="primary" />
                      Timeline & Pickup
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <DetailItem
                          icon={CalendarToday}
                          title="Request Date"
                          value={formatDate(request.createdAt)}
                          color="text.primary"
                          bgcolor="grey.50"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DetailItem
                          icon={CalendarToday}
                          title="Preferred Pickup Date"
                          value={request.preferredDate ? formatDate(request.preferredDate) : 'Not specified'}
                          color="text.primary"
                          bgcolor="grey.50"
                        />
                      </Grid>

                      {request.approvedAt && (
                        <Grid item xs={12} sm={6}>
                          <DetailItem
                            icon={CheckCircle}
                            title="Approved Date"
                            value={formatDate(request.approvedAt)}
                            color="success.dark"
                            bgcolor="#E8F5E8"
                          />
                        </Grid>
                      )}
                      {request.pickupLocation && request.status === 'approved' && (
                        <Grid item xs={12} sm={6}>
                          <DetailItem
                            icon={LocationOn}
                            title="Pickup Location"
                            value={request.pickupLocation}
                            color="info.dark"
                            bgcolor="#E3F2FD"
                          />
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  {/* Admin Notes */}
                  {request.adminNotes && (
                    <Alert severity={request.status === 'rejected' ? 'error' : 'info'} sx={{ borderRadius: 2, mt: 3, p: 2 }}>
                      <Typography variant="body1" fontWeight="bold" gutterBottom>
                        Admin Notes / Reason for Status:
                      </Typography>
                      <Typography variant="body1">
                        {request.adminNotes}
                      </Typography>
                    </Alert>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>

          <Divider />

          {/* Action Buttons - Bottom Right */}
          <Box sx={{
            p: 3,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2
          }}>
            {request.status === 'pending' && (
              <>
                <Button
                  startIcon={<Edit />}
                  onClick={handleEditClick}
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1
                  }}
                >
                  Edit Request
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={handleCancelClick}
                  color="error"
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1
                  }}
                >
                  Cancel Request
                </Button>
              </>
            )}
            {/* Delete Button - Always visible, but maybe reconsider in a real app if it should always be visible */}
            <Button
              startIcon={<Delete />}
              onClick={handleDeleteClick}
              color="error"
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1
              }}
            >
              Delete Request
            </Button>
          </Box>
        </Card>

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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: 'center' }}>
            <Delete color="error" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              Delete Request
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" textAlign="center" sx={{ mb: 2 }}>
              Are you sure you want to permanently delete this uniform request?
            </Typography>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              This action cannot be undone. The request will be permanently removed from the database.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              sx={{ borderRadius: 2, px: 4 }}
            >
              Keep Request
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              sx={{ borderRadius: 2, px: 4 }}
            >
              Delete Permanently
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default RequestDetails;