class Logger {
    constructor(logger, silentMode = false) {
        this.logger = logger;
        this.silentMode = silentMode;
    }

    formatTimestamp() {
        const date = new Date();
        return date.toISOString() + ' (' + date.getTime() + '): ';
    }

    log() {
        if (!this.silentMode) {
            const timestamp = this.formatTimestamp();
            this.logger.log(timestamp, ...arguments);
        }
    }

    error() {
        if (!this.silentMode) {
            const timestamp = this.formatTimestamp();
            this.logger.error(timestamp, ...arguments);
        }
    }

    trace() {
        this.logger.log('trace not implemented'); // trace will anyways not give a full stacktrace
    }
}

module.exports = Logger;
