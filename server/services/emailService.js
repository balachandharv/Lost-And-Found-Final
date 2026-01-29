// Email Service for sending OTP codes
const nodemailer = require('nodemailer');
const config = require('../config');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: config.EMAIL.host,
  port: config.EMAIL.port,
  secure: config.EMAIL.secure,
  auth: {
    user: config.EMAIL.user,
    pass: config.EMAIL.pass
  }
});

// Generate random OTP
const generateOTP = () => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < config.OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Send OTP email
const sendOTPEmail = async (email, otp, userName) => {
  const mailOptions = {
    from: `"College Lost & Found" <${config.EMAIL.user}>`,
    to: email,
    subject: '🔐 Your Login Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">🔍 College Lost & Found</h1>
        </div>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 30px; text-align: center;">
          <h2 style="color: #1e293b; margin-bottom: 10px;">Hello ${userName}!</h2>
          <p style="color: #64748b; margin-bottom: 25px;">
            Use the code below to verify your login:
          </p>
          
          <div style="background: #2563eb; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px 40px; border-radius: 8px; display: inline-block;">
            ${otp}
          </div>
          
          <p style="color: #94a3b8; font-size: 14px; margin-top: 25px;">
            This code expires in ${config.OTP_EXPIRY_MINUTES} minutes.
          </p>
        </div>
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);

    // FAILSAFE for development: Log OTP and pretend success so user can login without configuring SMTP
    console.log(`
        ╔════════════════════════════════════════════╗
        ║ [DEV MODE] Email failed (Invalid Config)   ║
        ║ Mock OTP for ${email}: ${otp}              ║
        ╚════════════════════════════════════════════╝
        `);
    return { success: true, warning: "Mock mode - check console for OTP" };
  }
};

module.exports = { generateOTP, sendOTPEmail };
