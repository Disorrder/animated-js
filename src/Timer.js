export default class Timer {
    constructor() {
        this.stop();
    }

    start() {
        this.startTime = performance.now();;
        this.time = this.startTime;
        this.dt = 0;
    }

    stop() {
        this.startTime = 0;
        this.time = 0;
        this.dt = 0;
    }

    setTime(time) {
        this.dt = time - this.time;
        this.time = time;
    }
}
