// Notifications API Routes
const express = require('express');
const router = express.Router();
const db = require('../db');
const notificationService = require('../services/notificationService');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Middleware to check authentication (JWT verification)
const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error('Notification auth error:', error.message);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Register device token for push notifications
router.post('/register-token', requireAuth, async (req, res) => {
    try {
        const { token, device, browser } = req.body;
        const userId = req.userId;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        // Check if token already exists
        const existing = await db.getOne('deviceTokens', 'token', token);
        if (existing) {
            // Update existing token with new user if different
            if (existing.userId !== userId) {
                await db.update('deviceTokens', 'token', token, {
                    userId,
                    lastUsed: new Date()
                });
            }
            return res.json({ success: true, message: 'Token updated' });
        }

        // Create new token entry
        const tokenEntry = {
            id: 'DT' + Date.now(),
            userId,
            token,
            device: device || 'desktop',
            browser: browser || 'unknown',
            createdAt: new Date(),
            lastUsed: new Date()
        };

        await db.insert('deviceTokens', tokenEntry);
        res.json({ success: true, message: 'Token registered' });
    } catch (error) {
        console.error('Register token error:', error);
        res.status(500).json({ error: 'Failed to register token' });
    }
});

// Unregister device token (on logout)
router.delete('/unregister-token', requireAuth, async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.userId;

        if (token) {
            await db.delete('deviceTokens', 'token', token);
        } else {
            // Remove all tokens for this user
            const tokens = (await db.getAll('deviceTokens')).filter(t => t.userId === userId);
            for (const t of tokens) {
                await db.delete('deviceTokens', 'id', t.id);
            }
        }

        res.json({ success: true, message: 'Token(s) removed' });
    } catch (error) {
        console.error('Unregister token error:', error);
        res.status(500).json({ error: 'Failed to unregister token' });
    }
});

// Get user notifications
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const limit = parseInt(req.query.limit) || 50;

        const notifications = await notificationService.getUserNotifications(userId, limit);
        res.json({ notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to get notifications' });
    }
});

// Get unread count
router.get('/unread-count', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const count = await notificationService.getUnreadCount(userId);
        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
});

// Mark notification as read
router.patch('/:id/read', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await notificationService.markAsRead(id);

        if (result) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Notification not found' });
        }
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// Mark all as read
router.patch('/read-all', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const count = await notificationService.markAllAsRead(userId);
        res.json({ success: true, markedCount: count });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// Clear all notifications for user
router.delete('/clear-all', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { pool } = require('../db');

        // Delete all notifications for this user directly via SQL
        const [result] = await pool.query('DELETE FROM notifications WHERE user_id = ?', [userId]);

        res.json({ success: true, deletedCount: result.affectedRows });
    } catch (error) {
        console.error('Clear all notifications error:', error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

module.exports = router;
