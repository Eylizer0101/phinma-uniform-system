// src/pages/admin/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    cancelledRequests: 0
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Status colors and labels
  const statusColors = {
    pending: '#ffc107',
    approved: '#28a745',
    rejected: '#dc3545',
    cancelled: '#6c757d'
  };

  const statusLabels = {
    pending: '🟡 Pending',
    approved: '🟢 Approved',
    rejected: '🔴 Rejected',
    cancelled: '⚪ Cancelled'
  };

  // Size mapping
  const sizeLabels = {
    'XS': 'Extra Small',
    'S': 'Small',
    'M': 'Medium',
    'L': 'Large',
    'XL': 'Extra Large'
  };

  // Course options
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch dashboard stats
        const statsResponse = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/admin/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const statsData = await statsResponse.json();
        
        setAnalytics({
          pendingRequests: statsData.pendingRequests || 0,
          approvedRequests: statsData.approvedRequests || 0,
          rejectedRequests: statsData.rejectedRequests || 0,
          cancelledRequests: statsData.cancelledRequests || 0
        });

        // Build URL with all filters
        let requestsUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/admin/requests?limit=15';
        if (searchTerm) {
          requestsUrl += `&search=${encodeURIComponent(searchTerm)}`;
        }
        if (courseFilter) {
          requestsUrl += `&course=${encodeURIComponent(courseFilter)}`;
        }
        if (typeFilter) {
          requestsUrl += `&type=${encodeURIComponent(typeFilter)}`;
        }

        // Fetch recent requests
        const requestsResponse = await fetch(requestsUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setRequests(requestsData.requests || []);
        }

        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Error loading dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [searchTerm, courseFilter, typeFilter]);

  // Function to handle view details
  const handleViewDetails = (requestId) => {
    window.location.href = `/admin/request-details/${requestId}`;
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCourseFilter('');
    setTypeFilter('');
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
      'Food & Beverages': '/images/food-beverage-uniform.jpg',
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

  // Check if any filter is active
  const isFilterActive = searchTerm || courseFilter || typeFilter;

  // Inline styles based on AdminRequests design
  const styles = {
    dashboard: {
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      borderBottom: '2px solid #e0e0e0',
      paddingBottom: '15px'
    },
    heading: {
      color: '#3a7bd5',
      fontSize: '28px',
      fontWeight: 'bold',
      margin: 0
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
      gap: '25px',
      marginBottom: '30px'
    },
    card: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      borderRadius: '15px',
      padding: '30px 25px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e8f4fd',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)'
      }
    },
    pendingCard: {
      borderLeft: '5px solid #ffc107',
      background: 'linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%)'
    },
    approvedCard: {
      borderLeft: '5px solid #28a745',
      background: 'linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)'
    },
    rejectedCard: {
      borderLeft: '5px solid #dc3545',
      background: 'linear-gradient(135deg, #fde8e8 0%, #f8d7da 100%)'
    },
    cancelledCard: {
      borderLeft: '5px solid #6c757d',
      background: 'linear-gradient(135deg, #f0f0f0 0%, #e2e3e5 100%)'
    },
    cardIcon: {
      fontSize: '48px',
      marginBottom: '15px',
      opacity: '0.8'
    },
    cardTitle: {
      margin: '0 0 15px 0',
      fontSize: '16px',
      color: '#555',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    count: {
      fontSize: '42px',
      fontWeight: 'bold',
      margin: '15px 0',
      color: '#2c3e50',
      textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
    },
    cardText: {
      margin: '0',
      color: '#777',
      fontSize: '14px',
      fontWeight: '500'
    },
    cardDecoration: {
      position: 'absolute',
      top: '-10px',
      right: '-10px',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      opacity: '0.1'
    },
    section: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e0e0e0',
      marginBottom: '30px',
      overflow: 'hidden'
    },
    sectionHeader: {
      backgroundColor: '#3a7bd5',
      color: 'white',
      padding: '15px 20px',
      margin: 0,
      fontSize: '20px',
      fontWeight: 'bold',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    filtersContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    searchInput: {
      padding: '8px 12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      minWidth: '200px',
      outline: 'none',
      '&:focus': {
        borderColor: '#3a7bd5',
        boxShadow: '0 0 0 2px rgba(58, 123, 213, 0.2)'
      }
    },
    filterSelect: {
      padding: '8px 12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
      outline: 'none',
      minWidth: '180px',
      '&:focus': {
        borderColor: '#3a7bd5',
        boxShadow: '0 0 0 2px rgba(58, 123, 213, 0.2)'
      }
    },
    clearButton: {
      backgroundColor: 'transparent',
      border: '1px solid #dc3545',
      color: '#dc3545',
      borderRadius: '4px',
      padding: '8px 16px',
      fontSize: '14px',
      cursor: 'pointer',
      fontWeight: 'bold',
      '&:hover': {
        backgroundColor: '#dc3545',
        color: 'white'
      }
    },
    tableWrapper: {
      overflow: 'hidden'
    },
    tableContainer: {
      maxHeight: '400px',
      overflowY: 'auto',
      overflowX: 'auto',
      position: 'relative'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '1200px'
    },
    tableHeader: {
      backgroundColor: '#3a7bd5',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    tableHeaderCell: {
      padding: '12px 8px',
      textAlign: 'left',
      fontWeight: 'bold',
      color: 'white',
      fontSize: '0.85rem',
      borderBottom: 'none',
      whiteSpace: 'nowrap'
    },
    tableRow: {
      borderBottom: '1px solid #e0e0e0',
      '&:hover': {
        backgroundColor: '#f8f9fa'
      }
    },
    tableCell: {
      padding: '10px 8px',
      fontSize: '0.8rem',
      borderBottom: '1px solid #e0e0e0',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    numberBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      backgroundColor: '#3a7bd5',
      color: 'white',
      borderRadius: '4px',
      fontWeight: 'bold',
      fontSize: '0.75rem'
    },
    uniformImage: {
      width: '40px',
      height: '40px',
      objectFit: 'cover',
      borderRadius: '4px',
      border: '1px solid #e0e0e0'
    },
    sizeBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2px 8px',
      backgroundColor: '#e3f2fd',
      borderRadius: '12px',
      fontWeight: 'bold',
      color: '#1976d2',
      fontSize: '0.75rem',
      minWidth: '70px',
      height: '24px'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '12px',
      fontWeight: 'bold',
      fontSize: '0.7rem',
      textAlign: 'center',
      minWidth: '80px'
    },
    eyeButton: {
      backgroundColor: '#e3f2fd',
      border: 'none',
      borderRadius: '4px',
      padding: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#bbdefb',
        transform: 'scale(1.1)'
      }
    },
    eyeIcon: {
      width: '16px',
      height: '16px',
      color: '#1976d2'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      fontSize: '16px',
      color: '#666'
    },
    error: {
      textAlign: 'center',
      padding: '40px',
      color: '#dc3545',
      fontSize: '16px',
      backgroundColor: '#f8d7da',
      borderRadius: '5px',
      border: '1px solid #f5c6cb'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      backgroundColor: '#fafafa',
      height: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }
  };

  // Calculate if we need scrolling (more than 8 rows)
  const needsScrolling = requests.length > 8;

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.dashboard}>
          <div style={styles.header}>
            <h1 style={styles.heading}>Admin Dashboard</h1>
          </div>
          <div style={styles.loading}>Loading dashboard data...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div style={styles.dashboard}>
          <div style={styles.header}>
            <h1 style={styles.heading}>Admin Dashboard</h1>
          </div>
          <div style={styles.error}>Error: {error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.dashboard}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.heading}>Admin Dashboard</h1>
        </div>

        {/* Analytics Cards */}
        <div style={styles.cardsContainer}>
          <div style={{...styles.card, ...styles.pendingCard}}>
            <div style={{...styles.cardDecoration, backgroundColor: '#ffc107'}}></div>
            <h3 style={styles.cardTitle}>Pending Requests</h3>
            <div style={styles.count}>{analytics.pendingRequests}</div>
            <p style={styles.cardText}>Awaiting Approval</p>
          </div>

          <div style={{...styles.card, ...styles.approvedCard}}>
            <div style={{...styles.cardDecoration, backgroundColor: '#28a745'}}></div>
            <h3 style={styles.cardTitle}>Approved Requests</h3>
            <div style={styles.count}>{analytics.approvedRequests}</div>
            <p style={styles.cardText}>Successfully Approved</p>
          </div>

          <div style={{...styles.card, ...styles.rejectedCard}}>
            <div style={{...styles.cardDecoration, backgroundColor: '#dc3545'}}></div>
            <h3 style={styles.cardTitle}>Rejected Requests</h3>
            <div style={styles.count}>{analytics.rejectedRequests}</div>
            <p style={styles.cardText}>Not Approved</p>
          </div>

          <div style={{...styles.card, ...styles.cancelledCard}}>
            <div style={{...styles.cardDecoration, backgroundColor: '#6c757d'}}></div>
            <h3 style={styles.cardTitle}>Cancelled Requests</h3>
            <div style={styles.count}>{analytics.cancelledRequests}</div>
            <p style={styles.cardText}>Cancelled by Students</p>
          </div>
        </div>

        {/* Recent Requests Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span>Recent Requests</span>
            <div style={styles.filtersContainer}>
              {/* Search Filter */}
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />

              {/* Course Filter */}
              <select 
                value={courseFilter} 
                onChange={(e) => setCourseFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Courses</option>
                {courseOptions.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>

              {/* Uniform Type Filter */}
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Uniform Types</option>
                {uniformTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* Clear Filters Button */}
              {isFilterActive && (
                <button 
                  onClick={clearFilters}
                  style={styles.clearButton}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <div style={{
              ...styles.tableContainer,
              maxHeight: needsScrolling ? '600px' : 'auto'
            }}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={{...styles.tableHeaderCell, width: '50px', textAlign: 'center'}}>#</th>
                    <th style={{...styles.tableHeaderCell, width: '70px', textAlign: 'center'}}>Uniform</th>
                    <th style={{...styles.tableHeaderCell, width: '140px'}}>Student Name</th>
                    <th style={{...styles.tableHeaderCell, width: '120px'}}>Student ID</th>
                    <th style={{...styles.tableHeaderCell, width: '150px'}}>Course</th>
                    <th style={{...styles.tableHeaderCell, width: '180px'}}>Uniform Type</th>
                    <th style={{...styles.tableHeaderCell, width: '100px', textAlign: 'center'}}>Size</th>
                    <th style={{...styles.tableHeaderCell, width: '120px', textAlign: 'center'}}>Status</th>
                    <th style={{...styles.tableHeaderCell, width: '120px', textAlign: 'center'}}>Request Date</th>
                    <th style={{...styles.tableHeaderCell, width: '80px', textAlign: 'center'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length > 0 ? (
                    requests.map((request, index) => (
                      <tr key={request._id} style={styles.tableRow}>
                        {/* Number */}
                        <td style={{...styles.tableCell, textAlign: 'center'}}>
                          <span style={styles.numberBadge}>
                            {index + 1}
                          </span>
                        </td>

                        {/* Uniform Image */}
                        <td style={{...styles.tableCell, textAlign: 'center'}}>
                          <img 
                            src={getUniformImage(request)} 
                            alt={request.uniform}
                            style={styles.uniformImage}
                            onError={(e) => {
                              e.target.src = '/images/default-uniform.jpg';
                            }}
                          />
                        </td>

                        {/* Student Name */}
                        <td style={styles.tableCell}>
                          <div style={{fontWeight: 'bold', fontSize: '0.8rem', lineHeight: '1.2'}}>
                            {request.student?.fullName || 'N/A'}
                          </div>
                        </td>

                        {/* Student ID */}
                        <td style={styles.tableCell}>
                          <div style={{color: '#666', fontSize: '0.75rem', fontFamily: 'monospace', lineHeight: '1.2'}}>
                            {request.student?.studentId || 'N/A'}
                          </div>
                        </td>

                        {/* Course */}
                        <td style={styles.tableCell}>
                          <div style={{fontWeight: '500', fontSize: '0.8rem', lineHeight: '1.2'}}>
                            {request.student?.course || 'N/A'}
                          </div>
                        </td>

                        {/* Uniform Type */}
                        <td style={styles.tableCell}>
                          <div style={{fontWeight: '500', fontSize: '0.8rem', marginBottom: '4px', lineHeight: '1.2'}}>
                            {request.uniform}
                          </div>
                          {request.course && (
                            <span style={{
                              display: 'inline-block',
                              padding: '1px 6px',
                              backgroundColor: 'transparent',
                              border: '1px solid #3a7bd5',
                              borderRadius: '10px',
                              color: '#3a7bd5',
                              fontWeight: 'bold',
                              fontSize: '0.65rem'
                            }}>
                              {request.course}
                            </span>
                          )}
                        </td>

                        {/* Size */}
                        <td style={{...styles.tableCell, textAlign: 'center'}}>
                          <span style={styles.sizeBadge}>
                            {sizeLabels[request.size] || request.size}
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{...styles.tableCell, textAlign: 'center'}}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: statusColors[request.status] + '20',
                            color: statusColors[request.status],
                            border: `1px solid ${statusColors[request.status]}`
                          }}>
                            {statusLabels[request.status]}
                          </span>
                        </td>

                        {/* Request Date */}
                        <td style={{...styles.tableCell, textAlign: 'center'}}>
                          <div style={{fontWeight: '500', fontSize: '0.75rem', lineHeight: '1.2'}}>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                          <div style={{color: '#666', fontSize: '0.65rem', lineHeight: '1.2'}}>
                            {new Date(request.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </td>

                        {/* Actions - Eye Icon */}
                        <td style={{...styles.tableCell, textAlign: 'center'}}>
                          <button 
                            onClick={() => handleViewDetails(request._id)}
                            style={styles.eyeButton}
                            title="View Details"
                          >
                            {/* Eye Icon SVG */}
                            <svg 
                              style={styles.eyeIcon} 
                              fill="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" style={{...styles.tableCell, textAlign: 'center'}}>
                        <div style={styles.emptyState}>
                          <div style={{fontSize: '1rem', color: '#666', marginBottom: '8px'}}>
                            No requests found
                          </div>
                          <div style={{fontSize: '0.9rem', color: '#999'}}>
                            {isFilterActive ? 'Try changing your filters' : 'No uniform requests submitted yet'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;