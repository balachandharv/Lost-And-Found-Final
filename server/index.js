// Main Server Entry Point
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');

// Initialize database (this creates tables on first run)
require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // React dev server
    credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Socket.io Setup
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
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

// Start server
server.listen(PORT, () => {
    console.log(`
  ╔════════════════════════════════════════════╗
  ║   🔍 College Lost & Found Backend          ║
  ║   Server running on port ${PORT}              ║
  ║   API: http://localhost:${PORT}/api           ║
  ║   Socket.io: Enabled                       ║
  ╚════════════════════════════════════════════╝
  `);
});
