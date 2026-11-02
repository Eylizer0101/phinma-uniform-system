// src/pages/admin/AdminUsers.js - ENHANCED WITH EYE ICON AND USER DETAILS
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon
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

// Course options from your User model
const courseOptions = [
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
  "BA English Language"
];

// Year level options
const yearLevelOptions = [
  "1st Year College",
  "2nd Year College", 
  "3rd Year College",
  "4th Year College"
];

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [yearLevelFilter, setYearLevelFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Use debounce for search to prevent too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, courseFilter, yearLevelFilter, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (courseFilter) params.append('course', courseFilter);
      if (yearLevelFilter) params.append('yearLevel', yearLevelFilter);
      params.append('page', page);
      params.append('limit', 10);

      const response = await axios.get(`/admin/users?${params}`);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setTotalUsers(response.data.total);
      setError('');
    } catch (error) {
      setError('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    setActionLoading(userId);
    try {
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      await axios.patch(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers(prev => prev.map(user => user._id === userId ? { ...user, status: newStatus } : user));
    } catch (error) {
      setError('Failed to update user status');
      console.error('Error updating status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setActionLoading(deleteDialog._id);
    try {
      await axios.delete(`/admin/users/${deleteDialog._id}`);
      setUsers(prev => prev.filter(user => user._id !== deleteDialog._id));
      setDeleteDialog(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete user');
      console.error('Error deleting user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handlePageChange = (event, value) => setPage(value);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCourseFilter('');
    setYearLevelFilter('');
    setPage(1);
  };

  const refreshData = () => {
    fetchUsers();
  };

  // Check if any filter is active
  const isFilterActive = searchTerm || statusFilter || courseFilter || yearLevelFilter;

  // Calculate row number based on current page
  const getRowNumber = (index) => {
    return (page - 1) * 10 + index + 1;
  };

  // Get filter description
  const getFilterDescription = () => {
    if (isFilterActive) {
      return 'Showing filtered results';
    }
    return 'Showing all users';
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
          <CircularProgress color="primary" />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3a7bd5' }}>
            User Management
          </Typography>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={refreshData}
              sx={{ 
                backgroundColor: '#e3f2fd',
                '&:hover': { backgroundColor: '#bbdefb' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
          {getFilterDescription()} • Total: {totalUsers} users
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Enhanced Filters Card - UPDATED WIDTH */}
      <Card sx={{ mb: 3, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', maxWidth: '100%' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              Filters & Search
            </Typography>
            {isFilterActive && (
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={clearFilters}
                size="small"
                sx={{ ml: 'auto', fontWeight: 'bold' }}
                startIcon={<ClearIcon />}
              >
                Clear All
              </Button>
            )}
          </Box>

          {/* FLEX LAYOUT FOR FILTERS - UPDATED WIDTHS */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Field - UPDATED WIDTH */}
            <TextField
              placeholder="Search by name, student ID, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: {xs:0,sm:300}, width: {xs:'100%',sm:'auto'}, flex: 1, maxWidth: 650 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Status Filter - UPDATED WIDTH */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="disabled">Disabled</MenuItem>
              </Select>
            </FormControl>

            {/* Course Filter - UPDATED WIDTH */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Course</InputLabel>
              <Select
                value={courseFilter}
                label="Course"
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <MenuItem value="">All Courses</MenuItem>
                {courseOptions.map((course) => (
                  <MenuItem key={course} value={course}>
                    {course}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Year Level Filter - UPDATED WIDTH */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Year Level</InputLabel>
              <Select
                value={yearLevelFilter}
                label="Year Level"
                onChange={(e) => setYearLevelFilter(e.target.value)}
              >
                <MenuItem value="">All Year Levels</MenuItem>
                {yearLevelOptions.map((yearLevel) => (
                  <MenuItem key={yearLevel} value={yearLevel}>
                    {yearLevel}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Users Table Card - UPDATED WIDTH */}
      <Card sx={{ boxShadow: 2, border: '1px solid #e0e0e0', maxWidth: '100%', overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', minHeight: '400px', overflowX: 'auto' }}>
            <Table stickyHeader sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', width: '70px', textAlign: 'center' }}>
                    #
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', minWidth: '160px' }}>
                    Student Name
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', minWidth: '130px' }}>
                    Student ID
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', minWidth: '180px' }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', minWidth: '200px' }}>
                    Course
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', minWidth: '140px' }}>
                    Year Level
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', width: '110px', textAlign: 'center' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', width: '150px', textAlign: 'center' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user._id} hover>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={getRowNumber(index)} 
                        size="small"
                        color="primary"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold" noWrap>
                        {user.fullName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'monospace' }} noWrap>
                        {user.studentId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: '500' }} noWrap>
                        {user.course}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {user.yearLevel}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip
                        label={statusLabels[user.status]}
                        color={statusColors[user.status]}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {/* Eye Icon for View Details */}
                        <Tooltip title="View User Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(user._id)}
                            color="info"
                            sx={{ 
                              backgroundColor: '#e3f2fd',
                              '&:hover': { backgroundColor: '#bbdefb' }
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>

                        {/* Status Toggle */}
                        <Tooltip title={user.status === 'active' ? 'Disable User' : 'Enable User'}>
                          <IconButton
                            size="small"
                            onClick={() => handleStatusToggle(user._id, user.status)}
                            disabled={actionLoading === user._id}
                            color={user.status === 'active' ? 'warning' : 'success'}
                            sx={{ 
                              backgroundColor: user.status === 'active' ? '#fff3e0' : '#e8f5e8',
                              '&:hover': { backgroundColor: user.status === 'active' ? '#ffe0b2' : '#c8e6c9' }
                            }}
                          >
                            {user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                          </IconButton>
                        </Tooltip>

                        {/* Delete */}
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog(user)}
                            disabled={actionLoading === user._id}
                            sx={{ 
                              backgroundColor: '#ffebee',
                              '&:hover': { backgroundColor: '#ffcdd2' }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {users.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6, backgroundColor: '#fafafa' }}>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                {isFilterActive ? 'No users match your filters' : 'No users found'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {isFilterActive ? 'Try changing your filters' : 'No users registered yet'}
              </Typography>
              {isFilterActive && (
                <Button variant="outlined" color="primary" onClick={clearFilters} sx={{ mt: 2 }}>
                  Clear All Filters
                </Button>
              )}
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, borderTop: '1px solid #e0e0e0' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={Boolean(deleteDialog)} 
        onClose={() => setDeleteDialog(null)}
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
            Are you sure you want to delete the following user?
          </Typography>
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {deleteDialog?.fullName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Student ID: {deleteDialog?.studentId}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Course: {deleteDialog?.course}
            </Typography>
          </Box>
          <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
            ⚠️ This action cannot be undone!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog(null)} 
            variant="outlined"
            sx={{ color: '#3a7bd5', borderColor: '#3a7bd5' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={actionLoading === deleteDialog?._id}
            sx={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ee5a52 0%, #ff6b6b 100%)',
              }
            }}
          >
            {actionLoading === deleteDialog?._id ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;