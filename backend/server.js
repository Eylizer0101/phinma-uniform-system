// server.js - UPDATE ITO
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// Make uploads directories if they don't exist
const fs = require('fs');
const uploadDirs = [UPLOAD_DIR, path.join(UPLOAD_DIR, 'profiles')];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || (process.env.NODE_ENV !== 'production' ? 'mongodb://localhost:27017/phinma_uniform' : undefined))
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Email configuration - CORRECTED: createTransport NOT createTransporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// IDINAGDAG: Test email connection on startup
const { testEmailConnection } = require('./utils/emailService');
testEmailConnection();

// Contact form email endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Email content with beautiful design
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'dumlaojustine9@gmail.com', // Your email where you want to receive notifications
      subject: `📧 New Contact Form Message from ${name} - PHINMA AU Uniform System`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Contact Form Message</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Inter', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 20px;
                }
                
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                }
                
                .email-header {
                    background: linear-gradient(135deg, #0071a5 0%, #005a8c 100%);
                    padding: 40px 30px;
                    text-align: center;
                    color: white;
                }
                
                .email-header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 10px;
                    letter-spacing: 0.5px;
                }
                
                .email-header p {
                    font-size: 16px;
                    opacity: 0.9;
                    font-weight: 400;
                }
                
                .logo {
                    font-size: 32px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    display: inline-block;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 10px 20px;
                    border-radius: 50px;
                    backdrop-filter: blur(10px);
                }
                
                .email-content {
                    padding: 40px 30px;
                }
                
                .message-card {
                    background: #f8fafc;
                    border-radius: 15px;
                    padding: 25px;
                    margin: 20px 0;
                    border-left: 5px solid #0071a5;
                    box-shadow: 0 5px 15px rgba(0, 113, 165, 0.1);
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 25px;
                }
                
                .info-item {
                    background: white;
                    padding: 15px;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                }
                
                .info-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 5px;
                }
                
                .info-value {
                    font-size: 16px;
                    font-weight: 500;
                    color: #1e293b;
                }
                
                .message-content {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                    font-size: 15px;
                    line-height: 1.6;
                    color: #475569;
                    white-space: pre-wrap;
                }
                
                .timestamp {
                    text-align: center;
                    color: #64748b;
                    font-size: 14px;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                }
                
                .footer {
                    background: #f1f5f9;
                    padding: 25px 30px;
                    text-align: center;
                    color: #64748b;
                    font-size: 14px;
                }
                
                .footer a {
                    color: #0071a5;
                    text-decoration: none;
                    font-weight: 500;
                }
                
                .badge {
                    display: inline-block;
                    background: #10b981;
                    color: white;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    margin-left: 10px;
                }
                
                @media (max-width: 600px) {
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .email-header {
                        padding: 30px 20px;
                    }
                    
                    .email-content {
                        padding: 30px 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <div class="logo">PHINMA AU</div>
                    <h1>New Contact Message 📧</h1>
                    <p>Uniform Request System - South Campus</p>
                </div>
                
                <div class="email-content">
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Sender Name</div>
                            <div class="info-value">${name}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Email Address</div>
                            <div class="info-value">${email}</div>
                        </div>
                    </div>
                    
                    <div class="message-card">
                        <div class="info-label" style="margin-bottom: 15px;">MESSAGE CONTENT</div>
                        <div class="message-content">
                            ${message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    
                    <div class="timestamp">
                        📅 Message received on ${new Date().toLocaleString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
                
                <div class="footer">
                    <p>
                        <strong>PHINMA Araullo University - South Campus</strong><br>
                        Uniform Request and Tracking System<br>
                        Cabanatuan City, Nueva Ecija
                    </p>
                    <p style="margin-top: 15px;">
                        📞 (044) 940-9856 | ✉️ uniform.office@phinmaed.edu.ph
                    </p>
                    <p style="margin-top: 10px; font-size: 12px; opacity: 0.7;">
                        This is an automated message from the contact form. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully!' 
    });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again.' 
    });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/uniform-requests', require('./routes/uniformRequests'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin')); // IDINAGDAG
app.use('/api/email-verification', require('./routes/emailVerification')); // IDINAGDAG

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'PHINMA Uniform System API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});