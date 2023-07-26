import eyesData from './eyes.json' assert { type: 'json' };
console.log(eyesData);


let mouse = {
    x: undefined,
    y: undefined
};
window.addEventListener('mousemove', function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
});
var c = document.getElementById("eyes_canvas");
var ctx = c.getContext("2d");

c.width = window.innerWidth;
c.height = window.innerHeight;
console.log("CVS width" + c.width);

window.addEventListener('resize', function () {
  c.width = window.innerWidth;
  c.height = window.innerHeight;
});


const image = document.getElementById("face_image");
let imageX = 200;
let imageY = 0;


const eyeImage = document.getElementById("eye_image");
class Eye {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.initialY = y;
    };
    draw = () => {
        ctx.drawImage(eyeImage, this.x, this.y, 21, 23);
    };
    update = () => {
        // this is where we control movement and interactivity
        let distX = 1000 - this.initialX;
        let curDistX = mouse.x - this.initialX;
        let moveX = 10 * curDistX/distX;
        this.x = this.initialX + moveX;


        let distY = 1000 - this.initialY;
        let curDistY = mouse.y - this.initialY;
        let moveY = 10 * curDistY/distY;
        this.y = this.initialY + moveY;

        this.draw();
    };
};



// LOAD IN THE EYES DATA FROM EYES.JSON
let eyes = [];
eyesData['eye-coordinates'].forEach((eye)=>{
    eyes.push(new Eye(imageX+eye[0], imageY+eye[1]))
    console.log("Added eye")
})

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    eyes.forEach(eye => {
        eye.update();
    })
    ctx.drawImage(image, imageX, imageY, 1000, 0.9*window.innerHeight);
};

animate();