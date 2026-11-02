// routes/admin.js - UPDATE WITH RESTORE ROUTE
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes require admin role
router.use(auth);

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

router.use(requireAdmin);

// Dashboard routes
router.get('/dashboard/stats', adminController.getDashboardStats);
// Analytics routes
router.get('/analytics', adminController.getAnalytics);
router.get('/users/:id', adminController.getUserDetails);

// Request management routes
router.get('/requests', adminController.getAllRequests);
router.get('/requests/:id', adminController.getRequestDetails);
router.patch('/requests/:id/status', adminController.updateRequestStatus);
router.patch('/requests/:id/restore', adminController.restoreRequest); // IDINAGDAG: RESTORE ROUTE
router.delete('/requests/:id', adminController.deleteRequest);

// User management routes
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;