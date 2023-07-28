import data from './data.json' assert { type: 'json' };

var antImages = new Map(); //this is necessary for preloading
function loadAntImages() {
    data.ants.lines.forEach((line)=>{
        line.data.forEach((segment) => {
            var img = new Image();
            img.src = "./assets/images/ants/"+segment[2];
            antImages.set(segment[2], img)
        })
    })
}
loadAntImages();

//define global variables
let piece_index = 0;
let paint_mode = false;
let animation_request_id = undefined;
let mouse = {
    x: undefined,
    y: undefined,
    down: false
};

//add global handlers
window.addEventListener('mousemove', function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
});
window.addEventListener('mousedown', () => {
    mouse.down = true;
})
window.addEventListener('mouseup', ()=> {
    mouse.down = false;
})
var c = document.getElementById("main_canvas");
var ctx = c.getContext("2d");

c.width = 1000;
c.height = 1000;

// event = keyup or keydown
document.body.onload = display()
document.body.onkeydown = function (e) {
    if (e.key == " " || e.code == "Space" || e.keyCode == 39
    ) {
        e.preventDefault(); //prevent autoscroll
        incrementCount()
        display()
    } else if (e.keyCode == 37) {
        e.preventDefault(); //prevent autoscroll
        decrementCount()
        display()
    }
}

//runs on spacebar click
//sorts through JSON info and displays the current index's information
function display() {
    //get rid of everything that was there before
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let piece_name = data.pieces[piece_index]

    let piece_data = data[piece_name]
    if (piece_data.type == "text") {
        ctx.fillText(piece_data.contents, 100, 100)
    } else {
        const img = new Image();
        img.src = "assets/images/" + piece_data["image-name"]

        img.onload = () => {
            ctx.drawImage(img, 0, 0, 1000, 1000);
        }

        if (piece_data.type == "eyes") {
            runEyes(piece_name, img);
        } else if (piece_data.type == "stained-glass") {
            runStainedGlass();
        } else if (piece_data.type == "articulated") {
            runArticulated(piece_name, img);
        }

    }
}
//advance the slideshow
function incrementCount() {
    stop()
    if (piece_index < data.pieces.length - 1) {
        piece_index++;
    }
}
//go back in the slideshow
function decrementCount() {

    stop()
    if (piece_index > 0) {
        piece_index--;
    }
}

//run the eyes code!
function runEyes(pieceName, image) {

    let imageX = 0;
    let imageY = 0;

    let eyes = [];

    // const eyeImage = new Image(data[pieceName]["eyes-image-name"]);
    class Eye {
        constructor(x, y) {
            this.eyeImage = new Image();
            this.eyeReady = false;
            this.eyeWidth = data[pieceName]["eye-width"];
            this.eyeImage.src = "assets/images/" + data[pieceName]["eye-image-name"];
            this.x = x;
            this.y = y;
            this.initialX = x;
            this.initialY = y;

            this.eyeImage.onload = () => {
                ctx.drawImage(this.eyeImage, this.x, this.y, this.eyeWidth, this.eyeWidth);
                this.eyeReady = true;
            }
        };
        draw = () => {
            if (this.eyeReady) {
                ctx.drawImage(this.eyeImage, this.x, this.y * window.innerHeight / 1000, this.eyeWidth, this.eyeWidth);
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
                ctx.fill();
            }
        };
        update = () => {
            // this is where we control movement and interactivity
            let distX = window.innerWidth - this.initialX;
            let curDistX = (mouse.x - window.innerWidth / 2) - this.initialX;
            let moveX = this.eyeWidth / 2 * curDistX / distX;
            this.x = this.initialX + moveX;


            let distY = window.innerHeight - this.initialY;
            let curDistY = mouse.y - this.initialY;
            let moveY = this.eyeWidth / 2 * curDistY / distY;
            this.y = this.initialY + moveY;
            this.draw();
        };
    };

    function initEyes() {
        data[pieceName]['eye-coordinates'].forEach((eye) => {
            eyes.push(new Eye(imageX + eye[0], imageY + eye[1]))
        })
    }
    function animateEyes() {
        animation_request_id = window.requestAnimationFrame(animateEyes);
        ctx.clearRect(0, 0, 1000, window.innerHeight);
        eyes.forEach(eye => {
            eye.update();
        })
        ctx.drawImage(image, imageX, imageY, 1000, window.innerHeight);
    }
    initEyes();
    animateEyes();
}

//run the articulated
//EDITORS (and future me) BEWARE: I HAVE LIMITED THIS TO JUST THE ANTS BECAUSE THE PRE-LOADING FUNCTION IS PRIMITIVE AND
//  I DIDN'T HAVE TIME TO MAKE IT MORE ABSTRACTED
function runArticulated(pieceName, background_image) {

    //the handles at the ends of each of the legs
    class Joint {
        //x,y are in relation to the original canvas origin
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.selected = false;
        }
        draw = () => {
            // if (this.selected) {
            // this is where we control the shape's appearance
            ctx.fillStyle = "red"
            ctx.beginPath();
            ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
            ctx.fill();
        };
        update = () => {
            //when the mouse gets picked up, deselect this joint
            if (this.selected && !mouse.down) {
                this.selected = false;
            }
            const bounding = c.getBoundingClientRect();
            if (Math.sqrt(Math.pow(this.x - (mouse.x-Math.floor(bounding.left)) + 5, 2) + Math.sqrt(Math.pow(this.y - (mouse.y-Math.floor(bounding.top)) - 5, 2))) < 10) {
                if (mouse.down) { this.selected = true; }
                this.draw();
            }

        };
        //shift the x,y (with respect to upper left of canvas)
        moveTo = (x, y) => {
            this.x = x;
            this.y = y;
        }
        //rotate x and y (with respect to upper left of canvas) about specified origin by angle amount
        //NOTE: angle was necessary to negate and fiddly stuff to make it work with canvas coord system
        rotateAbout = (originX, originY, angle) => {
            //rotate about the specified origin
            var x = this.x;
            var y = this.y;
            x -= originX
            y -= originY
            var cos = Math.cos(-angle % (2 * Math.PI))
            var sin = Math.sin(-angle % (2 * Math.PI))
            var newX = (x * cos + y * sin) + originX;
            var newY = (y * cos + -x * sin) + originY;
            this.x = newX;
            this.y = newY;
        }
    }

    //the image segments that end with handles
    class Segment {
        constructor(handle_location, angle, url, child) {
            this.handle_location = handle_location;
            this.currentAngle = 0
            this.initialAngle = angle
            this.child = child; //the next segment in the chain (yes this is a linked-list)
            // this.image = new Image(); //this is commented out because I changed it to a pre-loaded system
            // this.image.src = "assets/images/ants/" + url;
            this.image = antImages.get(url) //TODO MAKE THIS ABSTRACT AND NOT SPECIFICALLY FOR ANT IMAGE
            this.ready = false;
        }
        //after initial information is in, set up coordinate system relative to the parent of each segment
        init(xUL, yUL, xH, yH, jointX, jointY) {
            //dxUL and dyUL are set with the parent's UL as origin
            this.dxUL = xUL;
            this.dyUL = yUL;
            this.dxHandle = xH;
            this.dyHandle = yH;
            this.handle = new Joint(jointX, jointY)
        }
        draw = () => {
                ctx.drawImage(this.image, this.dxUL, this.dyUL)
                // ctx.strokeRect(this.dxUL, this.dyUL, this.image.width, this.image.height); //todo comment in if you want to see the image bounds

                //offset the canvas by the handle offset (to make rotations about the handle location)
                ctx.translate(this.dxHandle, this.dyHandle)
        };
        update = () => {
            this.handle.update();
            //check for rotation requests
            if (this.child && this.child.handle.selected) {
                //calculate how far mouse has moved and implied angle from there
                const bounding = c.getBoundingClientRect();
                var directionHandleToMouse = [(mouse.x-Math.floor(bounding.left)) - this.handle.x, (mouse.y-Math.floor(bounding.top)) - this.handle.y]
                var magHtoM = Math.sqrt(Math.pow(directionHandleToMouse[0], 2) + Math.pow(directionHandleToMouse[1], 2)) //magnitude of handle to mouse
                var directionHandleToNextHandle = [this.child.handle.x - this.handle.x, this.child.handle.y - this.handle.y] //this should be the diagonal of the image in vector form
                var magHtoNH = Math.sqrt(Math.pow(directionHandleToNextHandle[0], 2) + Math.pow(directionHandleToNextHandle[1], 2))

                //normalize both vectors using magnitude
                var nHtoM = [directionHandleToMouse[0] / magHtoM, directionHandleToMouse[1] / magHtoM] //normalized handle to mouse
                var nHtoNH = [directionHandleToNextHandle[0] / magHtoNH, directionHandleToNextHandle[1] / magHtoNH] //normalized handle to next handle

                var newNextHandle = [this.handle.x + nHtoM[0] * magHtoNH, this.handle.y + nHtoM[1] * magHtoNH]

                //using cross product, find the angle between the two vectors
                var angle = Math.asin((nHtoNH[0] * nHtoM[1] - nHtoM[0] * nHtoNH[1]))
                this.child.handle.moveTo(newNextHandle[0], newNextHandle[1])
                this.child.currentAngle += angle;

                //populate change for the rest of the handles
                var seg = this.child.child
                while (seg) {
                    seg.handle.rotateAbout(this.handle.x, this.handle.y, angle);
                    seg = seg.child;
                }
            }
        };
    }

    class Line {
        // x, y = start point for the line of images
        // a list of segment information: [the attachment site to the next segment, the angle difference, and the image url]
        constructor(x, y, segments) {
            this.startX = x;
            this.startY = y;
            this.segmentRoot = undefined; //the top of the leg chain

            var seg;

            //initialize the link-list structure
            for (var i = segments.length - 1; i >= 0; i--) {
                this.segmentRoot = new Segment(segments[i][0], segments[i][1], segments[i][2], seg)
                seg = this.segmentRoot;
            }
            var currentSeg = this.segmentRoot;
            var runningHandleRealX = this.startX;
            var runningHandleRealY = this.startY;

            var dxH = 0;
            var dyH = 0;
            var last_handle_position = currentSeg.handle_location //this is a little gross but necessary to start the chain off with a handle (I was lazy and coded around my recursion)
            var last_seg_width = 0;
            var last_seg_height = 0;
            while (!(currentSeg === undefined)) {
                //change the offset initialization process based on where the handle will be attached on each segment
                if (last_handle_position == "bottom-left") {
                    var dxUL = -currentSeg.image.width;
                    var dyUL = 0;
                    var dxH = -currentSeg.image.width;
                    var dyH = currentSeg.image.height;
                } else if (last_handle_position == "bottom-right") {
                    var dxUL = 0;
                    var dyUL = 0;
                    var dxH = currentSeg.image.width;
                    var dyH = currentSeg.image.height;
                } else if (last_handle_position == "top-right") {
                    var dxUL = 0;
                    var dyUL = -currentSeg.image.height;
                    var dxH = currentSeg.image.width;
                    var dyH = -currentSeg.image.height;
                }
                //keep track of the actual position based on the offsets (for plugging into the handles which exist on the real coord system, not offsets)
                runningHandleRealX += dxH;
                runningHandleRealY += dyH;


                currentSeg.init(dxUL, dyUL, dxH, dyH, runningHandleRealX, runningHandleRealY)
                last_handle_position = currentSeg.handle_location
                //keep track of these for the above recursion values
                last_seg_width = currentSeg.image.width
                last_seg_height = currentSeg.image.height

                currentSeg = currentSeg.child
            }

            //set up initial angles
            currentSeg = this.segmentRoot;
            while (!(currentSeg === undefined)) {
                //rotate handles by populating rotations all the way down
                if (!(currentSeg.child === undefined)) {
                    var runner = currentSeg.child;
                    var angle_for_rest_of_leg = runner.initialAngle;
                    while (!(runner === undefined)) {
                        runner.handle.rotateAbout(currentSeg.handle.x, currentSeg.handle.y, angle_for_rest_of_leg)
                        runner = runner.child
                    }
                }
                //rotate segments (easy)
                currentSeg.currentAngle = currentSeg.initialAngle
                currentSeg = currentSeg.child;
            }
        }
        //draw a line by translating the canvas around the starting handle point then recursing down the draw chain on the segments
        draw = () => {
            var currentSeg = this.segmentRoot;
            ctx.save();
            ctx.translate(this.startX, this.startY)
            while (!(currentSeg === undefined)) {
                ctx.rotate(currentSeg.currentAngle);
                currentSeg.draw();
                currentSeg = currentSeg.child;
            }
            ctx.restore();
        };
        update = () => {
            var currentSeg = this.segmentRoot;
            while (!(currentSeg === undefined)) {
                currentSeg.update();
                currentSeg = currentSeg.child;
            }
        };
    }

    var lines = [];
    data[pieceName].lines.forEach((line) => {
        lines.push(new Line(line.x, line.y, line.data))
    })

    function animate() {
        animation_request_id = window.requestAnimationFrame(animate);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        ctx.drawImage(background_image, 0, 0)
        lines.forEach((line) => {
            line.update();
        })
        lines.forEach((line) => {
            line.draw();
        })
    }

    animate();
}

//set up the event listener necessary for the stained glass mode
function runStainedGlass() {
    paint_mode = true;
    // c.addEventListener("click", (event) => pick(event));
    c.addEventListener("click", pick)
}

//flood fill an empty (rgb(a=0)) section with a random color
//only pass in empty sections from pick()
function floodFill(x_coord, y_coord) {
    //get the ImageData object wrapper from the context
    const image_data = ctx.getImageData(0, 0, c.width, c.height);
    //extract the Uint8ClampedArray from ImageData
    var data = image_data.data;

    //use FloodFill algorithm with a queue to edit data array while running checks on it (visited-checks are done by color, only empty space can be colored in)
    //https://en.wikipedia.org/wiki/Flood_fill
    var queue = [];

    queue.push([x_coord, y_coord]);

    var rColor = [0, Math.random() * 255, Math.random() * 255];

    while (queue.length != 0) {
        var n = queue.shift();
        var x = n[0];
        var y = n[1];
        const pixel = ctx.getImageData(x, y, 1, 1);
        const pixel_data = pixel.data;

        //locate the pixel in the Uint8ClampedArray of the data object
        const index = 4 * (y * c.width + x);
        if (data[index + 3] == 0 && data[index + 3] != 125) {
            //pixel is empty so the up, down, left, and right should be added

            //change the pixel to be colored in
            data[index] = rColor[0];
            data[index + 1] = rColor[1];
            data[index + 2] = rColor[2];
            data[index + 3] = 125;

            if (x - 1 >= 0) { queue.push([x - 1, y]); } else { console.log("what is the reason") }
            if (x + 1 < c.width) { queue.push([x + 1, y]); } else { console.log("seriously idk") }
            if (y - 1 >= 0) { queue.push([x, y - 1]); } else { console.log("Out of bounds on flood fill (something big going wrong)") }
            if (y + 1 < c.height) { queue.push([x, y + 1]); } else { console.log("Out of bounds on flood fill (something big going wrong #23)") }
        }
        else if (data[index + 3] != 125) {
            //create essentially a border pixel which will flip the one extraneous one. this looks 
            //  better than setting the pixels to black (makes ink extra thick) or leaving i
            //  unflipped, which looks discontinuous
            data[index] = rColor[0] / 2.0;
            data[index + 1] = rColor[1] / 2.0;
            data[index + 2] = rColor[2] / 2.0;
            data[index + 3] = 255;
        }
    }

    const bounding = c.getBoundingClientRect();
    ctx.putImageData(image_data, 0, 0);
}

//special selection event only for flood fill effect
function pick(event) {
    const bounding = c.getBoundingClientRect();

    //get the x and y locations relative to the upper lefthand location of the canvas (canvas internal 0,0)
    const x_coord = Math.floor(event.clientX - bounding.left);
    const y_coord = Math.floor(event.clientY - bounding.top);
    const pixel = ctx.getImageData(x_coord, y_coord, 1, 1);
    const pixel_data = pixel.data;

    if (pixel_data[3] == 0) {
        floodFill(x_coord, y_coord);
    }
}

//reset to neutral state in terms of animation and event-clickers before a piece change
function stop() {
    if (animation_request_id) {
        window.cancelAnimationFrame(animation_request_id);
        animation_request_id = undefined;
    }
    if (paint_mode) {
        c.removeEventListener("click", pick); //make it not possible to trigger the pick and fill function
        paint_mode = false;
    }
}