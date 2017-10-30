import EE from './EventEmitter';
import * as easing from './easing';

export default class Story extends EE {
    static get version() { return '0.1.0'; }
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

        this._tick();
    }

    get lastKeyframe() {
        return this.keyframes[this.keyframes.length-1] || null;
    }

    _tick(time = 0) {
        requestAnimationFrame(this._tick.bind(this));
        this._update(this._lastTick - time);
        this._lastTick = time;
    }

    add(frame) {
        if (frame instanceof Story) {
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
        if (frame.easing == null) frame.easing = easing.QuadraticIn;
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
        this.keyframes.forEach((frame) => {
            if (this.time >= frame._startTime && this.time <= frame._endTime) {
                if (!frame._began) this._begin(frame);
                this._run(frame);
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

        this.time += dt * 1000 * this.timeScale;
    }

    _begin(frame) {
        if (frame.animate) {
            frame.animate.forEach((anim) => {
                anim._target = typeof anim.target === 'function' ? anim.target() : anim.target;
                if (!anim._target) return console.warn('Animation target is not defined', anim, frame, this);
                if (!anim.from) anim.from = {};
                anim._delta = {};
                for (let k in anim.to) {
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
        frame._time = pc.math.clamp(frame._time, 0, frame.repeat);

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
}

if (!window.Story) window.Story = Story;

// PlayCanvas

if (typeof pc !== 'undefined') {
    class StoryPC extends Story {
        constructor(options = {}) {
            super(options);
            this.app = options.app || pc.app;
            this.app.on('update', this._update, this);
        }

        _tick() { /* noop */ }
    }

    if (pc.Story) console.warn('pc.Story is already exists!');
    pc.Story = StoryPC;
}
