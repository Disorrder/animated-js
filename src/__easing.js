export function Linear(k) {
    return k;
};

export function QuadraticIn(k) {
    return k * k;
};

export function QuadraticOut(k) {
    return k * (2 - k);
};

export function QuadraticInOut(k) {
    if ((k *= 2) < 1) {
        return 0.5 * k * k;
    }
    return -0.5 * (--k * (k - 2) - 1);
};

export function CubicIn(k) {
    return k * k * k;
};

export function CubicOut(k) {
    return --k * k * k + 1;
};

export function CubicInOut(k) {
    if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
    return 0.5 * ( ( k -= 2 ) * k * k + 2 );
};

export function QuarticIn(k) {
        return k * k * k * k;
};

export function QuarticOut(k) {
    return 1 - ( --k * k * k * k );
};

export function QuarticInOut(k) {
    if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
    return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );
};

export function QuinticIn(k) {
        return k * k * k * k * k;
};

export function QuinticOut(k) {
        return --k * k * k * k * k + 1;
};

export function QuinticInOut(k) {
    if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
    return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );
};

export function SineIn(k) {
    if (k === 0) return 0;
    if (k === 1) return 1;
    return 1 - Math.cos( k * Math.PI / 2 );
};

export function SineOut(k) {
    if (k === 0) return 0;
    if (k === 1) return 1;
    return Math.sin( k * Math.PI / 2 );
};

export function SineInOut(k) {
    if (k === 0) return 0;
    if (k === 1) return 1;
    return 0.5 * ( 1 - Math.cos( Math.PI * k ) );
};

export function ExponentialIn(k) {
    return k === 0 ? 0 : Math.pow( 1024, k - 1 );
};

export function ExponentialOut(k) {
    return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );
};

export function ExponentialInOut(k) {
    if ( k === 0 ) return 0;
    if ( k === 1 ) return 1;
    if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
    return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );
};

export function CircularIn(k) {
    return 1 - Math.sqrt( 1 - k * k );
};

export function CircularOut(k) {
    return Math.sqrt( 1 - ( --k * k ) );
};

export function CircularInOut(k) {
    if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
    return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);
};

export function ElasticIn(k) {
    var s, a = 0.1, p = 0.4;
    if ( k === 0 ) return 0;
    if ( k === 1 ) return 1;
    if ( !a || a < 1 ) { a = 1; s = p / 4; }
    else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
    return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
};

export function ElasticOut(k) {
    var s, a = 0.1, p = 0.4;
    if ( k === 0 ) return 0;
    if ( k === 1 ) return 1;
    if ( !a || a < 1 ) { a = 1; s = p / 4; }
    else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
    return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
};

export function ElasticInOut(k) {
    var s, a = 0.1, p = 0.4;
    if ( k === 0 ) return 0;
    if ( k === 1 ) return 1;
    if ( !a || a < 1 ) { a = 1; s = p / 4; }
    else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
    if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
    return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
};

export function BackIn(k) {
        var s = 1.70158;
        return k * k * ( ( s + 1 ) * k - s );
};

export function BackOut(k) {
    var s = 1.70158;
    return --k * k * ( ( s + 1 ) * k + s ) + 1;
};

export function BackInOut(k) {
    var s = 1.70158 * 1.525;
    if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
    return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
};

export function BounceIn(k) {
    return 1 - BounceOut( 1 - k );
};

export function BounceOut(k) {
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

export function BounceInOut(k) {
    if ( k < 0.5 ) return BounceIn( k * 2 ) * 0.5;
    return BounceOut( k * 2 - 1 ) * 0.5 + 0.5;
};
