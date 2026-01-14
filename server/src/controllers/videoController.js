const { getInfo, deleteFile } = require('../services/downloaderService');
const queueManager = require('../services/queueManager');
const fs = require('fs');
const path = require('path');

exports.getInfo = async (req, res) => {
    try {
        const info = await getInfo(req.body.url);
        res.json(info);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getQueue = (req, res) => res.json(queueManager.getAllTasks());

exports.addToQueue = async (req, res) => {
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
};

exports.cancelTask = (req, res) => {
    queueManager.cancelTask(req.body.id);
    res.json({ message: 'Cancelled' });
};

exports.pauseTask = (req, res) => {
    queueManager.pauseTask(req.body.id);
    res.json({ message: 'Paused' });
};

exports.resumeTask = (req, res) => {
    queueManager.resumeTask(req.body.id);
    res.json({ message: 'Resumed' });
};

exports.deleteTask = (req, res) => {
    if (req.body.path) deleteFile(req.body.path);
    queueManager.deleteTask(req.body.id);
    res.json({ message: 'Deleted' });
};

exports.streamVideo = (req, res) => {
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
};
