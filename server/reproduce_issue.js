
console.log('Starting reproduction script...');
const path = require('path');
process.env.DOWNLOADS_PATH = path.join(__dirname, 'downloads');

const queueManager = require('./services/queueManager');
const downloaderService = require('./services/downloaderService');
const fs = require('fs');

// Clean up previous test
const testFile = path.join(__dirname, 'downloads', 'videos');
if (fs.existsSync(testFile)) fs.rmSync(testFile, { recursive: true, force: true });

const task = {
    url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Me at the zoo
    options: {
        isAudio: false,
        // formattedId: '137', // Optional: test with specific format if needed
    },
    title: 'Me at the zoo'
};

queueManager.on('taskUpdated', (t) => {
    console.log(`[Process] Task ${t.id} status: ${t.status} progress: ${t.progress}%`);
    if (t.status === 'completed') {
        console.log('Download completed successfully.');
        process.exit(0);
    } else if (t.status === 'failed') {
        console.error('Download failed:', t.error);
        process.exit(1);
    }
});

console.log('Adding task to queue...');
queueManager.addToQueue(task);
