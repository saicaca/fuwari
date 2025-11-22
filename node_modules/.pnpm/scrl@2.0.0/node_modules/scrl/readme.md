# Scrl
**Page acceleration based scroll animation.** (extracted swup scroll)
* Makes scroll animation smooth but quick.
* Takes care of special cases like scrolling to the bottom of the page instead of suddenly stopping.
* Stops scrolling when mouse wheel is used to avoid jaggy page.
* Provides handlers different events. 


## Usage
Create instance...
```javascript
import Scrl from 'scrl';
var scrl = new Scrl();
```
and use it.
```javascript
scrl.scrollTo(offset);  // offset can be a number of pixel, or an element on the page
```

## Options
Scrl accepts several options:
```javascript
const defaults = {
    onAlreadyAtPositions: () => {}, // handler called when link leads to the offset page is already at
    onCancel: () => {},             // handler called on cancel of animation by mouse scroll
    onEnd: () => {},                // handler called on end of animation
    onStart: () => {},              // handler called on start of animation
    onTick: () => {},               // handler called on every step of animation
    friction: .3,                   // friction of scroll animation    
    acceleration: .04,              // acceleration of scroll animation
}
```