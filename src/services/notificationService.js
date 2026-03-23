// Frontend Notification Service
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration - Replace with your actual config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBj4Brq1P8a8tIL4nRjA1eLI6ryElgSBTQ",
    authDomain: "campuslostfound-45b13.firebaseapp.com",
    projectId: "campuslostfound-45b13",
    storageBucket: "campuslostfound-45b13.firebasestorage.app",
    messagingSenderId: "654876539368",
    appId: "1:654876539368:web:1f0401d199dccf13fe0c5d"
};

// Your VAPID key from Firebase Console > Cloud Messaging > Web Push certificates
const VAPID_KEY = "BNDhKYV1FPd32T4YNvCyUOGyTrJp4Ezz12yf1ba4kYNxd5Fc6au8sOb2_SwPRwEwkuCjoQjq_jEremVrEGsl1fY";

let app = null;
let messaging = null;

// Initialize Firebase
const initFirebase = () => {
    if (!app) {
        try {
            app = initializeApp(firebaseConfig);
            messaging = getMessaging(app);
            console.log('Firebase initialized for notifications');
        } catch (error) {
            console.error('Firebase initialization error:', error);
        }
    }
    return messaging;
};

// Request notification permission
export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted');
            return true;
        } else {
            console.log('Notification permission denied');
            return false;
        }
    } catch (error) {
        console.error('Permission request error:', error);
        return false;
    }
};

// Get FCM token for this device
export const getFCMToken = async () => {
    try {
        const msg = initFirebase();
        if (!msg) return null;

        // Register service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        const token = await getToken(msg, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        if (token) {
            console.log('FCM Token:', token);
            return token;
        } else {
            console.log('No FCM token available');
            return null;
        }
    } catch (error) {
        console.error('Get FCM token error:', error);
        return null;
    }
};

// Register token with backend
export const registerTokenWithBackend = async (userId, token) => {
    try {
        const authToken = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/notifications/register-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken ? `Bearer ${authToken}` : ''
            },
            body: JSON.stringify({
                token,
                device: /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
                browser: navigator.userAgent.split(' ').pop()
            })
        });

        const data = await response.json();
        console.log('Token registered:', data);
        return data.success;
    } catch (error) {
        console.error('Token registration error:', error);
        return false;
    }
};

// Unregister token (on logout)
export const unregisterToken = async (userId, token) => {
    try {
        const authToken = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/notifications/unregister-token', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken ? `Bearer ${authToken}` : ''
            },
            body: JSON.stringify({ token })
        });

        return response.ok;
    } catch (error) {
        console.error('Token unregister error:', error);
        return false;
    }
};

// Listen for foreground messages
export const onForegroundMessage = (callback) => {
    const msg = initFirebase();
    if (!msg) return () => { };

    return onMessage(msg, (payload) => {
        console.log('Foreground message received:', payload);
        callback(payload);
    });
};

// Fetch notifications from backend
export const getNotifications = async (userId) => {
    try {
        const authToken = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/notifications', {
            headers: { 'Authorization': authToken ? `Bearer ${authToken}` : '' }
        });
        const data = await response.json();
        return data.notifications || [];
    } catch (error) {
        console.error('Get notifications error:', error);
        return [];
    }
};

// Get unread count
export const getUnreadCount = async (userId) => {
    try {
        const authToken = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/notifications/unread-count', {
            headers: { 'Authorization': authToken ? `Bearer ${authToken}` : '' }
        });
        const data = await response.json();
        return data.count || 0;
    } catch (error) {
        console.error('Get unread count error:', error);
        return 0;
    }
};

// Mark notification as read
export const markAsRead = async (userId, notificationId) => {
    try {
        const authToken = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': authToken ? `Bearer ${authToken}` : '' }
        });
        return response.ok;
    } catch (error) {
        console.error('Mark as read error:', error);
        return false;
    }
};

// Mark all as read
export const markAllAsRead = async (userId) => {
    try {
        const authToken = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/notifications/read-all', {
            method: 'PATCH',
            headers: { 'Authorization': authToken ? `Bearer ${authToken}` : '' }
        });
        return response.ok;
    } catch (error) {
        console.error('Mark all as read error:', error);
        return false;
    }
};

// Setup notifications after login
export const setupNotifications = async (userId) => {
    // Check if notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        console.log('Push notifications not supported');
        return false;
    }

    // Request permission
    const permitted = await requestNotificationPermission();
    if (!permitted) return false;

    // Get FCM token
    const token = await getFCMToken();
    if (!token) return false;

    // Register with backend
    await registerTokenWithBackend(userId, token);

    // Store token in localStorage for logout cleanup
    localStorage.setItem('fcmToken', token);

    return true;
};

// Clear all notifications
export const clearAllNotifications = async (userId) => {
    try {
        const authToken = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/notifications/clear-all', {
            method: 'DELETE',
            headers: { 'Authorization': authToken ? `Bearer ${authToken}` : '' }
        });
        return response.ok;
    } catch (error) {
        console.error('Clear all notifications error:', error);
        return false;
    }
};
