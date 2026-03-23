// Notification Service - handles push and in-app notifications
const { messaging, firebaseInitialized } = require('../firebase');
const db = require('../db');

// Notification templates
const templates = {
    lost_posted: (itemName, location) => ({
        title: "Lost Item Alert",
        body: `A ${itemName} was reported lost near ${location}`,
        icon: "/logo_icon.png"
    }),
    found_posted: (itemName, location) => ({
        title: "Found Item Update",
        body: `Someone found a ${itemName} near ${location}`,
        icon: "/logo_icon.png"
    }),
    item_retrieved: (itemName) => ({
        title: "Item Retrieved",
        body: `Great news! The ${itemName} has been successfully returned`,
        icon: "/logo_icon.png"
    }),
    status_update: (itemName, newStatus) => ({
        title: "Status Update",
        body: `Your reported ${itemName} status changed to: ${newStatus}`,
        icon: "/logo_icon.png"
    })
};

// Generate unique ID
const generateId = () => 'N' + Date.now() + Math.random().toString(36).substr(2, 4);

// Save notification to database (fallback + history)
const saveNotification = async (userId, itemId, type, title, body, clickAction) => {
    const notification = {
        id: generateId(),
        userId,
        itemId,
        type,
        title,
        body,
        icon: "/logo_icon.png",
        clickAction: clickAction || `/item/${itemId}`,
        isRead: 0,
        isSent: 0,
        createdAt: new Date()
    };

    await db.insert('notifications', notification);
    return notification;
};

// Send push notification via FCM
const sendPushNotification = async (userId, notification) => {
    if (!firebaseInitialized || !messaging) {
        console.log('Firebase not available, using in-app notification only');
        return false;
    }

    // Get user's device tokens
    const tokens = (await db.getAll('deviceTokens')).filter(t => t.userId === userId);

    if (tokens.length === 0) {
        console.log(`No device tokens for user ${userId}`);
        return false;
    }

    const payload = {
        notification: {
            title: notification.title,
            body: notification.body,
            icon: notification.icon
        },
        data: {
            itemId: notification.itemId || '',
            type: notification.type || '',
            clickAction: notification.clickAction || '/'
        },
        webpush: {
            fcmOptions: {
                link: notification.clickAction || '/'
            }
        }
    };

    let successCount = 0;

    for (const tokenDoc of tokens) {
        try {
            await messaging.send({
                ...payload,
                token: tokenDoc.token
            });
            successCount++;

            // Update last used timestamp
            await db.update('deviceTokens', 'id', tokenDoc.id, {
                lastUsed: new Date().toISOString()
            });
        } catch (error) {
            console.error(`FCM send error for token ${tokenDoc.id}:`, error.message);

            // Remove invalid tokens
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                await db.delete('deviceTokens', 'id', tokenDoc.id);
                console.log(`Removed invalid token: ${tokenDoc.id}`);
            }
        }
    }

    return successCount > 0;
};

// Main function to notify user
const notifyUser = async (userId, itemId, type, customData = {}) => {
    // Build notification content
    let content;
    switch (type) {
        case 'lost_posted':
            content = templates.lost_posted(customData.itemName, customData.location);
            break;
        case 'found_posted':
            content = templates.found_posted(customData.itemName, customData.location);
            break;
        case 'item_retrieved':
            content = templates.item_retrieved(customData.itemName);
            break;
        case 'status_update':
            content = templates.status_update(customData.itemName, customData.newStatus);
            break;
        default:
            content = { title: "Notification", body: "You have a new update", icon: "/logo_icon.png" };
    }

    const clickAction = `/item/${itemId}`;

    // Save to database (always)
    const notification = await saveNotification(
        userId,
        itemId,
        type,
        content.title,
        content.body,
        clickAction
    );

    // Try to send push notification (async - don't block DB save)
    sendPushNotification(userId, notification).then(sent => {
        if (sent) {
            db.update('notifications', 'id', notification.id, { isSent: true })
                .catch(err => console.error('Error updating isSent:', err));
        }
    });

    return notification;
};

// Broadcast notification to ALL users (Parallel and Exclution logic fixed)
const broadcastNotification = async (excludeUserId, itemId, type, customData = {}) => {
    const allUsers = await db.getAll('users');
    
    // Filter out the excluded user (don't notify yourself)
    const targetUsers = allUsers.filter(user => user.id !== excludeUserId);

    console.log(`🚀 Broadcasting ${type} to ${targetUsers.length} users (excluding ${excludeUserId})`);

    // Use Promise.all to run in parallel + catch individual errors within map
    const promises = targetUsers.map(user => 
        notifyUser(user.id, itemId, type, customData)
            .catch(err => {
                console.error(`Failed to notify ${user.id}:`, err.message);
                return null;
            })
    );

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r !== null).length;

    console.log(`✅ Broadcast complete: ${successCount}/${targetUsers.length} notifications created`);
    return results.filter(r => r !== null);
};

// Get unread count for user
const getUnreadCount = async (userId) => {
    const { pool } = require('../db');
    const [rows] = await pool.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
        [userId]
    );
    return rows[0].count;
};

// Get user notifications (using DB utility for cleaner code)
const getUserNotifications = async (userId, limit = 50) => {
    const { pool, toCamelCase } = require('../db');
    const [rows] = await pool.query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, limit]
    );
    return rows.map(row => toCamelCase(row));
};

// Mark notification as read
const markAsRead = async (notificationId) => {
    return await db.update('notifications', 'id', notificationId, { isRead: 1 });
};

// Mark all as read for user
const markAllAsRead = async (userId) => {
    const { pool } = require('../db');
    const [result] = await pool.query(
        'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
        [userId]
    );
    return result.affectedRows;
};

module.exports = {
    notifyUser,
    broadcastNotification,
    getUnreadCount,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    saveNotification
};
