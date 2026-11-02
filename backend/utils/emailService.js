// utils/emailService.js - COMPLETE EMAIL SERVICE WITH OTP
const nodemailer = require('nodemailer');

// Create transporter - GAMITIN ANG IYONG EXISTING CONFIG
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'eylizermarcosdeafria@gmail.com',
    pass: process.env.EMAIL_PASS || 'hmelgtxahjraoybs'
  }
});

// OTP Email Template
const sendOTPEmail = async (studentEmail, studentName, otpCode) => {
  try {
    const mailOptions = {
      from: `"Phinma Uniform System" <${process.env.EMAIL_USER || 'eylizermarcosdeafria@gmail.com'}>`,
      to: studentEmail,
      subject: '🔐 Verify Your Email - Phinma Uniform System',
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0071a5 0%, #005a8c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9ff; padding: 30px; border-radius: 0 0 10px 10px; }
    .otp-code { background: #0071a5; color: white; padding: 15px 30px; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #0071a5; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Email Verification</h1>
      <p>Phinma University Uniform System</p>
    </div>
    <div class="content">
      <h2>Hello ${studentName},</h2>
      <p>Thank you for registering with Phinma Uniform System. Please use the following verification code to complete your registration:</p>
      
      <div class="otp-code">${otpCode}</div>
      
      <div class="info-box">
        <h3>📋 Instructions:</h3>
        <p>1. Copy the verification code above</p>
        <p>2. Enter it in the verification form</p>
        <p>3. Complete your registration process</p>
        <p><strong>Note:</strong> This code will expire in 10 minutes</p>
      </div>

      <p>If you didn't request this verification, please ignore this email.</p>
      
      <p>Best regards,<br>Phinma Uniform Management Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>© 2024 Phinma University. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP Email sent to ${studentEmail}`);
    return true;

  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return false;
  }
};

// Email templates for status updates
const emailTemplates = {
  approved: {
    subject: '🎉 Your Uniform Request Has Been Approved! - Phinma Uniform',
    template: (studentName, uniformType, adminNotes, pickupLocation) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4cc9f0 0%, #3a7bd5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9ff; padding: 30px; border-radius: 0 0 10px 10px; }
    .status-badge { background: #4CAF50; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; font-weight: bold; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3a7bd5; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Request Approved!</h1>
      <p>Phinma University Uniform System</p>
    </div>
    <div class="content">
      <h2>Hello ${studentName},</h2>
      <p>Great news! Your uniform request has been <span class="status-badge">APPROVED</span>.</p>
      
      <div class="info-box">
        <h3>📋 Request Details:</h3>
        <p><strong>Uniform Type:</strong> ${uniformType}</p>
        <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">APPROVED ✅</span></p>
        <p><strong>Pickup Location:</strong> ${pickupLocation}</p>
        ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
      </div>

      <div class="info-box">
        <h3>📦 Next Steps:</h3>
        <p>1. Visit the uniform office at your scheduled pickup location</p>
        <p>2. Bring your student ID for verification</p>
        <p>3. Collect your uniform during office hours</p>
      </div>

      <p>If you have any questions, please contact the uniform office.</p>
      
      <p>Best regards,<br>Phinma Uniform Management Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>© 2024 Phinma University. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
  },
  rejected: {
    subject: '❌ Your Uniform Request Has Been Rejected - Phinma Uniform',
    template: (studentName, uniformType, adminNotes) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9ff; padding: 30px; border-radius: 0 0 10px 10px; }
    .status-badge { background: #f44336; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; font-weight: bold; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ee5a52; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Request Rejected</h1>
      <p>Phinma University Uniform System</p>
    </div>
    <div class="content">
      <h2>Hello ${studentName},</h2>
      <p>We regret to inform you that your uniform request has been <span class="status-badge">REJECTED</span>.</p>
      
      <div class="info-box">
        <h3>📋 Request Details:</h3>
        <p><strong>Uniform Type:</strong> ${uniformType}</p>
        <p><strong>Status:</strong> <span style="color: #f44336; font-weight: bold;">REJECTED ❌</span></p>
        ${adminNotes ? `<p><strong>Reason:</strong> ${adminNotes}</p>` : '<p><strong>Reason:</strong> Please contact the uniform office for more details.</p>'}
      </div>

      <div class="info-box">
        <h3>🔄 What to do next:</h3>
        <p>1. Review the reason for rejection above</p>
        <p>2. If you believe this is an error, contact the uniform office</p>
        <p>3. You may submit a new request with corrected information</p>
      </div>

      <p>If you have any questions, please visit the uniform office.</p>
      
      <p>Best regards,<br>Phinma Uniform Management Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>© 2024 Phinma University. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
  },
  cancelled: {
    subject: '⚪ Your Uniform Request Has Been Cancelled - Phinma Uniform',
    template: (studentName, uniformType, adminNotes) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9ff; padding: 30px; border-radius: 0 0 10px 10px; }
    .status-badge { background: #6c757d; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; font-weight: bold; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #495057; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚪ Request Cancelled</h1>
      <p>Phinma University Uniform System</p>
    </div>
    <div class="content">
      <h2>Hello ${studentName},</h2>
      <p>Your uniform request has been <span class="status-badge">CANCELLED</span>.</p>
      
      <div class="info-box">
        <h3>📋 Request Details:</h3>
        <p><strong>Uniform Type:</strong> ${uniformType}</p>
        <p><strong>Status:</strong> <span style="color: #6c757d; font-weight: bold;">CANCELLED ⚪</span></p>
        ${adminNotes ? `<p><strong>Notes:</strong> ${adminNotes}</p>` : ''}
      </div>

      <div class="info-box">
        <h3>ℹ️ Information:</h3>
        <p>• This request is no longer active</p>
        <p>• You can submit a new request if needed</p>
        <p>• Contact uniform office for any concerns</p>
      </div>

      <p>If you have any questions, please contact the uniform office.</p>
      
      <p>Best regards,<br>Phinma Uniform Management Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>© 2024 Phinma University. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
  }
};

// Send email notification function
const sendStatusUpdateEmail = async (studentEmail, studentName, status, uniformType, adminNotes = '', pickupLocation = '') => {
  try {
    if (!emailTemplates[status]) {
      console.warn(`No email template found for status: ${status}`);
      return { success: false, error: `No template for status: ${status}` };
    }

    const template = emailTemplates[status];
    const htmlContent = template.template(studentName, uniformType, adminNotes, pickupLocation);

    const mailOptions = {
      from: `"Phinma Uniform System" <${process.env.EMAIL_USER || 'eylizermarcosdeafria@gmail.com'}>`,
      to: studentEmail,
      subject: template.subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${studentEmail} for ${status} status`);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Test email connection
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendStatusUpdateEmail,
  testEmailConnection
};