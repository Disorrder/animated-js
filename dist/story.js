/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__EventEmitter__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__easing__ = __webpack_require__(2);



class Story extends __WEBPACK_IMPORTED_MODULE_0__EventEmitter__["a" /* default */] {
    static get version() { return '0.0.1'; }
    static get easing() { return __WEBPACK_IMPORTED_MODULE_1__easing__; }

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
        if (frame.easing == null) frame.easing = __WEBPACK_IMPORTED_MODULE_1__easing__["QuadraticIn"];
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
/* harmony export (immutable) */ __webpack_exports__["default"] = Story;


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


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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
        if (!name || !this._callbacks[name]) return this;
        this._callbacks[name].forEach(cb => cb.apply(null, args));
        return this;
    }

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
/* harmony export (immutable) */ __webpack_exports__["a"] = EventEmitter;


EventEmitter.prototype.fire = EventEmitter.prototype.emit;


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["Linear"] = Linear;
/* harmony export (immutable) */ __webpack_exports__["QuadraticIn"] = QuadraticIn;
/* harmony export (immutable) */ __webpack_exports__["QuadraticOut"] = QuadraticOut;
/* harmony export (immutable) */ __webpack_exports__["QuadraticInOut"] = QuadraticInOut;
/* harmony export (immutable) */ __webpack_exports__["CubicIn"] = CubicIn;
/* harmony export (immutable) */ __webpack_exports__["CubicOut"] = CubicOut;
/* harmony export (immutable) */ __webpack_exports__["CubicInOut"] = CubicInOut;
/* harmony export (immutable) */ __webpack_exports__["QuarticIn"] = QuarticIn;
/* harmony export (immutable) */ __webpack_exports__["QuarticOut"] = QuarticOut;
/* harmony export (immutable) */ __webpack_exports__["QuarticInOut"] = QuarticInOut;
/* harmony export (immutable) */ __webpack_exports__["QuinticIn"] = QuinticIn;
/* harmony export (immutable) */ __webpack_exports__["QuinticOut"] = QuinticOut;
/* harmony export (immutable) */ __webpack_exports__["QuinticInOut"] = QuinticInOut;
/* harmony export (immutable) */ __webpack_exports__["SineIn"] = SineIn;
/* harmony export (immutable) */ __webpack_exports__["SineOut"] = SineOut;
/* harmony export (immutable) */ __webpack_exports__["SineInOut"] = SineInOut;
/* harmony export (immutable) */ __webpack_exports__["ExponentialIn"] = ExponentialIn;
/* harmony export (immutable) */ __webpack_exports__["ExponentialOut"] = ExponentialOut;
/* harmony export (immutable) */ __webpack_exports__["ExponentialInOut"] = ExponentialInOut;
/* harmony export (immutable) */ __webpack_exports__["CircularIn"] = CircularIn;
/* harmony export (immutable) */ __webpack_exports__["CircularOut"] = CircularOut;
/* harmony export (immutable) */ __webpack_exports__["CircularInOut"] = CircularInOut;
/* harmony export (immutable) */ __webpack_exports__["ElasticIn"] = ElasticIn;
/* harmony export (immutable) */ __webpack_exports__["ElasticOut"] = ElasticOut;
/* harmony export (immutable) */ __webpack_exports__["ElasticInOut"] = ElasticInOut;
/* harmony export (immutable) */ __webpack_exports__["BackIn"] = BackIn;
/* harmony export (immutable) */ __webpack_exports__["BackOut"] = BackOut;
/* harmony export (immutable) */ __webpack_exports__["BackInOut"] = BackInOut;
/* harmony export (immutable) */ __webpack_exports__["BounceIn"] = BounceIn;
/* harmony export (immutable) */ __webpack_exports__["BounceOut"] = BounceOut;
/* harmony export (immutable) */ __webpack_exports__["BounceInOut"] = BounceInOut;
function Linear(k) {
    return k;
};

function QuadraticIn(k) {
    return k * k;
};

function QuadraticOut(k) {
    return k * (2 - k);
};

function QuadraticInOut(k) {
    if ((k *= 2) < 1) {
        return 0.5 * k * k;
    }
    return -0.5 * (--k * (k - 2) - 1);
};

function CubicIn(k) {
    return k * k * k;
};

function CubicOut(k) {
    return --k * k * k + 1;
};

function CubicInOut(k) {
    if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
    return 0.5 * ( ( k -= 2 ) * k * k + 2 );
};

function QuarticIn(k) {
        return k * k * k * k;
};

function QuarticOut(k) {
    return 1 - ( --k * k * k * k );
};

function QuarticInOut(k) {
    if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
    return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );
};

function QuinticIn(k) {
        return k * k * k * k * k;
};

function QuinticOut(k) {
        return --k * k * k * k * k + 1;
};

function QuinticInOut(k) {
    if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
    return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );
};

function SineIn(k) {
    if (k === 0) return 0;
    if (k === 1) return 1;
    return 1 - Math.cos( k * Math.PI / 2 );
};

function SineOut(k) {
    if (k === 0) return 0;
    if (k === 1) return 1;
    return Math.sin( k * Math.PI / 2 );
};

function SineInOut(k) {
    if (k === 0) return 0;
    if (k === 1) return 1;
    return 0.5 * ( 1 - Math.cos( Math.PI * k ) );
};

function ExponentialIn(k) {
    return k === 0 ? 0 : Math.pow( 1024, k - 1 );
};

function ExponentialOut(k) {
    return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );
};

function ExponentialInOut(k) {
    if ( k === 0 ) return 0;
    if ( k === 1 ) return 1;
    if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
    return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );
};

function CircularIn(k) {
    return 1 - Math.sqrt( 1 - k * k );
};

function CircularOut(k) {
    return Math.sqrt( 1 - ( --k * k ) );
};

function CircularInOut(k) {
    if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
    return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);
};

function ElasticIn(k) {
    var s, a = 0.1, p = 0.4;
    if ( k === 0 ) return 0;
    if ( k === 1 ) return 1;
    if ( !a || a < 1 ) { a = 1; s = p / 4; }
    else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
    return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
};

function ElasticOut(k) {
    var s, a = 0.1, p = 0.4;
    if ( k === 0 ) return 0;
    if ( k === 1 ) return 1;
    if ( !a || a < 1 ) { a = 1; s = p / 4; }
    else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
    return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
};

function ElasticInOut(k) {
    var s, a = 0.1, p = 0.4;
    if ( k === 0 ) return 0;
    if ( k === 1 ) return 1;
    if ( !a || a < 1 ) { a = 1; s = p / 4; }
    else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
    if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
    return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
};

function BackIn(k) {
        var s = 1.70158;
        return k * k * ( ( s + 1 ) * k - s );
};

function BackOut(k) {
    var s = 1.70158;
    return --k * k * ( ( s + 1 ) * k + s ) + 1;
};

function BackInOut(k) {
    var s = 1.70158 * 1.525;
    if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
    return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
};

function BounceIn(k) {
    return 1 - BounceOut( 1 - k );
};

function BounceOut(k) {
    if ( k < ( 1 / 2.75 ) ) {
        return 7.5625 * k * k;
    } else if ( k < ( 2 / 2.75 ) ) {
        return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
    } else if ( k < ( 2.5 / 2.75 ) ) {
        return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
    } else {
        return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
    }
};

function BounceInOut(k) {
    if ( k < 0.5 ) return BounceIn( k * 2 ) * 0.5;
    return BounceOut( k * 2 - 1 ) * 0.5 + 0.5;
};


/***/ })
/******/ ]);