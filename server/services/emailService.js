// Email Service for sending OTP codes
const nodemailer = require('nodemailer');
const config = require('../config');

// Generate random OTP
const generateOTP = () => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < config.OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Create transporter - will be initialized on first use
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Try configured email first
  if (config.EMAIL.pass && config.EMAIL.pass !== 'YOUR_APP_PASSWORD_HERE') {
    transporter = nodemailer.createTransport({
      host: config.EMAIL.host,
      port: config.EMAIL.port,
      secure: config.EMAIL.secure,
      auth: {
        user: config.EMAIL.user,
        pass: config.EMAIL.pass
      }
    });
    console.log('📧 Using configured Gmail SMTP');
    return transporter;
  }

  // Use Ethereal test account for development
  console.log('📧 Creating Ethereal test email account...');
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  console.log('📧 Ethereal test account ready:', testAccount.user);
  return transporter;
};

// Send OTP email
const sendOTPEmail = async (email, otp, userName, type = 'login') => {
  const isReset = type === 'reset';
  const subject = isReset ? '🔐 Reset Your Password' : '🔐 Your Login Verification Code';
  const title = isReset ? 'Reset Password' : 'Hello ' + userName + '!';
  const message = isReset
    ? 'Use the code below to reset your password:'
    : 'Use the code below to verify your login:';

  const mailOptions = {
    from: `"College Lost & Found" <lostandfound@psr.edu.in>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">🔍 College Lost & Found</h1>
        </div>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 30px; text-align: center;">
          <h2 style="color: #1e293b; margin-bottom: 10px;">${title}</h2>
          <p style="color: #64748b; margin-bottom: 25px;">
            ${message}
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
    const emailTransporter = await getTransporter();
    const info = await emailTransporter.sendMail(mailOptions);

    // Get preview URL for Ethereal emails
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log(`
    ╔══════════════════════════════════════════════════════════════╗
    ║  ✅ OTP EMAIL SENT SUCCESSFULLY                              ║
    ╠══════════════════════════════════════════════════════════════╣
    ║  📧 To: ${email.padEnd(47)}║
    ║  🔢 OTP: ${otp.padEnd(46)}║
    ${previewUrl ? `║  🔗 View Email: ${previewUrl.substring(0, 40)}...  ║` : ''}
    ╚══════════════════════════════════════════════════════════════╝
    `);

    if (previewUrl) {
      console.log('📧 Full Preview URL:', previewUrl);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);

    // Fallback: Still return success with OTP in console for testing
    console.log(`
    ╔══════════════════════════════════════════════════════════════╗
    ║  ⚠️  EMAIL FAILED - USING CONSOLE FALLBACK                   ║
    ╠══════════════════════════════════════════════════════════════╣
    ║  📧 To: ${email.padEnd(47)}║
    ║  🔢 OTP: ${otp.padEnd(46)}║
    ╚══════════════════════════════════════════════════════════════╝
    `);
    return { success: true, warning: "Fallback mode - check server console for OTP" };
  }
};

module.exports = { generateOTP, sendOTPEmail };
