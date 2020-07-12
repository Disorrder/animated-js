// import Timeline from "dist/timeline";
const Timeline = require("..").default;

// TODO: add better tests
test('basic', (done) => {
    var target = {position: {x: 10}};
    var anim = new Timeline()
    .add({
        animate: [{
            target: target.position,
            to: {x: 20}
        }],
        begin() { console.log('frame 0 begin', target.position.x, anim.time.toFixed(2)); },
        complete() { console.log('frame 0 complete', target.position.x, anim.time.toFixed(2)); },
        // run() { console.log('frame 0 run', target.position.x, anim.time.toFixed(2)); }
    })
    .add({
        delay: 500,
        duration: 100,
        animate: [{
            target: target.position,
            by: {x: -20}
        }],
        begin() { console.log('frame 1 begin', target.position.x, anim.time.toFixed(2)); },
        complete() { console.log('frame 1 complete', target.position.x, anim.time.toFixed(2)); },
        // run() { console.log('frame 1 run', target.position.x, anim.time.toFixed(2)); }
    })
    .play();

    anim.on('complete', done);
});
