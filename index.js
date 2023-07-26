import data from './data.json' assert { type: 'json' };
console.log(data);

//define global variables
let piece_index = 0;
let animation_request_id = undefined;
let mouse = {
    x: undefined,
    y: undefined
};

window.addEventListener('mousemove', function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
});
var c = document.getElementById("main_canvas");
var ctx = c.getContext("2d");

c.width = window.innerWidth;
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
            runEyes(piece_name, img)

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

    let imageX = 200;
    let imageY = 0;

    let eyes = [];

    // const eyeImage = new Image(data[pieceName]["eyes-image-name"]);
    class Eye {
        constructor(x, y) {
            this.eyeImage = new Image();
            this.eyeReady = false;
            this.eyeImage.src = "assets/images/"+data[pieceName]["eye-image-name"];
            this.x = x;
            this.y = y;
            this.initialX = x;
            this.initialY = y;

            this.eyeImage.onload = () => {
                ctx.drawImage(this.eyeImage, this.x, this.y, 21, 23);
                this.eyeReady = true;
            }
        };
        draw = () => {
            if (this.eyeReady) {
                ctx.drawImage(this.eyeImage, this.x, this.y*window.innerHeight/1000, 21, 23);
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
                ctx.fill();
            }
        };
        update = () => {
            // this is where we control movement and interactivity
            let distX = window.innerWidth - this.initialX;
            let curDistX = mouse.x - this.initialX;
            let moveX = 10 * curDistX / distX;
            this.x = this.initialX + moveX;


            let distY = window.innerHeight - this.initialY;
            let curDistY = mouse.y - this.initialY;
            let moveY = 10 * curDistY / distY;
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
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        eyes.forEach(eye => {
            eye.update();
        })
        ctx.drawImage(image, imageX, imageY, 1000, window.innerHeight);
    }
    initEyes();
    animateEyes();
}

function stop() {
    if (animation_request_id) {
        window.cancelAnimationFrame(animation_request_id);
        animation_request_id = undefined;
    }
}