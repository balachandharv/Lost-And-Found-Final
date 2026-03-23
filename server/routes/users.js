// User Management Routes (Admin only)
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);

        if (decoded.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Get all users (Admin only)
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const users = (await db.getAll('users')).map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.status,
            createdAt: u.createdAt
        }));
        res.json({ success: true, users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update user status (Admin only)
router.patch('/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Active', 'Blocked'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const updated = await db.update('users', 'id', id, { status });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: `User ${status === 'Blocked' ? 'blocked' : 'activated'}` });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
