// Reports CRUD Routes
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const notificationService = require('../services/notificationService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage config - save to /public/uploads/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mime = allowedTypes.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

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
router.get('/', verifyToken, async (req, res) => {
    try {
        const reports = (await db.getAll('reports')).sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        res.json({ success: true, reports });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create new report (supports both file upload AND base64 fallback)
router.post('/', verifyToken, upload.single('imageFile'), async (req, res) => {
    try {
        const { item, description, location, type, date, image, contact, reportedBy, reporterEmail, category } = req.body;

        if (!item || !location || !type || !date) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const id = `R${Date.now()}`;
        const reporterId = req.user ? req.user.id : null;

        // Determine image URL
        let imageUrl = '';
        if (req.file) {
            // File was uploaded via multer → store the URL
            imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        } else if (image) {
            // Fallback: base64 string was sent (backward compatibility)
            imageUrl = image;
        }

        await db.insert('reports', {
            id,
            item,
            description: description || '',
            location,
            type,
            status: 'PendingApproval',
            date,
            image: imageUrl,
            contact: contact || '',
            category: category || '',
            reportedBy: reportedBy || '',
            reporterEmail: reporterEmail || '',
            reporterId,
            createdAt: new Date()
        });

        const newReport = await db.getOne('reports', 'id', id);

        res.status(201).json({ success: true, report: newReport });

    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete report (soft-delete: mark as Rejected instead of removing)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await db.update('reports', 'id', id, { status: 'Rejected' });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        res.json({ success: true, message: 'Report rejected' });

        // Notify reporter of rejection
        if (updated.reporterId) {
            notificationService.notifyUser(
                updated.reporterId,
                id,
                'report_rejected',
                { itemName: updated.item }
            ).catch(err => console.error('Notification error:', err));
        }
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update report status
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['PendingApproval', 'Pending', 'Rejected', 'Retrieved', 'Returned', 'Resolved', 'Brought Back'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const updated = await db.update('reports', 'id', id, { status });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        res.json({ success: true, report: updated });

        if (status === 'Pending') {
            // It has been approved by admin, broadcast it to all users
            const notificationType = updated.type === 'Lost' ? 'lost_posted' : 'found_posted';
            notificationService.broadcastNotification(
                updated.reporterId,
                id,
                notificationType,
                { itemName: updated.item, location: updated.location }
            ).catch(err => console.error('Notification broadcast error:', err));

            // Notify the reporter that their item was approved
            if (updated.reporterId) {
                notificationService.notifyUser(
                    updated.reporterId,
                    id,
                    'report_approved',
                    { itemName: updated.item }
                ).catch(err => console.error('Notification error:', err));
            }
        } else if (status === 'Rejected') {
            // Admin rejected from the "Approve/Reject" flow
            if (updated.reporterId) {
                notificationService.notifyUser(
                    updated.reporterId,
                    id,
                    'report_rejected',
                    { itemName: updated.item }
                ).catch(err => console.error('Notification error:', err));
            }
        }

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
