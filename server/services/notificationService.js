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
const saveNotification = (userId, itemId, type, title, body, clickAction) => {
    const notification = {
        id: generateId(),
        userId,
        itemId,
        type,
        title,
        body,
        icon: "/logo_icon.png",
        clickAction: clickAction || `/item/${itemId}`,
        isRead: false,
        isSent: false,
        createdAt: new Date().toISOString()
    };

    db.insert('notifications', notification);
    return notification;
};

// Send push notification via FCM
const sendPushNotification = async (userId, notification) => {
    if (!firebaseInitialized || !messaging) {
        console.log('Firebase not available, using in-app notification only');
        return false;
    }

    // Get user's device tokens
    const tokens = db.getAll('deviceTokens').filter(t => t.userId === userId);

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
            db.update('deviceTokens', 'id', tokenDoc.id, {
                lastUsed: new Date().toISOString()
            });
        } catch (error) {
            console.error(`FCM send error for token ${tokenDoc.id}:`, error.message);

            // Remove invalid tokens
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                db.delete('deviceTokens', 'id', tokenDoc.id);
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
    const notification = saveNotification(
        userId,
        itemId,
        type,
        content.title,
        content.body,
        clickAction
    );

    // Try to send push notification
    const sent = await sendPushNotification(userId, notification);

    // Update sent status
    if (sent) {
        db.update('notifications', 'id', notification.id, { isSent: true });
    }

    return notification;
};

// Broadcast notification to ALL users (for testing, includes sender)
const broadcastNotification = async (excludeUserId, itemId, type, customData = {}) => {
    const allUsers = db.getAll('users');
    const results = [];

    console.log(`Broadcasting ${type} notification to ${allUsers.length} users`);

    for (const user of allUsers) {
        // For now, notify ALL users including the sender (for testing)
        try {
            const result = await notifyUser(user.id, itemId, type, customData);
            results.push(result);
            console.log(`Notification created for user ${user.id}: ${result.title}`);
        } catch (error) {
            console.error(`Failed to notify user ${user.id}:`, error.message);
        }
    }

    console.log(`Broadcast complete: ${results.length} notifications created`);
    return results;
};

// Get unread count for user
const getUnreadCount = (userId) => {
    const notifications = db.getAll('notifications').filter(
        n => n.userId === userId && !n.isRead
    );
    return notifications.length;
};

// Get user notifications
const getUserNotifications = (userId, limit = 50) => {
    const notifications = db.getAll('notifications')
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
    return notifications;
};

// Mark notification as read
const markAsRead = (notificationId) => {
    return db.update('notifications', 'id', notificationId, { isRead: true });
};

// Mark all as read for user
const markAllAsRead = (userId) => {
    const notifications = db.getAll('notifications').filter(
        n => n.userId === userId && !n.isRead
    );

    notifications.forEach(n => {
        db.update('notifications', 'id', n.id, { isRead: true });
    });

    return notifications.length;
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
