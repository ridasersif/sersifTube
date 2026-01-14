const { create } = require('yt-dlp-exec');
const path = require('path');
const fs = require('fs');
const os = require('os');
const queueManager = require('./queueManager');

// ==========================
// PATHS & INIT
// ==========================
const DOWNLOADS_ROOT = process.env.DOWNLOADS_PATH || path.join(os.homedir(), 'Downloads', 'sersifTube');
const VIDEOS_DIR = path.join(DOWNLOADS_ROOT, 'videos');
const AUDIOS_DIR = path.join(DOWNLOADS_ROOT, 'audios');
const PLAYLISTS_DIR = path.join(DOWNLOADS_ROOT, 'playlists');
const ARCHIVE_DIR = path.join(__dirname, '../archive');

// Ensure dirs
[DOWNLOADS_ROOT, VIDEOS_DIR, AUDIOS_DIR, PLAYLISTS_DIR, ARCHIVE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const ytdlp = create('yt-dlp');
const FFMPEG_PATH = process.env.FFMPEG_PATH || (os.platform() === 'win32' ? path.join(__dirname, '../bin/ffmpeg.exe') : 'ffmpeg');

// Store active processes
const activeProcesses = new Map();

// Helper to sanitize filenames/dirs
const sanitize = (str) => {
    return (str || 'Unknown').replace(/[<>:"/\\|?*]+/g, '_').trim();
};

// ==========================
// METADATA
// ==========================
const getInfo = async (url) => {
    console.log('[INFO] Fetching metadata for:', url);
    try {
        const info = await ytdlp(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificates: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot']
        });

        const isPlaylist = info._type === 'playlist' || (info.entries && info.entries.length > 0);

        return {
            id: info.id,
            title: info.title || 'Unknown',
            thumbnail: info.thumbnail,
            uploader: info.uploader,
            duration: info.duration,
            is_playlist: isPlaylist,
            entries: isPlaylist ? info.entries.map(e => ({
                id: e.id,
                title: e.title,
                url: e.url || `https://www.youtube.com/watch?v=${e.id}`, // Ensure we have a URL
                thumbnail: e.thumbnail,
                duration: e.duration
            })) : null,
            formats: !isPlaylist ? (info.formats || [])
                .filter(f => f.vcodec !== 'none')
                .map(f => ({
                    format_id: f.format_id,
                    resolution: f.height ? `${f.height}p` : 'audio',
                    ext: f.ext,
                    filesize: f.filesize
                })) : []
        };
    } catch (e) {
        throw new Error(e.message);
    }
};

// ==========================
// DOWNLOAD HANDLER
// ==========================
queueManager.on('startDownload', async (task) => {
    console.log('[DOWNLOAD] Starting task:', task.id, task.title);

    const { id, url, options, playlistTitle } = task;
    const { isAudio, formatId, customPath } = options || {};

    let targetDir;

    if (customPath) {
        targetDir = customPath;
    } else if (playlistTitle) {
        // It's part of a playlist
        targetDir = path.join(PLAYLISTS_DIR, sanitize(playlistTitle));
    } else {
        // Individual file
        targetDir = isAudio ? AUDIOS_DIR : VIDEOS_DIR;
    }

    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Use a simpler filename to avoid issues
    const outputTemplate = path.join(targetDir, `${id}_%(title)s.%(ext)s`);

    const ytdlpOptions = {
        output: outputTemplate,
        newline: true,
        noCheckCertificates: true,
        addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
        ffmpegLocation: FFMPEG_PATH,
        noPlaylist: true
    };

    if (isAudio) {
        ytdlpOptions.extractAudio = true;
        ytdlpOptions.audioFormat = 'mp3';
    } else {
        ytdlpOptions.format = formatId ? `${formatId}+bestaudio[ext=m4a]/bestaudio/best` : 'bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best';
        ytdlpOptions.mergeOutputFormat = 'mp4';
    }

    try {
        const process = ytdlp.exec(url, ytdlpOptions);
        activeProcesses.set(id, process);

        process.stdout.on('data', (data) => {
            const msg = data.toString();
            const progressMatch = msg.match(/(\d+\.\d+)%/);
            if (progressMatch) {
                queueManager.updateProgress(id, {
                    progress: parseFloat(progressMatch[1])
                });
            }
        });

        const exitCode = await new Promise((resolve, reject) => {
            process.on('close', resolve);
            process.on('error', reject);
        });

        activeProcesses.delete(id);

        if (exitCode === 0) {
            queueManager.completeTask(id, { path: outputTemplate });
        } else {
            console.error('[DOWNLOAD] Process exited with code', exitCode);
            if (task.status !== 'cancelled') {
                queueManager.failTask(id, new Error(`Process exited with code ${exitCode}`));
            }
        }

    } catch (err) {
        activeProcesses.delete(id);
        console.error('[DOWNLOAD] Error:', err);
        queueManager.failTask(id, err);
    }
});

queueManager.on('stopDownload', (id) => {
    const process = activeProcesses.get(id);
    if (process) {
        console.log('[DOWNLOAD] Killing process for task:', id);
        process.kill('SIGTERM');
        activeProcesses.delete(id);
    }
});

const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
};

module.exports = {
    getInfo,
    deleteFile
};
