class ConsumersRegistry {
    constructor(notifyFunction) {
        this._consumers = new Map();
        this._notifyFunction = notifyFunction;
    }

    register(consumer) {
        this._consumers.set(consumer, false);
    }

    unregister(consumer) {
        this._consumers.delete(consumer);
    }

    clear() {
        this._consumers = new Map();
    }

    areAllReady() {
        return Array.from(this._consumers.values()).every((value) => value); // if no consumear this will also return true
    }

    ready(consumer) {
        this._consumers.set(consumer, true);
        if (this.areAllReady()) {
            this._notifyFunction();
        }
    }

    get consumers() {
        return this._consumers;
    }
}

module.exports = ConsumersRegistry;
