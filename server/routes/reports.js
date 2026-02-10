// Reports CRUD Routes
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const notificationService = require('../services/notificationService');

// Middleware to verify token (optional - some routes are public)
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, config.JWT_SECRET);
            req.user = decoded;
        }
        next();
    } catch (error) {
        next(); // Continue even if token invalid
    }
};

// Get all reports
router.get('/', verifyToken, (req, res) => {
    try {
        const reports = db.getAll('reports').sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        res.json({ success: true, reports });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create new report
router.post('/', verifyToken, (req, res) => {
    try {
        const { item, description, location, type, date, image, contact, reportedBy, reporterEmail } = req.body;

        if (!item || !location || !type || !date) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const id = `R${Date.now()}`;
        const reporterId = req.user ? req.user.id : null;

        const newReport = db.insert('reports', {
            id,
            item,
            description: description || '',
            location,
            type,
            status: 'Pending',
            date,
            image: image || '',
            contact: contact || '',
            reportedBy: reportedBy || '',
            reporterEmail: reporterEmail || '',
            reporterId,
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ success: true, report: newReport });

        // Trigger notification to all users (async, don't wait)
        const notificationType = type === 'Lost' ? 'lost_posted' : 'found_posted';
        notificationService.broadcastNotification(
            reporterId,
            id,
            notificationType,
            { itemName: item, location }
        ).catch(err => console.error('Notification broadcast error:', err));

    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete report
router.delete('/:id', verifyToken, (req, res) => {
    try {
        const { id } = req.params;
        const deleted = db.delete('reports', 'id', id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        res.json({ success: true, message: 'Report deleted' });
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update report status
router.patch('/:id/status', verifyToken, (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Retrieved', 'Returned', 'Resolved', 'Brought Back'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const updated = db.update('reports', 'id', id, { status });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        res.json({ success: true, report: updated });

        // Notify item owner if status changed to retrieved/returned
        const retrievedStatuses = ['Retrieved', 'Returned', 'Resolved', 'Brought Back'];
        if (retrievedStatuses.includes(status) && updated.reporterId) {
            notificationService.notifyUser(
                updated.reporterId,
                id,
                'item_retrieved',
                { itemName: updated.item }
            ).catch(err => console.error('Notification error:', err));
        }

    } catch (error) {
        console.error('Update report status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
