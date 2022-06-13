
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
            this.logger.log(...arguments);
        }
    }
}

module.exports = Logger;