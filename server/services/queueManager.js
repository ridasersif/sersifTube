const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class QueueManager extends EventEmitter {
    constructor() {
        super();
        this.queue = [];
        this.active = new Map();
        this.paused = new Map();
        this.completed = new Map();
        this.maxConcurrent = 3;
    }

    addToQueue(item) {
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
            this.emit('startDownload', task);
        } catch (error) {
            console.error('[QUEUE] Error starting download:', error);
        }
    }

    updateProgress(id, progressData) {
        const task = this.active.get(id);
        if (task) {
            task.progress = progressData.progress;
            task.status = 'downloading';
            Object.assign(task, progressData);
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
            this.completed.set(id, task);
            this.emit('taskUpdated', task);
            this.processQueue();
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
        const queueIndex = this.queue.findIndex(t => t.id === id);
        if (queueIndex !== -1) {
            const task = this.queue[queueIndex];
            task.status = 'cancelled';
            this.queue.splice(queueIndex, 1);
            this.emit('taskUpdated', task);
            return true;
        }

        if (this.active.has(id)) {
            const task = this.active.get(id);
            this.emit('stopDownload', id);
            task.status = 'cancelled';
            this.active.delete(id);
            this.emit('taskUpdated', task);
            this.processQueue();
            return true;
        }

        if (this.paused.has(id)) {
            const task = this.paused.get(id);
            task.status = 'cancelled';
            this.paused.delete(id);
            this.emit('taskUpdated', task);
            return true;
        }

        return false;
    }

    deleteTask(id) {
        if (this.completed.has(id)) {
            this.completed.delete(id);
            this.emit('taskDeleted', id);
            return true;
        }
        return false;
    }

    pauseTask(id) {
        if (this.active.has(id)) {
            const task = this.active.get(id);
            this.emit('stopDownload', id);

            task.status = 'paused';
            this.active.delete(id);
            this.paused.set(id, task);

            this.emit('taskUpdated', task);
            this.processQueue();
            return true;
        }
        return false;
    }

    resumeTask(id) {
        if (this.paused.has(id)) {
            const task = this.paused.get(id);
            this.paused.delete(id);

            task.status = 'queued';
            this.queue.unshift(task);
            this.emit('taskUpdated', task);
            this.processQueue();
            return true;
        }
        return false;
    }

    getAllTasks() {
        return {
            queue: this.queue,
            active: Array.from(this.active.values()),
            paused: Array.from(this.paused.values()),
            completed: Array.from(this.completed.values())
        };
    }
}

module.exports = new QueueManager();
