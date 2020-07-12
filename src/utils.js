// Class Decorators

export function mixin(Class) {
    return function decorator(Target) {
        Object.getOwnPropertyNames(Class.prototype).forEach((k) => {
            if (k === 'constructor') return;
            Target.prototype[k] = Class.prototype[k];
        });
    }
}


// Math

export function clamp (value, min, max) {
    if (value >= max) {
        return max;
    }
    if (value <= min) {
        return min;
    }
    return value;
};
