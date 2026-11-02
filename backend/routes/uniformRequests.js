const express = require('express');
const UniformRequest = require('../models/UniformRequest');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'uniform-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Uniform data with images
const uniformData = {
  '1st Year': [
    { value: 'Academic Uniform', label: 'Academic Uniform', image: '/images/academic-uniform.jpg' },
    { value: 'P.E. Uniform', label: 'P.E. Uniform', image: '/images/pe-uniform.jpg' },
    { value: 'NSTP / ROTC / CAP', label: 'NSTP / ROTC / CAP', image: '/images/nstp-uniform.jpg' }
  ],
  'HM': [
    { value: 'Chef Uniform', label: 'Chef Uniform', image: '/images/chef-uniform.jpg' },
    { value: 'Business Attire', label: 'Business Attire', image: '/images/business-attire.jpg' }
  ],
  'BSBA': [
    { value: '2nd Year – Business Attire', label: '2nd Year – Business Attire', image: '/images/business-attire.jpg' },
    { value: '3rd to 4th Year – Corporate Attire', label: '3rd to 4th Year – Corporate Attire', image: '/images/corporate-attire.jpg' }
  ],
  'BSIT': [
    { value: 'Corporate Attire', label: 'Corporate Attire', image: '/images/corporate-attire.jpg' }
  ],
  'BSED/BEED': [
    { value: '2nd Year – School Uniform & Sun Uniform', label: '2nd Year – School Uniform & Sun Uniform', image: '/images/school-uniform.jpg' },
    { value: '3rd Year – P.T. Uniform', label: '3rd Year – P.T. Uniform', image: '/images/pt-uniform.jpg' }
  ],
  'Criminology': [
    { value: '2nd Year – Type A Uniform', label: '2nd Year – Type A Uniform', image: '/images/type-a-uniform.jpg' },
    { value: '3rd Year – Type D Uniform', label: '3rd Year – Type D Uniform', image: '/images/type-d-uniform.jpg' },
    { value: '4th Year – Type B Uniform', label: '4th Year – Type B Uniform', image: '/images/type-b-uniform.jpg' }
  ],
  'BSA': [
    { value: '2nd Year – Business Attire', label: '2nd Year – Business Attire', image: '/images/business-attire.jpg' },
    { value: '3rd to 4th Year – Corporate Attire', label: '3rd to 4th Year – Corporate Attire', image: '/images/corporate-attire.jpg' }
  ],
  'COE': [
    { value: 'Corporate Attire', label: 'Corporate Attire', image: '/images/corporate-attire.jpg' }
  ],
  'TM': [
    { value: '2nd Year – Business Attire', label: '2nd Year – Business Attire', image: '/images/business-attire.jpg' },
    { value: '2nd Year – Flight Attendant Uniform', label: '2nd Year – Flight Attendant Uniform', image: '/images/flight-attendant-uniform.jpg' }
  ]
};

// Helper function to get uniform image
const getUniformImage = (course, uniformValue) => {
  const uniforms = uniformData[course] || [];
  const uniform = uniforms.find(u => u.value === uniformValue);
  return uniform ? uniform.image : '/images/default-uniform.jpg';
};

// GET uniforms by course
router.get('/uniforms/:course', auth, async (req, res) => {
  try {
    const { course } = req.params;
    const uniforms = uniformData[course] || [];
    res.json(uniforms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CREATE Uniform Request
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { course, uniform, gender, size, preferredDate } = req.body;
    
    const uniformRequest = new UniformRequest({
      student: req.user.id,
      course,
      uniform,
      gender,
      size,
      preferredDate,
      image: req.file ? req.file.filename : ''
    });

    await uniformRequest.save();
    
    // Populate student info
    await uniformRequest.populate('student', 'fullName studentId email course yearLevel');

    res.status(201).json({
      message: 'Your request has been submitted and is awaiting approval.',
      request: uniformRequest
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET ALL Requests for logged-in student - UPDATED WITH NOTIFICATIONS
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await UniformRequest.find({ student: req.user.id })
      .populate('student', 'fullName studentId email course yearLevel')
      .sort({ createdAt: -1 });

    // Add uniform image to each request
    const requestsWithImages = requests.map(request => {
      const requestObj = request.toObject();
      if (requestObj.course && requestObj.uniform) {
        requestObj.uniformImage = getUniformImage(requestObj.course, requestObj.uniform);
      }
      return requestObj;
    });

    res.json(requestsWithImages);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET Single Request - UPDATED WITH NOTIFICATIONS
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await UniformRequest.findById(req.params.id)
      .populate('student', 'fullName studentId email course yearLevel');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if request belongs to student
    if (request.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add uniform image to the request
    const requestObj = request.toObject();
    if (requestObj.course && requestObj.uniform) {
      requestObj.uniformImage = getUniformImage(requestObj.course, requestObj.uniform);
    }

    res.json(requestObj);

  } catch ( error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE Request (Edit by student)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { course, uniform, gender, size, preferredDate } = req.body;
    
    const request = await UniformRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if request belongs to student
    if (request.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow editing if status is pending
    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot edit request that is not pending' 
      });
    }

    // Update fields
    request.course = course;
    request.uniform = uniform;
    request.gender = gender;
    request.size = size;
    request.preferredDate = preferredDate;
    
    // Update image if new one is uploaded
    if (req.file) {
      request.image = req.file.filename;
    }

    await request.save();

    await request.populate('student', 'fullName studentId email course yearLevel');

    // Add uniform image to response
    const requestObj = request.toObject();
    if (requestObj.course && requestObj.uniform) {
      requestObj.uniformImage = getUniformImage(requestObj.course, requestObj.uniform);
    }

    res.json({
      message: 'Request updated successfully',
      request: requestObj
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE Request Status (Cancel by student)
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const request = await UniformRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if request belongs to student
    if (request.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow cancellation if status is pending
    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot cancel request that is not pending' 
      });
    }

    request.status = 'cancelled';
    request.cancelledAt = new Date();
    await request.save();

    await request.populate('student', 'fullName studentId email course yearLevel');

    // Add uniform image to response
    const requestObj = request.toObject();
    if (requestObj.course && requestObj.uniform) {
      requestObj.uniformImage = getUniformImage(requestObj.course, requestObj.uniform);
    }

    res.json({
      message: 'Request cancelled successfully',
      request: requestObj
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// IDINAGDAG: Mark notification as read
router.patch('/:requestId/notifications/:notificationId/read', auth, async (req, res) => {
  try {
    const { requestId, notificationId } = req.params;
    
    const request = await UniformRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if request belongs to student
    if (request.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Find and update the notification
    const notification = request.notifications.id(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.isRead = true;
    await request.save();
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE Request
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await UniformRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if request belongs to student
    if (request.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await UniformRequest.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Request deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;