

class EventEmitter {
    on(name, cb, ctx) {
        if (!name || !cb) return this;
        if (!this._callbacks) this._callbacks = {};
        if (!this._callbacks[name]) this._callbacks[name] = [];
        if (ctx) cb = cb.bind(ctx);
        this._callbacks[name].push(cb);
        return this;
    }

    emit(name, ...args) {
        if (!name || !this._callbacks || !this._callbacks[name]) return this;
        this._callbacks[name].forEach(cb => cb.apply(null, args));
        return this;
    }
    fire(name, ...args) { return this.emit(name, ...args); }

    off(name, cb) {
        if (!name) return this;
        if (cb) {
            let index = this._callbacks[name].indexOf(cb);
            if (~index) this._callbacks[name].splice(index, 1);
        } else {
            this._callbacks[name].length = 0;
        }
        return this;
    }

    static mixin(target) {
        Object.getOwnPropertyNames(EventEmitter.prototype).forEach((k) => {
            if (k === 'constructor') return;
            target.prototype[k] = EventEmitter.prototype[k];
        });
    }
}
// ------

class Animated {
    static get version() { return '0.1.1'; }
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

        this.time += dt * this.timeScale;
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

if (typeof pc !== 'undefined') {
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

// ------

var easing = {
    Linear(k) {
        return k;
    },

    QuadraticIn(k) {
        return k * k;
    },

    QuadraticOut(k) {
        return k * (2 - k);
    },

    QuadraticInOut(k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k;
        }
        return -0.5 * (--k * (k - 2) - 1);
    },

    CubicIn(k) {
        return k * k * k;
    },

    CubicOut(k) {
        return --k * k * k + 1;
    },

    CubicInOut(k) {
        if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
        return 0.5 * ( ( k -= 2 ) * k * k + 2 );
    },

    QuarticIn(k) {
        return k * k * k * k;
    },

    QuarticOut(k) {
        return 1 - ( --k * k * k * k );
    },

    QuarticInOut(k) {
        if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
        return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );
    },

    QuinticIn(k) {
        return k * k * k * k * k;
    },

    QuinticOut(k) {
        return --k * k * k * k * k + 1;
    },

    QuinticInOut(k) {
        if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
        return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );
    },

    SineIn(k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return 1 - Math.cos( k * Math.PI / 2 );
    },

    SineOut(k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return Math.sin( k * Math.PI / 2 );
    },

    SineInOut(k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return 0.5 * ( 1 - Math.cos( Math.PI * k ) );
    },

    ExponentialIn(k) {
        return k === 0 ? 0 : Math.pow( 1024, k - 1 );
    },

    ExponentialOut(k) {
        return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );
    },

    ExponentialInOut(k) {
        if ( k === 0 ) return 0;
        if ( k === 1 ) return 1;
        if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
        return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );
    },

    CircularIn(k) {
        return 1 - Math.sqrt( 1 - k * k );
    },

    CircularOut(k) {
        return Math.sqrt( 1 - ( --k * k ) );
    },

    CircularInOut(k) {
        if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
        return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);
    },

    ElasticIn(k) {
        var s, a = 0.1, p = 0.4;
        if ( k === 0 ) return 0;
        if ( k === 1 ) return 1;
        if ( !a || a < 1 ) { a = 1; s = p / 4; }
        else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
        return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
    },

    ElasticOut(k) {
        var s, a = 0.1, p = 0.4;
        if ( k === 0 ) return 0;
        if ( k === 1 ) return 1;
        if ( !a || a < 1 ) { a = 1; s = p / 4; }
        else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
        return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
    },

    ElasticInOut(k) {
        var s, a = 0.1, p = 0.4;
        if ( k === 0 ) return 0;
        if ( k === 1 ) return 1;
        if ( !a || a < 1 ) { a = 1; s = p / 4; }
        else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
        if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
        return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
    },

    BackIn(k) {
        var s = 1.70158;
        return k * k * ( ( s + 1 ) * k - s );
    },

    BackOut(k) {
        var s = 1.70158;
        return --k * k * ( ( s + 1 ) * k + s ) + 1;
    },

    BackInOut(k) {
        var s = 1.70158 * 1.525;
        if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
        return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
    },

    BounceIn(k) {
        return 1 - BounceOut( 1 - k );
    },

    BounceOut(k) {
        if ( k < ( 1 / 2.75 ) ) {
            return 7.5625 * k * k;
        } else if ( k < ( 2 / 2.75 ) ) {
            return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
        } else if ( k < ( 2.5 / 2.75 ) ) {
            return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
        } else {
            return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
        }
    },

    BounceInOut(k) {
        if ( k < 0.5 ) return BounceIn( k * 2 ) * 0.5;
        return BounceOut( k * 2 - 1 ) * 0.5 + 0.5;
    },
};
