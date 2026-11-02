// src/pages/admin/Archive.js - COMPACT VERSION
import React, { useState, useEffect } from 'react';
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
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Button,
  TextField,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { 
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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

// Uniform types for filter
const uniformTypes = [
  "Academic Uniform",
  "P.E. Uniform", 
  "NSTP / ROTC / CAP",
  "Chef Uniform",
  "Business Attire",
  "2nd Year – Business Attire",
  "3rd to 4th Year – Corporate Attire",
  "Corporate Attire",
  "2nd Year – School Uniform & Sun Uniform",
  "3rd Year – P.T. Uniform",
  "2nd Year – Type A Uniform",
  "3rd Year – Type D Uniform",
  "4th Year – Type B Uniform",
  "2nd Year – Flight Attendant Uniform"
];

const Archive = () => {
  const [archivedRequests, setArchivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const navigate = useNavigate();

  // Debounce search term to prevent too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce effect for search - FIXED
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Main effect for fetching data - FIXED DEPENDENCIES
  useEffect(() => {
    fetchArchivedRequests();
  }, [statusFilter, typeFilter, debouncedSearchTerm, sizeFilter, courseFilter, page]);

  const fetchArchivedRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // AUTO-FILTER: Archive only shows approved, rejected, cancelled
      if (!statusFilter) {
        params.append('status', 'approved,rejected,cancelled');
      } else {
        params.append('status', statusFilter);
      }
      
      if (typeFilter) params.append('type', typeFilter);
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (sizeFilter) params.append('size', sizeFilter);
      if (courseFilter) params.append('course', courseFilter);
      params.append('page', page);
      params.append('limit', 10);

      const response = await axios.get(`/admin/requests?${params}`);
      setArchivedRequests(response.data.requests);
      setTotalPages(response.data.totalPages);
      setTotalRequests(response.data.total);
      setError('');
    } catch (error) {
      setError('Failed to load archived requests');
      console.error('Error fetching archived requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (requestId) => {
    navigate(`/admin/archive-details/${requestId}`);
  };

  const handleDeleteItem = async (requestId) => {
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      try {
        await axios.delete(`/admin/requests/${requestId}`);
        fetchArchivedRequests(); // Refresh the list
      } catch (error) {
        setError('Failed to delete item');
        console.error('Error deleting request:', error);
      }
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setTypeFilter('');
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSizeFilter('');
    setCourseFilter('');
    setPage(1);
  };

  const refreshData = () => {
    fetchArchivedRequests();
  };

  // Handle search with enter key
  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }
  };

  // Check if any filter is active
  const isFilterActive = statusFilter || typeFilter || searchTerm || sizeFilter || courseFilter;

  // Function to get uniform image based on course and uniform type
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

  // Calculate row number based on current page
  const getRowNumber = (index) => {
    return (page - 1) * 10 + index + 1;
  };

  // Get filter description
  const getFilterDescription = () => {
    if (isFilterActive) {
      return 'Showing filtered archived results';
    }
    return 'Showing all archived requests';
  };

  if (loading && archivedRequests.length === 0) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
          <CircularProgress />
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
            Archive
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
          {getFilterDescription()} • Total: {totalRequests} archived requests
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Enhanced Filters Card */}
      <Card sx={{ mb: 3, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
        <CardContent>
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

          {/* COMPACT FLEX LAYOUT FOR FILTERS */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Field - COMPACT */}
            <TextField
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              size="small"
              sx={{ minWidth: { xs: 0, sm: 450 }, width: { xs: '100%', sm: 'auto' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchTerm('');
                        setDebouncedSearchTerm('');
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Status Filter - COMPACT */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Archived</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            {/* Uniform Type Filter - COMPACT */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Uniform Type</InputLabel>
              <Select
                value={typeFilter}
                label="Uniform Type"
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                {uniformTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Size Filter - COMPACT */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Size</InputLabel>
              <Select
                value={sizeFilter}
                label="Size"
                onChange={(e) => {
                  setSizeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="XS">XS</MenuItem>
                <MenuItem value="S">S</MenuItem>
                <MenuItem value="M">M</MenuItem>
                <MenuItem value="L">L</MenuItem>
                <MenuItem value="XL">XL</MenuItem>
              </Select>
            </FormControl>

            {/* Course Filter - COMPACT */}
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Course</InputLabel>
              <Select
                value={courseFilter}
                label="Course"
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Courses</MenuItem>
                {courseOptions.map((course) => (
                  <MenuItem key={course} value={course}>
                    {course}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Search Status Indicator */}
          {debouncedSearchTerm && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" color="primary" sx={{ fontStyle: 'italic' }}>
                Searching for: "{debouncedSearchTerm}"
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* COMPACT Archived Requests Table */}
      <Card sx={{ boxShadow: 2, border: '1px solid #e0e0e0' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', minHeight: '400px', overflowX: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', width: '50px', textAlign: 'center', py: 1 }}>
                    #
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', width: '60px', textAlign: 'center', py: 1 }}>
                    Uniform
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', width: '150px', py: 1 }}>
                    Student Name
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', width: '120px', py: 1 }}>
                    Student ID
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', width: '180px', py: 1 }}>
                    Course
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', width: '160px', py: 1 }}>
                    Uniform Type
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', width: '70px', textAlign: 'center', py: 1 }}>
                    Size
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', width: '100px', textAlign: 'center', py: 1 }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', width: '100px', textAlign: 'center', py: 1 }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#3a7bd5', color: 'white', fontWeight: 'bold', width: '90px', textAlign: 'center', py: 1 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {archivedRequests.map((request, index) => (
                  <TableRow key={request._id} hover sx={{ '& > td': { py: 1 } }}>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={getRowNumber(index)} 
                        size="small"
                        color="primary"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <img 
                        src={getUniformImage(request)} 
                        alt={request.uniform}
                        style={{
                          width: '35px',
                          height: '35px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #e0e0e0'
                        }}
                        onError={(e) => {
                          e.target.src = '/images/default-uniform.jpg';
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" noWrap>
                        {request.student?.fullName || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'monospace' }} noWrap>
                        {request.student?.studentId || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: '500' }} noWrap>
                        {request.student?.course || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: '500' }} noWrap>
                          {request.uniform}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={request.size} 
                        color="secondary"
                        variant="filled"
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={statusLabels[request.status]} 
                        color={statusColors[request.status]}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: '500' }}>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleViewDetails(request._id)}
                            sx={{ 
                              backgroundColor: '#e3f2fd',
                              '&:hover': { backgroundColor: '#bbdefb' }
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Permanently">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteItem(request._id)}
                            sx={{ 
                              backgroundColor: '#ffebee',
                              '&:hover': { backgroundColor: '#ffcdd2' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {archivedRequests.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6, backgroundColor: '#fafafa' }}>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                {isFilterActive ? 'No archived requests match your filters' : 'No archived requests found'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {isFilterActive ? 'Try changing your filters' : 'Approved, rejected, and cancelled requests will appear here automatically'}
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
                size="small"
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Archive;