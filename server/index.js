const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const queueManager = require('./src/services/queueManager'); // Updated path
const apiRoutes = require('./src/routes/apiRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// ==========================
// SOCKET EVENTS
// ==========================
queueManager.on('taskUpdated', (task) => io.emit('progress', task));
queueManager.on('taskAdded', (task) => io.emit('taskAdded', task));
queueManager.on('taskDeleted', (id) => io.emit('taskDeleted', { id }));

// ==========================
// API ROUTES
// ==========================
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Error: Port ${PORT} is already in use.`);
        console.error(`Try running: npx kill-port ${PORT}`);
        process.exit(1);
    } else {
        console.error('Server error:', error);
    }
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
