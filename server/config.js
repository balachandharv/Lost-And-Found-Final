// Configuration for the Lost & Found Backend

module.exports = {
    // Whitelisted users - ONLY these emails can login
    ALLOWED_USERS: [
        { email: "cmariappan15@gmail.com", role: "Student", name: "Student User" },
        { email: "balachandhar021@gmail.com", role: "Admin", name: "Admin User" }
    ],

    // Email configuration (Gmail SMTP)
    // To get an App Password:
    // 1. Go to https://myaccount.google.com/security
    // 2. Enable 2-Factor Authentication
    // 3. Go to "App passwords" and generate one for "Mail"
    EMAIL: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        user: "balachandhar021@gmail.com",  // Sender email
        pass: "tngqmlacebmabekd"       // Gmail App Password
    },

    // JWT Configuration
    JWT_SECRET: "lostfound-secret-key-2026",
    JWT_EXPIRES_IN: "24h",

    // OTP Configuration
    OTP_EXPIRY_MINUTES: 5,
    OTP_LENGTH: 6
};
