const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { getInfo, deleteFile } = require('./services/downloaderService');
const queueManager = require('./services/queueManager');
const path = require('path');
const fs = require('fs');

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

app.post('/api/info', async (req, res) => {
    try {
        const info = await getInfo(req.body.url);
        res.json(info);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/queue', (req, res) => res.json(queueManager.getAllTasks()));

app.post('/api/download', async (req, res) => {
    const { url, options } = req.body;
    try {
        if (options.isPlaylist === true) {
            const info = await getInfo(url);
            if (!info.entries) return res.status(400).json({ error: 'Playlist empty' });

            info.entries.forEach(entry => {
                queueManager.addToQueue({
                    url: entry.url,
                    title: entry.title,
                    thumbnail: entry.thumbnail,
                    playlistTitle: info.title,
                    options: { ...options, isPlaylist: false }
                });
            });
            res.json({ message: 'Playlist queued' });
        } else {
            queueManager.addToQueue({ url, title: options.title, options });
            res.json({ message: 'Queued' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/cancel', (req, res) => {
    queueManager.cancelTask(req.body.id);
    res.json({ message: 'Cancelled' });
});

app.post('/api/pause', (req, res) => {
    queueManager.pauseTask(req.body.id);
    res.json({ message: 'Paused' });
});

app.post('/api/resume', (req, res) => {
    queueManager.resumeTask(req.body.id);
    res.json({ message: 'Resumed' });
});

app.post('/api/delete-file', (req, res) => {
    if (req.body.path) deleteFile(req.body.path);
    queueManager.deleteTask(req.body.id);
    res.json({ message: 'Deleted' });
});

app.post('/api/browse', (req, res) => {
    if (process.env.DOCKER_MODE === 'true') return res.json({ path: '/downloads' });
    const { exec } = require('child_process');
    const scriptPath = path.join(__dirname, 'folder-picker.ps1');
    exec(`powershell.exe -File "${scriptPath}"`, (err, stdout) => {
        res.json({ path: stdout?.trim() });
    });
});

// STREAMING ENDPOINT for Video Player
app.get('/api/stream', (req, res) => {
    const videoPath = req.query.path;
    if (!videoPath || !fs.existsSync(videoPath)) return res.status(404).send('Not found');

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
