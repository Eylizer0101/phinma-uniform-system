// services/brevoEmailService.js - BREVO EMAIL SERVICE FOR PASSWORD RESET
const SibApiV3Sdk = require('sib-api-v3-sdk');
const crypto = require('crypto');

// Configure Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Send Password Reset Email
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = "🔐 Reset Your Password - PHINMA Uniform System";
    sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
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
    
    .reset-button {
      display: inline-block;
      background: linear-gradient(135deg, #0071a5 0%, #005a8c 100%);
      color: white;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
      transition: all 0.3s ease;
    }
    
    .reset-button:hover {
      background: linear-gradient(135deg, #005a8c 0%, #004a73 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 113, 165, 0.3);
    }
    
    .info-box {
      background: #f8fafc;
      border-radius: 15px;
      padding: 25px;
      margin: 20px 0;
      border-left: 5px solid #0071a5;
    }
    
    .token-box {
      background: #f1f5f9;
      border-radius: 10px;
      padding: 15px;
      margin: 15px 0;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      word-break: break-all;
      border: 1px dashed #cbd5e1;
    }
    
    .footer {
      background: #f1f5f9;
      padding: 25px 30px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
    }
    
    .warning {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 10px;
      padding: 15px;
      margin: 15px 0;
      color: #92400e;
    }
    
    @media (max-width: 600px) {
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
      <h1>Password Reset Request</h1>
      <p>Uniform Request System - South Campus</p>
    </div>
    
    <div class="email-content">
      <h2 style="color: #1e293b; margin-bottom: 15px;">Hello ${userName},</h2>
      
      <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
        We received a request to reset your password for your PHINMA Uniform System account. 
        Click the button below to create a new password:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" class="reset-button">
          🔐 Reset Your Password
        </a>
      </div>
      
      <div class="info-box">
        <h3 style="color: #0071a5; margin-bottom: 10px;">📋 Reset Instructions:</h3>
        <p style="color: #475569; line-height: 1.6; margin-bottom: 10px;">
          1. Click the "Reset Your Password" button above<br>
          2. Create a new strong password<br>
          3. Login with your new password
        </p>
      </div>
      
      <div class="warning">
        <strong>⚠️ Important:</strong> This link will expire in <strong>10 minutes</strong> for security reasons.
        If you didn't request this reset, please ignore this email.
      </div>
      
      <p style="color: #475569; line-height: 1.6; margin-top: 20px;">
        If the button doesn't work, copy and paste this link in your browser:
      </p>
      
      <div class="token-box">
        ${resetUrl}
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
        This is an automated password reset message. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
    `;
    sendSmtpEmail.sender = {
      name: process.env.BREVO_FROM_NAME || 'PHINMA Uniform System',
      email: process.env.BREVO_FROM_EMAIL || 'reyesronnie332@gmail.com'
    };
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.replyTo = {
      email: process.env.BREVO_FROM_EMAIL || 'reyesronnie332@gmail.com',
      name: process.env.BREVO_FROM_NAME || 'PHINMA Uniform System'
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true, messageId: data.messageId };
    
  } catch (error) {
    console.error('❌ Brevo API Error:', error);
    return { 
      success: false, 
      error: error.message,
      details: error.response?.body || 'Unknown error'
    };
  }
};

// Send Password Reset Success Email
const sendPasswordResetSuccessEmail = async (email, userName) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = "✅ Password Reset Successful - PHINMA Uniform System";
    sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9ff; padding: 30px; border-radius: 0 0 10px 10px; }
    .success-icon { font-size: 48px; margin-bottom: 20px; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Password Updated</h1>
      <p>PHINMA University Uniform System</p>
    </div>
    <div class="content">
      <div style="text-align: center;">
        <div class="success-icon">✅</div>
      </div>
      <h2>Hello ${userName},</h2>
      <p>Your password has been successfully reset for your PHINMA Uniform System account.</p>
      
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
        <h3>🔒 Security Notice:</h3>
        <p>If you did not make this change, please contact support immediately.</p>
      </div>

      <p>You can now login with your new password.</p>
      
      <p>Best regards,<br>Phinma Uniform Management Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>© 2024 Phinma University. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
    sendSmtpEmail.sender = {
      name: process.env.BREVO_FROM_NAME || 'PHINMA Uniform System',
      email: process.env.BREVO_FROM_EMAIL || 'reyesronnie332@gmail.com'
    };
    sendSmtpEmail.to = [{ email: email }];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Password reset success email sent to ${email}`);
    return { success: true, messageId: data.messageId };
    
  } catch (error) {
    console.error('❌ Brevo API Error (success email):', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail
};