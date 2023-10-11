
class Logger {
    constructor(logger, silentMode=false) {
        this.logger     = logger;
        this.silentMode = silentMode;
    }

    log() {
        if (!this.silentMode) {
            this.logger.log(...arguments);
        }
    }

    error() {
        if (!this.silentMode) {
            this.logger.error(...arguments);
        }
    }

    trace() {
        this.logger.log('trace not implemented'); // trace will anyways not give a full stacktrace
    }
}

module.exports = Logger;