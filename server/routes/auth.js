// Authentication Routes - OTP based login
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const { generateOTP, sendOTPEmail } = require('../services/emailService');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { success: false, message: 'Too many OTP requests from this IP, please try again later' }
});

// Request OTP - Step 1
router.post('/request-otp', otpLimiter, async (req, res) => {
    try {
        const { email, type = 'login' } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Check if user exists in DB - if not, DENY OTP
        const userExists = await db.getOne('users', 'email', email.toLowerCase());
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'Email not registered. Please Sign Up first.'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + config.OTP_EXPIRY_MINUTES * 60 * 1000);

        // Store OTP in database
        await db.insert('otps', {
            id: `OTP${Date.now()}`,
            email: email.toLowerCase(),
            code: otp,
            expiresAt,
            used: 0,
            createdAt: new Date()
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

        // Validate Email Range
        const emailLower = email.toLowerCase().trim();
        if (!emailLower.endsWith('@psr.edu.in') && !emailLower.endsWith('@psr.edu')) {
            return res.status(400).json({ success: false, message: 'Only @psr.edu.in or @psr.edu emails are allowed' });
        }

        // Assign role: 23it008@psr.edu is Admin, all others are Student
        const adminEmails = ['23it008@psr.edu', '23it008@psr.edu.in', 'balachandhar021@gmail.com'];
        const assignedRole = adminEmails.includes(emailLower) ? 'Admin' : 'Student';

        // Check if user already exists
        const existingUser = await db.getOne('users', 'email', emailLower);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const userId = `U${Date.now()}`;
        const newUser = await db.insert('users', {
            id: userId,
            name,
            email: emailLower,
            password: hashedPassword,
            role: assignedRole,
            status: 'Active',
            createdAt: new Date()
        });

        res.json({ success: true, user: newUser });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Password Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.getOne('users', 'email', email.toLowerCase());

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Fallback for backwards compatibility with plain text passwords during dev
        let isMatch = false;
        if (user.password && user.password.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            isMatch = user.password === password;
        }

        if (!isMatch) {
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
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        // Find valid OTP
        const otpRecord = await db.findValidOTP(email.toLowerCase(), otp);

        if (!otpRecord) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired OTP. Please request a new one.'
            });
        }

        // Mark OTP as used
        await db.markOTPUsed(otpRecord.id);

        // Check if user exists in database
        let user = await db.getOne('users', 'email', email.toLowerCase());

        if (!user) {
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
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Verify OTP
        const otpRecord = await db.findValidOTP(email.toLowerCase(), otp);
        if (!otpRecord) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Mark OTP as used
        await db.markOTPUsed(otpRecord.id);

        // Find user
        const user = await db.getOne('users', 'email', email.toLowerCase());
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await db.update('users', 'id', user.id, { password: hashedPassword });

        res.json({ success: true, message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get current user from token
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await db.getOne('users', 'id', decoded.id);

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
router.post('/google-check', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await db.getOne('users', 'email', email.toLowerCase());

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
router.post('/google', async (req, res) => {
    try {
        const { email, name, googleId, picture } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({ success: false, message: 'Email and Google ID are required' });
        }

        // Check if user exists
        let user = await db.getOne('users', 'email', email.toLowerCase());

        if (!user) {
            // Create new user from Google auth
            const isAdmin = email.toLowerCase() === 'balachandhar021@gmail.com';

            const userId = `U${Date.now()}`;
            user = await db.insert('users', {
                id: userId,
                name: name || email.split('@')[0],
                email: email.toLowerCase(),
                role: isAdmin ? 'Admin' : 'Student',
                status: 'Active',
                googleId,
                profileImage: picture || null,
                createdAt: new Date()
            });
            console.log('Created new Google user:', user.email);
        } else {
            // Update Google ID if not set
            if (!user.googleId) {
                await db.update('users', 'id', user.id, { googleId, profileImage: picture });
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

// Reset Password - Verify OTP and set new password
router.post('/reset-password', otpLimiter, async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
        }

        // Validate password strength on server side
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }
        if (!/[A-Z]/.test(newPassword)) {
            return res.status(400).json({ success: false, message: 'Password must contain at least one uppercase letter.' });
        }
        if (!/[0-9]/.test(newPassword)) {
            return res.status(400).json({ success: false, message: 'Password must contain at least one number.' });
        }

        const emailLower = email.toLowerCase().trim();

        // Check if user exists
        const user = await db.getOne('users', 'email', emailLower);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Verify OTP using the dedicated helper (checks expiry at SQL level)
        const validOtp = await db.findValidOTP(emailLower, otp);

        if (!validOtp) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please request a new code.' });
        }

        // OTP is valid — hash the new password with BCrypt (12 rounds)
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password in database
        await db.update('users', 'id', user.id, { password: hashedPassword });

        // Mark OTP as used (invalidate it)
        await db.markOTPUsed(validOtp.id);

        console.log(`✅ Password reset successful for: ${emailLower}`);

        res.json({
            success: true,
            message: 'Your password has been successfully updated.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

module.exports = router;
