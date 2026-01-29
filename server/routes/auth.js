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
        // Check if email is in whitelist
        let allowedUser = config.ALLOWED_USERS.find(
            u => u.email.toLowerCase() === email.toLowerCase()
        );

        // If not in whitelist, check for PSR college pattern (23it001 - 23it030)
        if (!allowedUser && email.toLowerCase().endsWith('@psr.edu.in')) {
            const idPart = email.split('@')[0].toLowerCase();
            const validPattern = /^23it0(0[1-9]|[12][0-9]|30)$/;

            if (validPattern.test(idPart)) {
                const isAdmin = idPart === '23it008';
                allowedUser = {
                    email: email,
                    name: isAdmin ? "Admin (PSR)" : "Student (PSR)",
                    role: isAdmin ? "Admin" : "Student"
                };
            }
        }

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

        // Get user info from whitelist or pattern
        let allowedUser = config.ALLOWED_USERS.find(
            u => u.email.toLowerCase() === email.toLowerCase()
        );

        if (!allowedUser && email.toLowerCase().endsWith('@psr.edu.in')) {
            const idPart = email.split('@')[0].toLowerCase();
            const isAdmin = idPart === '23it008';
            allowedUser = {
                name: isAdmin ? "Admin (PSR)" : "Student (PSR)",
                role: isAdmin ? "Admin" : "Student"
            };
        }

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

// Check if Google user exists (for modal flow)
router.post('/google-check', (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = db.getOne('users', 'email', email.toLowerCase());

        if (user) {
            res.json({
                success: true,
                exists: true,
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.json({
                success: true,
                exists: false
            });
        }
    } catch (error) {
        console.error('Google check error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Google OAuth Login/Register
router.post('/google', (req, res) => {
    try {
        const { email, name, googleId, picture } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({ success: false, message: 'Email and Google ID are required' });
        }

        // Check if user exists
        let user = db.getOne('users', 'email', email.toLowerCase());

        if (!user) {
            // Create new user from Google auth
            // Check if this email should be admin
            const isAdmin = email.toLowerCase() === 'balachandhar021@gmail.com';

            const userId = `U${Date.now()}`;
            user = db.insert('users', {
                id: userId,
                name: name || email.split('@')[0],
                email: email.toLowerCase(),
                role: isAdmin ? 'Admin' : 'Student',
                status: 'Active',
                googleId,
                profileImage: picture || null,
                createdAt: new Date().toISOString()
            });
            console.log('Created new Google user:', user.email);
        } else {
            // Update Google ID if not set
            if (!user.googleId) {
                db.update('users', 'id', user.id, { googleId, profileImage: picture });
            }
        }

        // Check if blocked
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
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
