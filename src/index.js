import EventEmitter from './EventEmitter';
import easing from './easing';

export default class Animated {
    static get version() { return VERSION; }
    static get easing() { return easing; }

    constructor(options = {}) {
        this.active = false;
        this.__name = options.name;

        this.keyframes = [];

        this.time = 0;
        this.timeEnd = 0;
        this.timeScale = options.timeScale || 1;
        this.repeat = options.repeat || 1;
        this.duration = 0;

        setTimeout(this.startAnimationLoop.bind(this));
    }

    get lastKeyframe() {
        return this.keyframes[this.keyframes.length-1] || null;
    }

    startAnimationLoop() {
        this._tickBound = this._tick.bind(this);
        requestAnimationFrame((time) => {
            this._lastTick = time;
            this._tick(time);
        });
    }

    _tick(time = this._lastTick) {
        requestAnimationFrame(this._tickBound);
        this._update(time - this._lastTick || 16);
        this._lastTick = time;
    }

    add(frame) {
        if (frame instanceof Animated) {
            frame.keyframes.forEach((v) => this._addFrame(v));
        } else {
            this._addFrame(frame);
        }
        return this;
    }

    _addFrame(frame) { // private and only for frames
        if (frame.delay == null) frame.delay = 0;
        if (frame.duration == null) frame.duration = 1000;
        if (frame.repeat == null) frame.repeat = 1;
        if (frame.easing == null) frame.easing = Animated.easing.QuadraticIn;
        // if (frame.animate && !Array.isArray(frame.animate)) frame.animate = [frame.animate];
        this._timeline = this;

        this.keyframes.push(frame);
    }

    checkFrames() {
        this.keyframes.forEach((frame, i) => {
            var prevKeyframe = this.keyframes[i-1] || {};
            var startTime = prevKeyframe._endTime || 0;
            if (frame.offset != null) startTime = frame.offset;
            if (frame.offset === 'prev') startTime = prevKeyframe._startTime || 0;
            if (frame.delay) startTime += frame.delay;
            frame._startTime = startTime;
            frame._endTime = startTime + frame.duration * frame.repeat;
            frame._began = false;
            frame._completed = false;

            this.duration = Math.max(frame._endTime, this.duration);
        });

        this.startTime = this.keyframes[0]._startTime;
        this.endTime = this.startTime + this.duration; // this.lastKeyframe._endTime;
    }

    play() {
        this.checkFrames();
        this.active = true;
        this.fire('play');
        return this;
    }

    pause() {
        this.active = false;
        this.fire('pause');
        return this;
    }

    stop() {
        this.active = false;
        this.fire('stop');
        this.time = 0;
        this.keyframes.forEach((frame) => {
            frame._began = false;
            frame._completed = false;
        });
        return this;
    }

    replay() {
        this.keyframes.forEach((frame) => {
            frame._began = false;
            frame._completed = false;
        });
        this.active = true;
        this.time = 0;
        this.fire('replay');
        return this;
    }

    moveTo(time) {
        return this;
    }

    _update(dt = 0) {
        if (!this.active) return;
        dt *= this.timeScale;
        // increment time here?

        this.keyframes.forEach((frame) => {
            if (frame._completed) return;
            if (this.time >= frame._startTime) {
                if (!frame._began) this._begin(frame);
                if (this.time <= frame._endTime) this._run(frame);
            }

            if (this.time > frame._endTime) {
                if (frame._began && !frame._completed) this._complete(frame);
            }
        });

        if (this.time <= 0) {
            this.fire('begin');
        }
        this.fire('update', dt);

        if (this.time >= this.endTime) {
            this.repeat--;
            if (this.repeat) {
                return this.replay();
            }
            this.stop();
            this.fire('complete');
            return;
        }

        this.time += dt;
    }

    _begin(frame) {
        if (frame.preCalculate) frame.preCalculate(frame);
        if (frame.animate) {
            frame.animate.forEach((anim) => {
                anim._target = typeof anim.target === 'function' ? anim.target() : anim.target;
                if (!anim._target) return console.warn('Animation target is not defined', anim, frame, this);
                if (!anim.from) anim.from = {};
                anim._delta = {};
                if (anim.by) Object.assign(anim._delta, anim.delta);
                for (let k in anim.to || {}) {
                    let from = anim.from[k] != null ? anim.from[k] : anim._target[k];
                    anim._delta[k] = anim.to[k] - from;
                }
            });
        }
        frame._began = true;
        if (frame.begin) frame.begin(frame);
    }

    _run(frame) {
        frame._time = (this.time - frame._startTime) / frame.duration;
        frame._time = Math.clamp(frame._time, 0, frame.repeat);

        if (frame._time > 1) { // repeating. TODO: add yoyo
            frame._time -= Math.floor(frame._time);
            if (frame._time === 0) frame._time = 1;
        }

        if (frame.animate) {
            this.__t = frame.easing(frame._time);
            frame.animate.forEach((anim) => {
                if (!anim._target) return;
                for (this.__k in anim._delta) {
                    anim._target[this.__k] = anim.to[this.__k] - (1 - this.__t) * anim._delta[this.__k];
                }
                if (anim.setter) anim.setter(anim._target);
            });
        }
        if (frame.run) frame.run(frame);
    }

    _complete(frame) {
        this._run(frame);
        frame._completed = true;
        if (frame.complete) frame.complete(frame);
    }

    static __test() {
        var target = {position: {x: 10}};
        var anim = new Animated()
        .add({
            delay: 1000,
            animate: [{
                target: target.position,
                to: {x: 20}
            }],
            begin() { console.log('frame 0 begin', target.position.x, anim.time.toFixed(2)); },
            complete() { console.log('frame 0 complete', target.position.x, anim.time.toFixed(2)); },
            run() { console.log('frame 0 run', target.position.x, anim.time.toFixed(2)); }
        })
        .add({
            duration: 500,
            animate: [{
                target: target.position,
                to: {x: 0}
            }],
            begin() { console.log('frame 1 begin', target.position.x, anim.time.toFixed(2)); },
            complete() { console.log('frame 1 complete', target.position.x, anim.time.toFixed(2)); },
            run() { console.log('frame 1 run', target.position.x, anim.time.toFixed(2)); }
        })
        .play();
    }
}

EventEmitter.mixin(Animated);

if (!window.Animated) window.Animated = Animated;

// PlayCanvas

if (window.pc) {
    let pc = window.pc;
    class AnimatedPC extends Animated {
        constructor(options = {}) {
            super(options);
            this.app = options.app || pc.script.app;
        }

        startAnimationLoop() {
            this.app.on('update', (dt) => this._update(dt * 1000), this);
        }

        _tick() { /* noop */ }
    }

    if (pc.Animated) console.warn('pc.Animated is already exists!');
    pc.Animated = AnimatedPC;
}

// utils
if (!Math.clamp) Math.clamp = function (value, min, max) {
    if (value >= max) {
        return max;
    }
    if (value <= min) {
        return min;
    }
    return value;
};
