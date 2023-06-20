const EventEmitter = require('events');
const EventEmitter2 = require('eventemitter2');
const ConsumersRegistry = require('./ConsumersRegistry');

class QueuedEmitter2 extends EventEmitter2 {
    constructor() {
        super();
        this.queue = [];
        this.ready = false;
        this._eventEmitter = new EventEmitter();
        this.consumers = new ConsumersRegistry(() => this._eventEmitter.emit('consumers-registry/consumers-ready'));

        this._eventEmitter.on('consumers-registry/consumers-ready', () => {
            this.processQueue();
        });
    }

    emit(event, ...args) {
        if (this.ready) {
            // If ready, emit the event immediately
            super.emit(event, ...args);
        } else {
            // If not ready, queue the event
            this.queue.push({event, args});
        }
    }

    processQueue() {
        this.ready = true;
        while(this.queue.length > 0) {
            const { event, args } = this.queue.shift();
            super.emit(event, ...args);
        }
    }
}

module.exports = QueuedEmitter2;