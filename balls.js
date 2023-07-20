//Vector function from https://gist.github.com/jjgrainger/808640fcb5764cf92c3cad960682c677
//Setup Vector Function
var Vector = function(x, y) {this.x = x || 0;this.y = y || 0;};
// return the angle of the vector in radians
Vector.prototype.getDirection = function() {return Math.atan2(this.y, this.x);};
// set the direction of the vector in radians
Vector.prototype.setDirection = function(angle) {var magnitude = this.getMagnitude(); this.x = Math.cos(angle) * magnitude; this.y = Math.sin(angle) * magnitude;};
// get the magnitude of the vector
// use pythagoras theorem to work out the magnitude of the vector
Vector.prototype.getMagnitude = function() {return Math.sqrt(this.x * this.x + this.y * this.y);};
// set the magnitude of the vector
Vector.prototype.setMagnitude = function(magnitude) { var direction = this.getDirection(); this.x = Math.cos(direction) * magnitude; this.y = Math.sin(direction) * magnitude;};
// add two vectors together and return a new one
Vector.prototype.add = function(v2) {return new Vector(this.x + v2.x, this.y + v2.y);};
// add a vector to this one
Vector.prototype.addTo = function(v2) {this.x += v2.x; this.y += v2.y;};
// subtract two vectors and reutn a new one
Vector.prototype.subtract = function(v2) {return new Vector(this.x - v2.x, this.y - v2.y);};
// subtract a vector from this one
Vector.prototype.subtractFrom = function(v2) { this.x -= v2.x; this.y -= v2.y;};
// multiply this vector by a scalar and return a new one
Vector.prototype.multiply = function(scalar) {return new Vector(this.x * scalar, this.y * scalar);};
// multiply this vector by the scalar
Vector.prototype.multiplyBy = function(scalar) {this.x *= scalar; this.y *= scalar;};
// scale this vector by scalar and return a new vector
Vector.prototype.divide = function(scalar) { return new Vector(this.x / scalar, this.y / scalar);};
// scale this vector by scalar
Vector.prototype.divideBy = function(scalar) { this.x /= scalar; this.y /= scalar;};
// Aliases
Vector.prototype.getLength = Vector.prototype.getMagnitude;
Vector.prototype.setLength = Vector.prototype.setMagnitude;
Vector.prototype.getAngle = Vector.prototype.getDirection;
Vector.prototype.setAngle = Vector.prototype.setDirection;
// Utilities
Vector.prototype.copy = function() {return new Vector(this.x, this.y);};
Vector.prototype.toString = function() { return 'x: ' + this.x + ', y: ' + this.y;};
Vector.prototype.toArray = function() { return [this.x, this.y];};
Vector.prototype.toObject = function() { return {x: this.x, y: this.y};};
// dot product of two vectors
Vector.prototype.dotProduct = function(v2) { return this.x * v2.x + this.y *v2.y;}
// normalize a given vector
Vector.prototype.normalize = function(){return new Vector(this.x/(Math.sqrt(this.x * this.x + this.y * this.y)), this.y/(Math.sqrt(this.x * this.x + this.y * this.y)));}

let mouse = {
    x: undefined,
    y: undefined,
    pos: new Vector(undefined, undefined)
};
window.addEventListener('mousemove', function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
    mouse.pos = new Vector (e.x, e.y)
});
var c = document.getElementById("balls_canvas");
var ctx = c.getContext("2d");

c.width = window.innerWidth;
c.height = window.innerHeight;

window.addEventListener('resize', function () {
  c.width = window.innerWidth;
  c.height = window.innerHeight;
});

class Point {
    constructor(x, y) {
        this.initialPos = new Vector(x,y);
        this.pos = new Vector(x,y);
        this.v = new Vector(0,0);
        this.mass = 5;
        this.gravity = new Vector(0,9.81);
        this.moveable = false;
        this.radius = 10;
        
    };
    collisionForce = () => {
        //should return a list of collision forces
        //all collisions are assumed to have same friction coefficients
        /**
         * inspo for pixel access 
        const pixel = paintContext.getImageData(x, y, 1, 1);
        const pixel_data = pixel.data;
         */
        
        //collect nearby black pixels (if this doesn't work, check collisions with a different color and all other balls)
        var touching_pixels = [];
        var currPos = new Vector (Math.floor(this.pos.x), Math.floor(this.pos.y));
        var radius = this.radius+1;
        var rSquared = radius*radius;
        for (var i = -(this.radius+1); i <= this.radius+1; i++) {
            var j = floor(Math.sqrt(rSquared-i*i)+0.5);

            //check pixel values
            const pixel1 = ctx.getImageData(currPos.x + i, currPos.y+j, 1, 1);
            if (pixel1.data[0]==0&&pixel1.data[1]==0&&pixel1.data[2]==0) {
                touching_pixels.push(Vector(currPos.x + i,currPos.y+j));
            }
            const pixel2 = ctx.getImageData(currPos.x + i, currPos.y-j, 1, 1);
            if (pixel2.data[0]==0&&pixel2.data[1]==0&&pixel2.data[2]==0) {
                touching_pixels.push(Vector(currPos.x + i,currPos.y-j));
            }
        }
        //TODO solve for weight force vector
        
        var forceVectors = []; //theoretically this is only getting to length 1 or 2
        touching_pixels.forEach(function(vec) {
            //TODO find the direction of the normal force from the collision pixel
            //TODO find the magnitude of the normal force vector from the gravity force
            //TODO find the magnitude of the friction force from the normal force
            
        });

        //TODO add all normal and friction forces and weight force
        var forceVector = new Vector (0,0);
        return forceVector;
    }
    draw = () => {
        // this is where we control the shape's appearance
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    };
    update = () => {
        // this is where we control movement and interactivity
        if (this.moveable == false ) {
            var dist = mouse.pos.subtract(this.pos);
            if (dist.getMagnitude() < 50) {
                this.moveable = true;
                console.log ("GRAVITY ON BABY")
            }
        } else {
            //collision check (pixels surrounding circle) --> forces
            //TODO implement
            
            //solves forces for acceleration
            var acceleration = this.gravity;//TODO add collision forces
            
            //add acceleration * time to velocity
            this.v = this.v.add(acceleration.multiply(0.16)); //TODO WHEN TIMER IS IMPLEMENTED SWAP OUT WITH THIS
            
            //update position
            this.pos = this.pos.add(this.v.multiply(0.16)); //TODO when timer is implemented swap out with this
        }

        this.draw();
    };
};


let point1 = new Point(200,200);
let point2 = new Point (200, 300);
let points = [point1, point2];

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    points.forEach(point => {
        point.update();
    })
};
//TODO: set up timer to make animation smoother
animate();

