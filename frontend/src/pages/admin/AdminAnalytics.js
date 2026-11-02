// src/pages/admin/AdminAnalytics.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Chip,
  alpha,
  useTheme,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Collapse
} from '@mui/material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import {
  TrendingUp,
  People,
  Assignment,
  Schedule,
  CheckCircle,
  Cancel,
  Pending,
  Analytics as AnalyticsIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart,
  TableChart,
  InsertChart,
  Assessment,
  DonutLarge,
  Group,
  Report,
  Category,
  Person,
  FilterList,
  DateRange,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';

// Enhanced color schemes
const STATUS_COLORS = {
  pending: '#FFC107',
  approved: '#28A745',
  rejected: '#DC3545',
  cancelled: '#6C757D',
  processing: '#17A2B8'
};

const GRADIENT_COLORS = {
  primary: ['#1976d2', '#42a5f5'],
  success: ['#2e7d32', '#4caf50'],
  warning: ['#ed6c02', '#ff9800'],
  info: ['#0288d1', '#29b6f6'],
  secondary: ['#7b1fa2', '#9c27b0']
};

const COURSE_COLORS = ['#1976d2', '#42a5f5', '#0288d1', '#0296d1', '#02a1d1', '#02abd1', '#02b6d1', '#02c0d1', '#02cbd1', '#02d5d1'];

// Actual courses from your User model
const ACTUAL_COURSES = [
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

// Actual uniform types from your uniformData
const ACTUAL_UNIFORM_TYPES = [
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
  "Flight Attendant Uniform"
];

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChart, setActiveChart] = useState('status');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    startDate: '',
    endDate: '',
    status: 'all',
    course: 'all',
    uniformType: 'all',
    gender: 'all',
    size: 'all'
  });
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters from filters
      const queryParams = new URLSearchParams();
      if (filters.dateRange !== 'all') queryParams.append('dateRange', filters.dateRange);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.course !== 'all') queryParams.append('course', filters.course);
      if (filters.uniformType !== 'all') queryParams.append('uniformType', filters.uniformType);
      if (filters.gender !== 'all') queryParams.append('gender', filters.gender);
      if (filters.size !== 'all') queryParams.append('size', filters.size);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/analytics?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError('Error loading analytics data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      startDate: '',
      endDate: '',
      status: 'all',
      course: 'all',
      uniformType: 'all',
      gender: 'all',
      size: 'all'
    });
  };

  // FIXED FUNCTION: Generate predictive data based on historical trends
  const generatePredictiveData = (historicalData) => {
    if (!historicalData || historicalData.length === 0) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Get actual data with requests > 0
    const actualData = historicalData.filter(item => item.requests > 0);
    
    // If no actual data, return original data
    if (actualData.length === 0) return historicalData;
    
    // Calculate average of actual data
    const totalRequests = actualData.reduce((sum, item) => sum + item.requests, 0);
    const averageRequests = Math.round(totalRequests / actualData.length);
    
    // Use the last actual data point as base
    const lastActualIndex = historicalData.findIndex(item => 
      item.requests > 0 && historicalData.indexOf(item) <= currentMonth
    );
    
    if (lastActualIndex === -1) return historicalData;
    
    const predictiveData = [...historicalData];
    let lastValue = historicalData[lastActualIndex].requests;
    
    // Generate predictions for future months
    for (let i = lastActualIndex + 1; i < historicalData.length; i++) {
      // Simple prediction: slight growth from last value or use average
      const growthFactor = 1.1; // 10% growth
      const predictedValue = Math.max(1, Math.round(
        lastValue * growthFactor + (Math.random() * 2 - 1)
      ));
      
      predictiveData[i] = {
        ...predictiveData[i],
        requests: predictedValue,
        predicted: true,
        actual: lastValue
      };
      
      lastValue = predictedValue;
    }
    
    return predictiveData;
  };

  // Format data for charts - REAL DATA
  const formatStatusData = (data) => {
    if (!data) return [];
    return data.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
      color: STATUS_COLORS[item._id] || '#8884d8'
    }));
  };

  const formatCourseData = (data) => {
    if (!data) return [];
    return data.map((item, index) => ({
      name: item._id,
      requests: item.count,
      fill: COURSE_COLORS[index % COURSE_COLORS.length]
    }));
  };

  const formatMonthlyData = (data) => {
    if (!data) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Create complete year data with all months
    const completeData = [];
    
    for (let month = 0; month < 12; month++) {
      const monthData = data.find(item => 
        item._id.month === month + 1 && item._id.year === currentYear
      );
      
      completeData.push({
        month: months[month],
        requests: monthData ? monthData.count : 0,
        predicted: month > currentMonth,
        actual: monthData ? monthData.count : 0
      });
    }
    
    return completeData;
  };

  // Calculate total requests from real data
  const getTotalRequests = () => {
    if (!analytics || !analytics.statusDistribution) return 0;
    return analytics.statusDistribution.reduce((total, item) => total + item.count, 0);
  };

  const StatCard = ({ title, value, subtitle, icon, color, gradient }) => (
    <Card 
      sx={{ 
        background: gradient ? `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)` : 'white',
        color: gradient ? 'white' : 'inherit',
        boxShadow: 3,
        transition: 'all 0.3s ease',
        borderRadius: 2,
        height: '100%',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 6,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {value}
            </Typography>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: gradient ? alpha('#fff', 0.2) : alpha(color, 0.1),
              color: gradient ? 'white' : color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ChartCard = ({ title, children, icon }) => (
    <Card 
      sx={{ 
        boxShadow: 3, 
        borderRadius: 2,
        transition: 'all 0.3s ease',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        height: '500px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 6,
        }
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {icon}
        <Typography variant="h5" fontWeight="600" sx={{ ml: 1, color: theme.palette.primary.main }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 3, flex: 1, width: '100%' }}>
        {children}
      </Box>
    </Card>
  );

  const NavigationButton = ({ title, icon, chartKey, isActive }) => (
    <Button
      variant={isActive ? "contained" : "outlined"}
      startIcon={icon}
      onClick={() => setActiveChart(chartKey)}
      sx={{
        borderRadius: 2,
        px: 4,
        py: 1.5,
        fontWeight: 600,
        textTransform: 'none',
        fontSize: '1rem',
        transition: 'all 0.2s ease',
        minWidth: '140px',
        border: isActive ? 'none' : `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
        color: isActive ? 'white' : theme.palette.primary.main,
        '&:hover': {
          backgroundColor: isActive ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1),
          transform: 'translateY(-2px)',
          boxShadow: 3,
        }
      }}
    >
      {title}
    </Button>
  );

  // FIXED COMPONENT: Custom tooltip for predictive data
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 1,
            boxShadow: 3
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          <Typography variant="body2" color={data.predicted ? '#ff6b35' : '#4CAF50'}>
            Requests: {data.requests} {data.predicted && '(Predicted)'}
          </Typography>
          {data.predicted && data.actual && (
            <Typography variant="caption" color="text.secondary">
              Based on trend analysis
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="80vh" flexDirection="column">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading Analytics Dashboard...
          </Typography>
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert 
          severity="error" 
          sx={{ m: 2, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchAnalytics}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  const renderChartContent = () => {
    if (!analytics) return null;

    switch (activeChart) {
      case 'status':
        return (
          <ChartCard 
            title="Request Status Distribution" 
            icon={<DonutLarge color="primary" />}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              alignItems: 'center', 
              justifyContent: 'space-between',
              height: '100%',
              gap: 3
            }}>
              {/* Pie Chart - Left Side */}
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%',
                width: '100%'
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatStatusData(analytics.statusDistribution)}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={140}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(1)}%`}
                    >
                      {formatStatusData(analytics.statusDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} requests`, name]}
                    />
                    <Legend 
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              {/* Status Summary - Right Side */}
              <Box sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                p: 2
              }}>
                <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                  Status Summary
                </Typography>
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: 2,
                  width: '100%',
                  maxWidth: '300px'
                }}>
                  {formatStatusData(analytics.statusDistribution).map((item, index) => (
                    <Card 
                      key={index}
                      sx={{ 
                        p: 2,
                        textAlign: 'center',
                        backgroundColor: alpha(item.color, 0.1),
                        border: `2px solid ${item.color}`,
                        borderRadius: 2,
                        boxShadow: 2
                      }}
                    >
                      <Typography variant="h4" fontWeight="bold" color={item.color}>
                        {item.value}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" color="text.secondary">
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {((item.value / getTotalRequests()) * 100).toFixed(1)}%
                      </Typography>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Box>
          </ChartCard>
        );

      case 'course':
        return (
          <ChartCard 
            title="Requests by Course" 
            icon={<BarChartIcon color="secondary" />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={formatCourseData(analytics.requestsByCourse)}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} requests`, 'Count']}
                  labelFormatter={(label) => `Course: ${label}`}
                />
                <Bar 
                  dataKey="requests" 
                  name="Requests"
                  radius={[4, 4, 0, 0]}
                >
                  {formatCourseData(analytics.requestsByCourse).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        );

      case 'monthly':
        const monthlyData = formatMonthlyData(analytics.monthlyTrend);
        const predictiveData = generatePredictiveData(monthlyData);
        
        return (
          <ChartCard 
            title="Monthly Request Trend (with Predictions)" 
            icon={<ShowChart color="info" />}
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Legend */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 4, backgroundColor: '#4CAF50', mr: 1 }} />
                  <Typography variant="body2">Actual Data</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 4, backgroundColor: '#ff6b35', mr: 1 }} />
                  <Typography variant="body2">Predicted Data</Typography>
                </Box>
              </Box>

              {/* Chart */}
              <Box sx={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={predictiveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    
                    {/* Actual data line */}
                    <Line 
                      type="monotone" 
                      dataKey="requests" 
                      stroke="#4CAF50" 
                      strokeWidth={3}
                      dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#4CAF50' }}
                      name="Actual Requests"
                    />
                    
                    {/* Predicted data line - only show if there are predictions */}
                    {predictiveData.some(d => d.predicted) && (
                      <Line 
                        type="monotone" 
                        dataKey="requests"
                        stroke="#ff6b35" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#ff6b35', strokeWidth: 2, r: 4 }}
                        name="Predicted Requests"
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>

              {/* Prediction Info */}
              <Box sx={{ mt: 2, p: 1, backgroundColor: alpha('#ff6b35', 0.1), borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  💡 Predictive data is generated based on historical trends. 
                  Dashed lines indicate forecasted values for future months.
                </Typography>
              </Box>
            </Box>
          </ChartCard>
        );

      case 'sizeGender':
        return (
          <ChartCard 
            title="Size & Gender Distribution" 
            icon={<Group color="info" />}
          >
            <Box sx={{ minHeight: '420px', width: '100%', p: 1 }}>
              <Grid container spacing={2} sx={{ height: '100%', width: '100%' }}>
                {/* Requests by Size - Left Chart */}
                <Grid item xs={12} md={6} sx={{ minHeight: 320, minWidth: 0 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%',
                    width: '100%',
                    ml: 0
                  }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      align="center" 
                      fontWeight="700" 
                      color="primary"
                      sx={{ mb: 1 }}
                    >
                      Requests by Size
                    </Typography>
                    <Box sx={{ flex: 1, width: '100%', height: '320px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={analytics.requestsBySize}
                          margin={{ top: 15, right: 15, left: 15, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="_id" 
                            tick={{ fontSize: 12 }}
                            interval={0}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip />
                          <Bar 
                            dataKey="count" 
                            fill="#FFC107" 
                            radius={[4, 4, 0, 0]}
                            name="Request Count"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </Grid>

                {/* Requests by Gender - Right Chart */}
                <Grid item xs={12} md={6} sx={{ minHeight: 320, minWidth: 0 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%',
                    width: '100%', minWidth: 0,
                  }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      align="center" 
                      fontWeight="700" 
                      color="primary"
                      sx={{ mb: 1 }}
                    >
                      Requests by Gender
                    </Typography>
                    <Box sx={{ flex: 1, width: '100%', height: '320px', position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.requestsByGender}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="count"
                            label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(1)}%`}
                          >
                            {analytics.requestsByGender.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry._id === 'Male' ? '#1976d2' : '#ec407a'} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value} requests`, name]}
                          />
                          <Legend 
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{
                              fontSize: '14px',
                              fontWeight: '600',
                              paddingTop: '15px'
                            }}
                            formatter={(value) => <span style={{ color: '#333' }}>{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </ChartCard>
        );

      case 'uniform':
        return (
          <ChartCard 
            title="Uniform Types Analysis" 
            icon={<Assessment color="warning" />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={analytics.requestsByUniform} 
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="_id" 
                  tick={{ fontSize: 12 }}
                  width={110}
                />
                <Tooltip 
                  formatter={(value) => [`${value} requests`, 'Count']}
                  labelFormatter={(label) => `Uniform Type: ${label}`}
                />
                <Bar 
                  dataKey="count" 
                  name="Request Count"
                  fill="#0288d1"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        );

      default:
        return (
          <Box sx={{ textAlign: 'center', py: 8, height: '500px' }}>
            <Typography variant="h6" color="text.secondary">
              Select a chart category to view analytics
            </Typography>
          </Box>
        );
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3, minHeight: '100vh' }}>
        {/* Header Section */}
        <Paper 
          sx={{ 
            p: 4, 
            mb: 3, 
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: 4
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                Reports Analytics
              </Typography>
              <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 400 }}>
                Comprehensive overview of all uniform requests and reports
              </Typography>
            </Box>
            <AnalyticsIcon sx={{ fontSize: 60, opacity: 0.8 }} />
          </Box>
        </Paper>

        {/* Stats Overview - REAL DATA */}
        {analytics && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Requests"
                value={getTotalRequests()}
                subtitle="All uniform requests"
                icon={<Assignment fontSize="large" />}
                gradient={GRADIENT_COLORS.primary}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Approved"
                value={analytics.approvedCount || 0}
                subtitle="Approved requests"
                icon={<CheckCircle fontSize="large" />}
                gradient={GRADIENT_COLORS.success}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending"
                value={analytics.statusDistribution?.find(s => s._id === 'pending')?.count || 0}
                subtitle="Awaiting review"
                icon={<Pending fontSize="large" />}
                gradient={GRADIENT_COLORS.warning}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Rejected"
                value={analytics.statusDistribution?.find(s => s._id === 'rejected')?.count || 0}
                subtitle="Declined requests"
                icon={<Cancel fontSize="large" />}
                gradient={GRADIENT_COLORS.secondary}
              />
            </Grid>
          </Grid>
        )}

        {/* FILTERS CARD - NAKALITAW NA AGAD */}
        <Card 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Filter Header */}
            <Box 
              sx={{ 
                p: 2, 
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => setFiltersExpanded(!filtersExpanded)}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <FilterList color="primary" />
                <Typography variant="h6" fontWeight="600" color="primary">
                  Analytics Filters
                </Typography>
                {Object.values(filters).some(filter => filter !== 'all' && filter !== '') && (
                  <Chip 
                    label="Active" 
                    size="small" 
                    color="primary"
                    sx={{ ml: 1, height: 24 }}
                  />
                )}
              </Box>
              <IconButton size="small">
                {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            {/* Filter Content */}
            <Collapse in={filtersExpanded}>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Date Range */}
                  <Grid item xs={12} md={6} lg={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Date Range</InputLabel>
                      <Select
                        value={filters.dateRange}
                        label="Date Range"
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      >
                        <MenuItem value="all">All Time</MenuItem>
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="week">This Week</MenuItem>
                        <MenuItem value="month">This Month</MenuItem>
                        <MenuItem value="quarter">This Quarter</MenuItem>
                        <MenuItem value="year">This Year</MenuItem>
                        <MenuItem value="custom">Custom Range</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Custom Date Range */}
                  {filters.dateRange === 'custom' && (
                    <>
                      <Grid item xs={12} md={6} lg={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Start Date"
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange('startDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6} lg={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="End Date"
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => handleFilterChange('endDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </>
                  )}

                  {/* Status Filter */}
                  <Grid item xs={12} md={6} lg={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.status}
                        label="Status"
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Course Filter - UPDATED WITH ACTUAL COURSES */}
                  <Grid item xs={12} md={6} lg={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Course</InputLabel>
                      <Select
                        value={filters.course}
                        label="Course"
                        onChange={(e) => handleFilterChange('course', e.target.value)}
                      >
                        <MenuItem value="all">All Courses</MenuItem>
                        {ACTUAL_COURSES.map((course) => (
                          <MenuItem key={course} value={course}>
                            {course}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Uniform Type Filter - UPDATED WITH ACTUAL UNIFORM TYPES */}
                  <Grid item xs={12} md={6} lg={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Uniform Type</InputLabel>
                      <Select
                        value={filters.uniformType}
                        label="Uniform Type"
                        onChange={(e) => handleFilterChange('uniformType', e.target.value)}
                      >
                        <MenuItem value="all">All Uniform Types</MenuItem>
                        {ACTUAL_UNIFORM_TYPES.map((uniform) => (
                          <MenuItem key={uniform} value={uniform}>
                            {uniform}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Gender Filter */}
                  <Grid item xs={12} md={6} lg={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={filters.gender}
                        label="Gender"
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                      >
                        <MenuItem value="all">All Genders</MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Size Filter */}
                  <Grid item xs={12} md={6} lg={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Size</InputLabel>
                      <Select
                        value={filters.size}
                        label="Size"
                        onChange={(e) => handleFilterChange('size', e.target.value)}
                      >
                        <MenuItem value="all">All Sizes</MenuItem>
                        <MenuItem value="XS">XS</MenuItem>
                        <MenuItem value="S">S</MenuItem>
                        <MenuItem value="M">M</MenuItem>
                        <MenuItem value="L">L</MenuItem>
                        <MenuItem value="XL">XL</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Filter Actions */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* Active Filters Display */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', flex: 1 }}>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      Active Filters:
                    </Typography>
                    {filters.dateRange !== 'all' && (
                      <Chip 
                        label={`Date: ${filters.dateRange}`} 
                        size="small" 
                        onDelete={() => handleFilterChange('dateRange', 'all')}
                      />
                    )}
                    {filters.status !== 'all' && (
                      <Chip 
                        label={`Status: ${filters.status}`} 
                        size="small" 
                        onDelete={() => handleFilterChange('status', 'all')}
                      />
                    )}
                    {filters.course !== 'all' && (
                      <Chip 
                        label={`Course: ${filters.course}`} 
                        size="small" 
                        onDelete={() => handleFilterChange('course', 'all')}
                      />
                    )}
                    {filters.uniformType !== 'all' && (
                      <Chip 
                        label={`Uniform: ${filters.uniformType}`} 
                        size="small" 
                        onDelete={() => handleFilterChange('uniformType', 'all')}
                      />
                    )}
                    {filters.gender !== 'all' && (
                      <Chip 
                        label={`Gender: ${filters.gender}`} 
                        size="small" 
                        onDelete={() => handleFilterChange('gender', 'all')}
                      />
                    )}
                    {filters.size !== 'all' && (
                      <Chip 
                        label={`Size: ${filters.size}`} 
                        size="small" 
                        onDelete={() => handleFilterChange('size', 'all')}
                      />
                    )}
                    {!Object.values(filters).some(filter => filter !== 'all' && filter !== '') && (
                      <Typography variant="body2" color="text.secondary">
                        No filters applied
                      </Typography>
                    )}
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      onClick={resetFilters}
                      variant="outlined"
                      color="secondary"
                      size="small"
                    >
                      Reset All
                    </Button>
                    <Button 
                      onClick={fetchAnalytics}
                      variant="contained"
                      size="small"
                      startIcon={<FilterList />}
                    >
                      Apply Filters
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            boxShadow: 3,
            background: 'white'
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <NavigationButton
              title="Status"
              icon={<DonutLarge />}
              chartKey="status"
              isActive={activeChart === 'status'}
            />
            <NavigationButton
              title="Course"
              icon={<Category />}
              chartKey="course"
              isActive={activeChart === 'course'}
            />
            <NavigationButton
              title="Monthly"
              icon={<ShowChart />}
              chartKey="monthly"
              isActive={activeChart === 'monthly'}
            />
            <NavigationButton
              title="Size & Gender"
              icon={<Person />}
              chartKey="sizeGender"
              isActive={activeChart === 'sizeGender'}
            />
            <NavigationButton
              title="Uniform Types"
              icon={<Assessment />}
              chartKey="uniform"
              isActive={activeChart === 'uniform'}
            />
          </Box>
        </Paper>

        {/* Dynamic Chart Content */}
        <Box sx={{ width: '100%', mb: 3 }}>
          {renderChartContent()}
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default AdminAnalytics;