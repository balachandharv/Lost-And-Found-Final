// Authentication Routes - OTP based login
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const { generateOTP, sendOTPEmail } = require('../services/emailService');

// Request OTP - Step 1
router.post('/request-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Check if email is in whitelist
        const allowedUser = config.ALLOWED_USERS.find(
            u => u.email.toLowerCase() === email.toLowerCase()
        );

        if (!allowedUser) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This email is not authorized.'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + config.OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

        // Store OTP in database
        db.insert('otps', {
            id: `OTP${Date.now()}`,
            email: email.toLowerCase(),
            code: otp,
            expiresAt,
            used: 0,
            createdAt: new Date().toISOString()
        });

        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, allowedUser.name);

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'OTP sent to your email',
            userName: allowedUser.name
        });

    } catch (error) {
        console.error('Request OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Verify OTP - Step 2
router.post('/verify-otp', (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        // Find valid OTP
        const otpRecord = db.findValidOTP(email.toLowerCase(), otp);

        if (!otpRecord) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired OTP. Please request a new one.'
            });
        }

        // Mark OTP as used
        db.markOTPUsed(otpRecord.id);

        // Get user info from whitelist
        const allowedUser = config.ALLOWED_USERS.find(
            u => u.email.toLowerCase() === email.toLowerCase()
        );

        // Check if user exists in database, if not create
        let user = db.getOne('users', 'email', email.toLowerCase());

        if (!user) {
            const userId = `U${Date.now()}`;
            user = db.insert('users', {
                id: userId,
                name: allowedUser.name,
                email: email.toLowerCase(),
                role: allowedUser.role,
                status: 'Active',
                createdAt: new Date().toISOString()
            });
        }

        // Check if user is blocked
        if (user.status === 'Blocked') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked by an Admin.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                phone: user.phone,
                bio: user.bio,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get current user from token
router.get('/me', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = db.getOne('users', 'id', decoded.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                phone: user.phone,
                bio: user.bio,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});

module.exports = router;
