const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class QueueManager extends EventEmitter {
    constructor() {
        super();
        this.queue = [];
        this.active = new Map();
        this.completed = new Map(); // Store history if needed, or just let frontend handle it
        this.maxConcurrent = 3; // Allow 3 concurrent downloads
    }

    addToQueue(item) {
        // item: { url, options: { isAudio, formatId, path, ... }, metadata }
        const id = uuidv4();
        const task = {
            id,
            status: 'queued',
            progress: 0,
            addedAt: Date.now(),
            ...item
        };

        this.queue.push(task);
        this.emit('taskAdded', task);
        this.processQueue();
        return task;
    }

    async processQueue() {
        if (this.active.size >= this.maxConcurrent) return;
        if (this.queue.length === 0) return;

        const task = this.queue.shift();
        this.active.set(task.id, task);

        task.status = 'starting';
        this.emit('taskUpdated', task);

        try {
            // We expect a downloader function to be passed or attached
            // For now, we emit an event that the service listens to
            this.emit('startDownload', task);
        } catch (error) {
            this.handleError(task.id, error);
        }
    }

    updateProgress(id, progressData) {
        // progressData: { progress, speed, eta, etc. }
        const task = this.active.get(id);
        if (task) {
            task.progress = progressData.progress;
            task.status = 'downloading';
            Object.assign(task, progressData); // Merge other stats
            this.emit('taskUpdated', task);
        }
    }

    completeTask(id, result = {}) {
        const task = this.active.get(id);
        if (task) {
            task.status = 'completed';
            task.completedAt = Date.now();
            task.result = result;
            this.active.delete(id);
            this.completed.set(id, task); // Optional: keep history
            this.emit('taskUpdated', task);
            this.processQueue(); // Start next
        }
    }

    failTask(id, error) {
        const task = this.active.get(id);
        if (task) {
            task.status = 'failed';
            task.error = error.message || error;
            this.active.delete(id);
            this.completed.set(id, task);
            this.emit('taskUpdated', task);
            this.processQueue();
        }
    }

    cancelTask(id) {
        // If in queue
        const queueIndex = this.queue.findIndex(t => t.id === id);
        if (queueIndex !== -1) {
            const task = this.queue[queueIndex];
            task.status = 'cancelled';
            this.queue.splice(queueIndex, 1);
            this.emit('taskUpdated', task);
            return true;
        }

        // If active
        if (this.active.has(id)) {
            const task = this.active.get(id);
            // Emitting 'cancel' event for the service to kill the process
            this.emit('stopDownload', id);

            task.status = 'cancelled';
            this.active.delete(id);
            this.emit('taskUpdated', task);
            this.processQueue();
            return true;
        }

        return false;
    }

    deleteTask(id) {
        // Just remove from history/state
        if (this.completed.has(id)) {
            this.completed.delete(id);
            this.emit('taskDeleted', id);
            return true;
        }
        return false;
    }

    getAllTasks() {
        return {
            queue: this.queue,
            active: Array.from(this.active.values()),
            completed: Array.from(this.completed.values())
        };
    }
}

module.exports = new QueueManager();
