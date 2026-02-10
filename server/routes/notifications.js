// Notifications API Routes
const express = require('express');
const router = express.Router();
const db = require('../db');
const notificationService = require('../services/notificationService');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    req.userId = userId;
    next();
};

// Register device token for push notifications
router.post('/register-token', requireAuth, (req, res) => {
    try {
        const { token, device, browser } = req.body;
        const userId = req.userId;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        // Check if token already exists
        const existing = db.getOne('deviceTokens', 'token', token);
        if (existing) {
            // Update existing token with new user if different
            if (existing.userId !== userId) {
                db.update('deviceTokens', 'token', token, {
                    userId,
                    lastUsed: new Date().toISOString()
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
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString()
        };

        db.insert('deviceTokens', tokenEntry);
        res.json({ success: true, message: 'Token registered' });
    } catch (error) {
        console.error('Register token error:', error);
        res.status(500).json({ error: 'Failed to register token' });
    }
});

// Unregister device token (on logout)
router.delete('/unregister-token', requireAuth, (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.userId;

        if (token) {
            db.delete('deviceTokens', 'token', token);
        } else {
            // Remove all tokens for this user
            const tokens = db.getAll('deviceTokens').filter(t => t.userId === userId);
            tokens.forEach(t => db.delete('deviceTokens', 'id', t.id));
        }

        res.json({ success: true, message: 'Token(s) removed' });
    } catch (error) {
        console.error('Unregister token error:', error);
        res.status(500).json({ error: 'Failed to unregister token' });
    }
});

// Get user notifications
router.get('/', requireAuth, (req, res) => {
    try {
        const userId = req.userId;
        const limit = parseInt(req.query.limit) || 50;

        const notifications = notificationService.getUserNotifications(userId, limit);
        res.json({ notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to get notifications' });
    }
});

// Get unread count
router.get('/unread-count', requireAuth, (req, res) => {
    try {
        const userId = req.userId;
        const count = notificationService.getUnreadCount(userId);
        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
});

// Mark notification as read
router.patch('/:id/read', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const result = notificationService.markAsRead(id);

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
router.patch('/read-all', requireAuth, (req, res) => {
    try {
        const userId = req.userId;
        const count = notificationService.markAllAsRead(userId);
        res.json({ success: true, markedCount: count });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// Clear all notifications for user
router.delete('/clear-all', requireAuth, (req, res) => {
    try {
        const userId = req.userId;
        const db = require('../db');

        // Get all notifications for this user and delete them
        const allNotifications = db.getAll('notifications').filter(n => n.userId === userId);
        allNotifications.forEach(n => {
            db.delete('notifications', 'id', n.id);
        });

        res.json({ success: true, deletedCount: allNotifications.length });
    } catch (error) {
        console.error('Clear all notifications error:', error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

module.exports = router;
