import data from './data.json' assert { type: 'json' };
console.log(data);

//define global variables
let piece_index = 0;
let paint_mode = false;
let animation_request_id = undefined;
let mouse = {
    x: undefined,
    y: undefined
};

window.addEventListener('mousemove', function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mousedown', () => {
    console.log("x: "+mouse.x+" y: "+mouse.y)
})
var c = document.getElementById("main_canvas");
var ctx = c.getContext("2d");

c.width = 1000;
c.height = window.innerHeight;

window.addEventListener('resize', function () {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
});
// event = keyup or keydown
document.body.onload = display()
document.body.onkeydown = function (e) {
    if (e.key == " " || e.code == "Space" || e.keyCode == 32
    ) {
        e.preventDefault(); //prevent autoscroll
        incrementCount()
        display()
    }
}

//runs on spacebar click
//sorts through JSON info and displays the current index's information
function display() {
    //get rid of everything that was there before
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let piece_name = data.pieces[piece_index]
    console.log("PIECE: " + piece_name)

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
        }

    }
}
function incrementCount() {
    stop()
    if (piece_index < data.pieces.length - 1) {
        piece_index++;
    }
}

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
            this.eyeImage.src = "assets/images/"+data[pieceName]["eye-image-name"];
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
                ctx.drawImage(this.eyeImage, this.x, this.y*window.innerHeight/1000, this.eyeWidth, this.eyeWidth);
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
                ctx.fill();
            }
        };
        update = () => {
            // this is where we control movement and interactivity
            let distX = window.innerWidth - this.initialX;
            let curDistX = (mouse.x-window.innerWidth/2) - this.initialX;
            let moveX = this.eyeWidth/2 * curDistX / distX;
            this.x = this.initialX + moveX;


            let distY = window.innerHeight - this.initialY;
            let curDistY = mouse.y - this.initialY;
            let moveY = this.eyeWidth/2 * curDistY / distY;
            this.y = this.initialY + moveY;
            this.draw();
        };
    };

    function initEyes() {
        data[pieceName]['eye-coordinates'].forEach((eye) => {
            eyes.push(new Eye(imageX + eye[0], imageY + eye[1]))
            console.log("Added eye")
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

//set up the event listener necessary for the stained glass mode
function runStainedGlass() {
    paint_mode = true;
    // c.addEventListener("click", (event) => pick(event));
    c.addEventListener("click", pick)
}

//flood fill an empty (rgb(a=0)) section with a random color
//only pass in empty sections from pick()
function floodFill(x_coord,y_coord) {
    //get the ImageData object wrapper from the context
    const image_data = ctx.getImageData(0,0,c.width,c.height);
    //extract the Uint8ClampedArray from ImageData
    var data = image_data.data;
    
    //use FloodFill algorithm with a queue to edit data array while running checks on it (visited-checks are done by color, only empty space can be colored in)
    //https://en.wikipedia.org/wiki/Flood_fill
    var queue = [];
    
    queue.push([x_coord, y_coord]);

    var rColor = [Math.random()*255, Math.random()*255, Math.random()*255];

    while (queue.length != 0) {
        // console.log(queue.length)
        var n = queue.shift();
        var x = n[0];
        var y = n[1];
        const pixel = ctx.getImageData(x, y, 1, 1);
        const pixel_data = pixel.data;

        //locate the pixel in the Uint8ClampedArray of the data object
        const index = 4*(y*c.width+x);
        // console.log("width: "+c.width)
        if (data[index+3]==0&&data[index+3]!=125) {
            //pixel is empty so the up, down, left, and right should be added

            //change the pixel to be colored in
            data[index] = rColor[0];
            data[index+1] = rColor[1];
            data[index+2] = rColor[2];
            data[index+3] = 125;

            if (x-1>=0){queue.push([x-1,y]);} else {console.log("what is the reason")}
            if (x+1<c.width) {queue.push([x+1, y]);} else {console.log("seriously idk")}
            if (y-1>=0) {queue.push([x, y-1]);} else {console.log("Out of bounds on flood fill (something big going wrong)")}
            if (y+1<c.height) {queue.push([x, y+1]);} else {console.log("Out of bounds on flood fill (something big going wrong #23)")}
        } 
        else if (data[index+3]!=125) {
            //create essentially a border pixel which will flip the one extraneous one. this looks 
            //  better than setting the pixels to black (makes ink extra thick) or leaving i
            //  unflipped, which looks discontinuous
            data[index] = rColor[0]/2.0;
            data[index+1] = rColor[1]/2.0;
            data[index+2] = rColor[2]/2.0;
            data[index+3] = 255;
        }
    }

    const bounding = c.getBoundingClientRect();
    ctx.putImageData(image_data, 0,0);
}

//special selection event only for flood fill effect
function pick(event) {
    const bounding = c.getBoundingClientRect();

    //get the x and y locations relative to the upper lefthand location of the canvas (canvas internal 0,0)
    const x_coord = Math.floor(event.clientX - bounding.left);
    const y_coord = Math.floor(event.clientY - bounding.top);
    console.log("X: "+event.clientX)
    console.log("mouseX: " + mouse.x)
    const pixel = ctx.getImageData(x_coord, y_coord, 1, 1);
    const pixel_data = pixel.data;
    console.log("bounding " + bounding.left)

    //make everything gray for texting
    // const image_data = ctx.getImageData(0,0,c.width,c.height);
    // for(var i = 0; i<image_data.data.length; i++) {
    //     image_data.data[i]=150;
    // }
    // ctx.putImageData(image_data, 0,0)

    if (pixel_data[3]==0) {
        // pixel_data[0]=255;
        // pixel_data[3]=255;
        // ctx.putImageData(pixel, x_coord, y_coord)
        // console.log("yep")
        floodFill(x_coord,y_coord);
    } else {
        console.log("nope")
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