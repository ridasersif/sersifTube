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
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// ==========================
// SOCKET EVENTS
// ==========================
queueManager.on('taskUpdated', (task) => {
    io.emit('progress', task);
});

queueManager.on('taskAdded', (task) => {
    io.emit('taskAdded', task);
});

queueManager.on('taskDeleted', (id) => {
    io.emit('taskDeleted', { id });
});

// ==========================
// API ROUTES
// ==========================

app.post('/api/info', async (req, res) => {
    const { url } = req.body;
    try {
        const info = await getInfo(url);
        res.json(info);
    } catch (error) {
        console.error('[SERVER] /api/info error:', error);
        res.status(500).json({ error: 'Failed to fetch video info', details: error.message });
    }
});

app.get('/api/queue', (req, res) => {
    res.json(queueManager.getAllTasks());
});

app.post('/api/download', async (req, res) => {
    const { url, options } = req.body;
    // Options: { id, isAudio, formatId, outputPath, isPlaylist }

    console.log('[SERVER] Download request:', url);

    try {
        if (options.isPlaylist === true) {
            // We need to fetch metadata to get all entries
            // The frontend might have sent basic metadata, but we need full list
            const info = await getInfo(url);

            if (!info.entries || info.entries.length === 0) {
                return res.status(400).json({ error: 'Empty playlist or unable to fetch entries' });
            }

            const tasks = [];
            info.entries.forEach((entry, index) => {
                // Create a task for each video
                const task = queueManager.addToQueue({
                    url: entry.url || `https://www.youtube.com/watch?v=${entry.id}`,
                    title: entry.title,
                    thumbnail: entry.thumbnail,
                    playlistId: options.id,
                    playlistTitle: info.title, // Pass playlist title
                    options: {
                        ...options,
                        isPlaylist: false,
                        id: undefined
                    }
                });
                tasks.push(task);
            });

            res.json({ message: 'Playlist added to queue', tasks });
        } else {
            // Single video
            const task = queueManager.addToQueue({
                url,
                title: options.title || 'Unknown Video', // Frontend should ideally pass title
                options
            });
            res.json({ message: 'Added to queue', taskId: task.id });
        }
    } catch (error) {
        console.error('[SERVER] Download failed:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/cancel', (req, res) => {
    const { id } = req.body;
    const success = queueManager.cancelTask(id);
    if (success) res.json({ message: 'Cancelled' });
    else res.status(404).json({ error: 'Task not found or already completed' });
});

app.post('/api/delete-file', (req, res) => {
    // Delete the file from disk + remove from history
    const { id, path: filePath } = req.body;

    // Attempt to delete physical file if path provided
    if (filePath) {
        try {
            deleteFile(filePath);
        } catch (e) {
            console.error('File delete error:', e);
        }
    }

    // Remove from queue history
    queueManager.deleteTask(id);
    res.json({ message: 'Deleted' });
});


// Folder Picker (Disabled in Docker)
app.post('/api/browse', (req, res) => {
    if (process.env.DOCKER_MODE === 'true') {
        return res.json({ path: '/app/downloads' }); // Default docker path
    }

    const { exec } = require('child_process');
    const scriptPath = path.join(__dirname, 'folder-picker.ps1');
    const cmd = `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`;

    console.log('[SERVER] Opening folder picker...');
    exec(cmd, { timeout: 60000 }, (error, stdout, stderr) => {
        if (error) {
            console.error('[SERVER] Folder picker error:', error.message);
            return res.status(500).json({ error: 'Failed' });
        }
        res.json({ path: stdout.trim() });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
