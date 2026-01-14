const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const systemController = require('../controllers/systemController');

// Video Routes
router.post('/info', videoController.getInfo);
router.get('/queue', videoController.getQueue);
router.post('/download', videoController.addToQueue);
router.post('/cancel', videoController.cancelTask);
router.post('/pause', videoController.pauseTask);
router.post('/resume', videoController.resumeTask);
router.post('/delete-file', videoController.deleteTask);
router.get('/stream', videoController.streamVideo);

// System Routes
router.post('/browse', systemController.browseFolder);

module.exports = router;
