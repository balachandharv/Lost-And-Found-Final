// Firebase Admin SDK initialization
const admin = require('firebase-admin');
const path = require('path');

// Load service account credentials
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

let firebaseInitialized = false;

try {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    firebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error.message);
    console.log('Push notifications will be disabled. In-app notifications will still work.');
}

const messaging = firebaseInitialized ? admin.messaging() : null;

module.exports = { admin, messaging, firebaseInitialized };
