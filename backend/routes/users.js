const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for profile pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// GET User Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE User Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, course, yearLevel, contactNumber, address } = req.body;

    // Fields that can be updated
    const updateFields = {};
    if (fullName) updateFields.fullName = fullName;
    if (course) updateFields.course = course;
    if (yearLevel) updateFields.yearLevel = yearLevel;
    if (contactNumber) updateFields.contactNumber = contactNumber;
    if (address) updateFields.address = address;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: user
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPLOAD Profile Picture
router.patch('/profile/picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: req.file.filename },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile picture updated successfully',
      user: user
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPLOAD Student ID Image
router.patch('/profile/student-id', auth, upload.single('studentIdImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { studentIdImage: req.file.filename },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Student ID image updated successfully',
      user: user
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CHANGE Password
router.patch('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;