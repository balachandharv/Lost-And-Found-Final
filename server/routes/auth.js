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
        const { email, type = 'login' } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Check if user exists in DB - if not, DENY OTP
        const userExists = db.getOne('users', 'email', email.toLowerCase());
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'Email not registered. Please Sign Up first.'
            });
        }

        // Check if email is in whitelist OR pattern allowed
        // (We keep this check if you want to restrict who can even have an account,
        // but since we checked DB existence, they must have passed registration logic already.
        // So we can arguably skip strict pattern check here if we trust the DB content,
        // BUT let's keep it for safety if you want to ban users later by removing from whitelist)

        // Actually, if they are in DB, they are valid.
        // Let's just use the DB user info for the email.

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
        const emailResult = await sendOTPEmail(email, otp, userExists.name, type);

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'OTP sent to your email (Check Console/Alert for Dev)',
            userName: userExists.name,
            debugOtp: otp // TODO: Remove this in production!
        });

    } catch (error) {
        console.error('Request OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Register New User (Sign Up)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Validate Email Range and Role
        const emailLower = email.toLowerCase().trim();
        if (!emailLower.endsWith('@psr.edu.in')) {
            return res.status(400).json({ success: false, message: 'Only @psr.edu.in emails are allowed' });
        }

        const idPart = emailLower.split('@')[0];
        const validPattern = /^23it0(0[1-9]|[12][0-9]|30)$/;

        if (!validPattern.test(idPart)) {
            return res.status(400).json({ success: false, message: 'Invalid ID. Allowed: 23IT001 to 23IT030' });
        }

        // Determine Role
        const assignedRole = (idPart === '23it008') ? 'Admin' : 'Student';

        // Check if user already exists
        const existingUser = db.getOne('users', 'email', emailLower);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create new user
        const userId = `U${Date.now()}`;
        const newUser = db.insert('users', {
            id: userId,
            name,
            email: emailLower,
            password, // In a real app, hash this!
            role: assignedRole,
            status: 'Active',
            createdAt: new Date().toISOString()
        });

        res.json({ success: true, user: newUser });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Password Login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        const user = db.getOne('users', 'email', email.toLowerCase());

        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (user.status === 'Blocked') {
            return res.status(403).json({ success: false, message: 'Your account has been blocked' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            user: { ...user, password: undefined },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
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

        // MARKED AS USED ABOVE

        // Check if user exists in database
        let user = db.getOne('users', 'email', email.toLowerCase());

        if (!user) {
            // This should theoretically not happen if request-otp blocks non-existing users,
            // BUT if a user was deleted between request and verify, prompt error.
            return res.status(404).json({
                success: false,
                message: 'User account not found.'
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

// Reset Password
router.post('/reset-password', (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Verify OTP
        const otpRecord = db.findValidOTP(email.toLowerCase(), otp);
        if (!otpRecord) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Mark OTP as used
        db.markOTPUsed(otpRecord.id);

        // Find user
        const user = db.getOne('users', 'email', email.toLowerCase());
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update password
        db.update('users', 'id', user.id, { password: newPassword });

        res.json({ success: true, message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset password error:', error);
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
