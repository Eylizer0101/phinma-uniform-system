// controllers/adminController.js - UPDATE WITH EMAIL NOTIFICATION
const User = require('../models/User');
const UniformRequest = require('../models/UniformRequest');
const { sendStatusUpdateEmail } = require('../utils/emailService'); // IDINAGDAG

// Get Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalRequests = await UniformRequest.countDocuments();
    const pendingRequests = await UniformRequest.countDocuments({ status: 'pending' });
    const approvedRequests = await UniformRequest.countDocuments({ status: 'approved' });
    const rejectedRequests = await UniformRequest.countDocuments({ status: 'rejected' });
    const cancelledRequests = await UniformRequest.countDocuments({ status: 'cancelled' });
    
    const totalUsers = await User.countDocuments({ role: 'student' });
    
    // Stock counts by uniform type
    const dailyStock = 100; // Replace with actual stock logic
    const peStock = 80;
    const nstpStock = 60;
    const formalStock = 40;

    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      cancelledRequests,
      totalUsers,
      stocks: {
        daily: dailyStock,
        pe: peStock,
        nstp: nstpStock,
        formal: formalStock
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// controllers/adminController.js - FIXED COURSE FILTER

const getAllRequests = async (req, res) => {
  try {
    const { 
      status, 
      type, 
      search, 
      size, 
      course, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    let filter = {};
    
    // Handle multiple status values (comma-separated)
    if (status) {
      if (status.includes(',')) {
        // Multiple statuses (for archive: approved,rejected,cancelled)
        filter.status = { $in: status.split(',') };
      } else if (status === 'all') {
        // Show all statuses - No status filter applied
      } else {
        // Single status filter
        filter.status = status;
      }
    } else {
      // Default: show only pending requests for main requests page
      filter.status = 'pending';
    }
    
    // Uniform type filter
    if (type) {
      filter.$or = [
        { type: type },
        { uniform: type }
      ];
    }
    
    // Size filter
    if (size) {
      filter.size = size;
    }
    
    // COURSE FILTER - FIXED: Handle course filter through student population
    let studentCourseFilter = {};
    if (course) {
      studentCourseFilter.course = course;
    }
    
    // Search filter (student name or ID)
    let studentSearchFilter = {};
    if (search) {
      studentSearchFilter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Combine student filters
    let studentFilter = {};
    if (Object.keys(studentCourseFilter).length > 0 || Object.keys(studentSearchFilter).length > 0) {
      studentFilter = {
        $and: [
          Object.keys(studentCourseFilter).length > 0 ? studentCourseFilter : {},
          Object.keys(studentSearchFilter).length > 0 ? studentSearchFilter : {}
        ].filter(condition => Object.keys(condition).length > 0)
      };
    }
    
    console.log('Final filter:', filter);
    console.log('Student filter:', studentFilter);
    
    // Build the base query with population
    let query = UniformRequest.find(filter);
    
    // Apply student population with filters if any student filters exist
    if (Object.keys(studentFilter).length > 0) {
      query = query.populate({
        path: 'student',
        match: studentFilter,
        select: 'fullName studentId course yearLevel'
      });
    } else {
      query = query.populate('student', 'fullName studentId course yearLevel');
    }
    
    query = query.sort({ createdAt: -1 });

    // Execute query with pagination
    const requests = await query
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter out requests where student is null (due to population filters)
    const filteredRequests = requests.filter(request => request.student !== null);

    // Get total count with the same filters
    let countQuery = UniformRequest.find(filter);
    
    if (Object.keys(studentFilter).length > 0) {
      countQuery = countQuery.populate({
        path: 'student',
        match: studentFilter
      });
    } else {
      countQuery = countQuery.populate('student');
    }

    const allRequests = await countQuery;
    const validRequests = allRequests.filter(request => request.student !== null);
    const total = validRequests.length;
    
    res.json({
      requests: filteredRequests,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error in getAllRequests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Single Request Details
const getRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await UniformRequest.findById(id)
      .populate('student', 'fullName studentId email course yearLevel contactNumber');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json({ request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Request Status - UPDATED WITH EMAIL NOTIFICATION
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    const request = await UniformRequest.findById(id).populate('student');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    const oldStatus = request.status;
    request.status = status;
    if (adminNotes) request.adminNotes = adminNotes;
    
    // Set timestamps based on status
    if (status === 'approved') {
      request.approvedAt = new Date();
    } else if (status === 'rejected') {
      request.rejectedAt = new Date();
    } else if (status === 'cancelled') {
      request.cancelledAt = new Date();
    }
    
    // Add notification for status update
    const statusMessages = {
      'approved': 'approved ✅',
      'rejected': 'rejected ❌', 
      'cancelled': 'cancelled ⚪'
    };
    
    if (statusMessages[status]) {
      request.notifications.push({
        message: `Your uniform request has been ${statusMessages[status]}${adminNotes ? ` - ${adminNotes}` : ''}`,
        type: 'status_update'
      });
    }
    
    await request.save();
    
    // IDINAGDAG: Send email notification
    if (['approved', 'rejected', 'cancelled'].includes(status) && request.student && request.student.email) {
      try {
        const emailResult = await sendStatusUpdateEmail(
          request.student.email,
          request.student.fullName,
          status,
          request.uniform,
          adminNotes,
          request.pickupLocation
        );
        
        console.log(`📧 Email notification sent: ${emailResult.success ? 'SUCCESS' : 'FAILED'}`);
        
        // You can log email results or handle failures as needed
        if (!emailResult.success) {
          console.warn(`Email failed for ${request.student.email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error('Email sending error (non-blocking):', emailError);
        // Don't throw error - email failure shouldn't block status update
      }
    }
    
    res.json({ message: `Request ${status} successfully`, request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// IDINAGDAG: Restore Request Function
const restoreRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await UniformRequest.findById(id).populate('student');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Set status back to pending
    request.status = 'pending';
    
    // Clear the timestamps for archived status
    request.approvedAt = null;
    request.rejectedAt = null;
    request.cancelledAt = null;
    
    // Add notification for restoration
    request.notifications.push({
      message: 'Your uniform request has been restored to pending status 🔄',
      type: 'status_update'
    });
    
    await request.save();
    
    res.json({ message: 'Request restored to pending successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Request Function
const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await UniformRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    await UniformRequest.findByIdAndDelete(id);
    
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Users - UPDATED WITH COMPLETE FILTERS
const getAllUsers = async (req, res) => {
  try {
    const { 
      search, 
      status, 
      course, 
      yearLevel,
      page = 1, 
      limit = 10 
    } = req.query;
    
    let filter = { role: 'student' };
    
    // Search filter
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status) {
      filter.status = status;
    }
    
    // Course filter
    if (course) {
      filter.course = course;
    }
    
    // Year Level filter
    if (yearLevel) {
      filter.yearLevel = yearLevel;
    }
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update User Status
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.status = status;
    await user.save();
    
    res.json({ message: `User ${status} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has pending requests
    const pendingRequests = await UniformRequest.countDocuments({ 
      student: id, 
      status: 'pending' 
    });
    
    if (pendingRequests > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with pending requests' 
      });
    }
    
    await User.findByIdAndDelete(id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Analytics Data with Filters
const getAnalytics = async (req, res) => {
  try {
    const {
      dateRange,
      startDate,
      endDate,
      status,
      course,
      uniformType,
      gender,
      size
    } = req.query;

    // Build match filter
    let matchFilter = {};

    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDateFilter = new Date();

      switch (dateRange) {
        case 'today':
          startDateFilter.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDateFilter.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDateFilter.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDateFilter.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDateFilter.setFullYear(now.getFullYear() - 1);
          break;
        case 'custom':
          if (startDate) {
            startDateFilter = new Date(startDate);
          }
          break;
      }

      if (dateRange === 'custom' && startDate && endDate) {
        matchFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      } else if (dateRange !== 'custom') {
        matchFilter.createdAt = {
          $gte: startDateFilter,
          $lte: now
        };
      }
    }

    // Status filter
    if (status && status !== 'all') {
      matchFilter.status = status;
    }

    // Course filter -需要通过用户表查询
    if (course && course !== 'all') {
      // Get users with the specified course first
      const usersWithCourse = await User.find({ course: course }).select('_id');
      const userIds = usersWithCourse.map(user => user._id);
      matchFilter.student = { $in: userIds };
    }

    // Uniform type filter
    if (uniformType && uniformType !== 'all') {
      matchFilter.uniform = uniformType;
    }

    // Gender filter
    if (gender && gender !== 'all') {
      matchFilter.gender = gender;
    }

    // Size filter
    if (size && size !== 'all') {
      matchFilter.size = size;
    }

    console.log('Match Filter:', matchFilter); // For debugging

    // Status distribution
    const statusDistribution = await UniformRequest.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Requests by course - UPDATED WITH COURSE FILTER
    const requestsByCourse = await UniformRequest.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentData'
        }
      },
      {
        $unwind: '$studentData'
      },
      {
        $group: {
          _id: '$studentData.course',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Requests by uniform type
    const requestsByUniform = await UniformRequest.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$uniform',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Requests by size
    const requestsBySize = await UniformRequest.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$size',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Requests by gender
    const requestsByGender = await UniformRequest.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly requests trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyMatchFilter = {
      ...matchFilter,
      createdAt: { 
        $gte: matchFilter.createdAt ? 
          new Date(Math.max(matchFilter.createdAt.$gte.getTime(), sixMonthsAgo.getTime())) : 
          sixMonthsAgo 
      }
    };

    const monthlyTrend = await UniformRequest.aggregate([
      { $match: monthlyMatchFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    // Approval rate
    const statusFilterForApproval = { ...matchFilter };
    statusFilterForApproval.status = { $in: ['approved', 'rejected'] };
    
    const totalProcessed = await UniformRequest.countDocuments(statusFilterForApproval);
    const approvedCount = await UniformRequest.countDocuments({ 
      ...matchFilter, 
      status: 'approved' 
    });
    const approvalRate = totalProcessed > 0 ? (approvedCount / totalProcessed) * 100 : 0;

    // Average processing time (for approved requests)
    const processingTimes = await UniformRequest.aggregate([
      {
        $match: {
          ...matchFilter,
          status: 'approved',
          createdAt: { $exists: true },
          approvedAt: { $exists: true }
        }
      },
      {
        $project: {
          processingTime: {
            $divide: [
              { $subtract: ['$approvedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgProcessingTime: { $avg: '$processingTime' }
        }
      }
    ]);

    const avgProcessingTime = processingTimes.length > 0 ? processingTimes[0].avgProcessingTime : 0;

    res.json({
      statusDistribution,
      requestsByCourse,
      requestsByUniform,
      requestsBySize,
      requestsByGender,
      monthlyTrend,
      approvalRate: Math.round(approvalRate),
      avgProcessingTime: Math.round(avgProcessingTime * 100) / 100,
      totalProcessed,
      approvedCount,
      filtersApplied: Object.keys(req.query).length > 0
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllRequests,
  getRequestDetails,
  updateRequestStatus,
  restoreRequest, // IDINAGDAG
  deleteRequest,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAnalytics,
  getUserDetails
};