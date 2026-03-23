// Main Server Entry Point
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');
const notificationRoutes = require('./routes/notifications');

// Initialize Firebase (for push notifications)
require('./firebase');

// Initialize MySQL database
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running', database: 'MySQL' });
});

// Socket.io Setup
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: true,
        methods: ["GET", "POST"],
        credentials: true
    }
});

let connectedUsers = 0;

io.on('connection', (socket) => {
    connectedUsers++;
    console.log(`User connected. Total: ${connectedUsers}`);
    io.emit('activeUsers', connectedUsers);

    socket.on('disconnect', () => {
        connectedUsers = Math.max(0, connectedUsers - 1);
        console.log(`User disconnected. Total: ${connectedUsers}`);
        io.emit('activeUsers', connectedUsers);
    });
});

// Start server AFTER MySQL is ready
const startServer = async () => {
    try {
        // Initialize MySQL tables
        await initDB();

        server.listen(PORT, () => {
            console.log(`
  ╔════════════════════════════════════════════╗
  ║   🔍 College Lost & Found Backend          ║
  ║   Server running on port ${PORT}              ║
  ║   API: http://localhost:${PORT}/api           ║
  ║   Database: MySQL                          ║
  ║   Socket.io: Enabled                       ║
  ╚════════════════════════════════════════════╝
  `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        console.error('   Make sure MySQL is running on localhost:3306');
        process.exit(1);
    }
};

startServer();
