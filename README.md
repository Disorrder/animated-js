# animated-js
Timeline for simple animations. Inspired by @animejs

### Basic usage
```
var target = {
    position: {x: 1, y: 2, z: 3}
};
var anim = new Animated()
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

## Animated methods
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
`Object` **target** -  
`Object` **from** -  
`Object` **to** -  
**setter(fn)** -  
