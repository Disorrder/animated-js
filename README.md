# timeline-js (was renamed from animated-js)
Timeline for simple animations. Inspired by @animejs.  
I'm using it in my WebVR projects with Three.js or Playcanvas engine.  
Please report all issues or ideas you will find ;)  

## Installation
Using npm:
```
npm i --save @disorrder/timeline --only=production
```
*Yeah, all good names was busy :(*

### Basic usage
```javascript
var target = {
    position: {x: 1, y: 2, z: 3}
};
var anim = new Timeline()
.add({
    repeat: 1,
    delay: 0,
    duration: 1000,
    animate: [{
        target: target.position,
        to: {x: 10}
    }],
    begin(frame) { /* ... */ },
    run(frame) { /* ... */ },
    complete(frame) { /* ... */ },
})
.play();
```

## Timeline methods
**add(frame)**  
**play()**  
**pause()**  
**stop()**  
**replay()**  

## Keyframe type
**repeat** *default: 1* -  
**delay** *default: 0* -  
**duration** *default: 1000* -  
`Animatable[]` **animate** - Array of Animatables  

**preCalculate(frame)** -  
**begin(frame)** -  
**run(frame)** -  
**complete(frame)** -  

## Animatable type
`Object``Function` **target** - target of animation  
`Object` **from** - start params  
`Object` **to** - end params  
`Object` **by** - if you want to translate some params by value  
`Function` **setter(target)** - call every frame of animation with `target` in first argument  

### One more example
This code animates `position.x` from 10 to 20 and `position.y` from initial to initial+30.  
So, if initial `y` is 100 it will be animated from 100 to 130.  
```javascript
var entity = new pc.Entity(); // new THREE.Object3D() for Three.js
var position = entity.getLocalPosition(); // imagine you don't know values of x, y and z
var anim = new Timeline()
.add({
    animate: [{
        target: position,
        from: {x: 10},
        to: {x: 20},
        by: {y: 30},
    }],
})
.play();
```
