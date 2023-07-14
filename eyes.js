let mouse = {
    x: undefined,
    y: undefined
};
window.addEventListener('mousemove', function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
    console.log(mouse.x + ", " + mouse.y);
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
        // this is where we control the shape's appearance
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, 8, 0, 2 * Math.PI);
        // ctx.fill();


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



// context.drawImage(img, x, y, width, height);
let eye1 = new Eye(imageX+372,imageY+345);
let eye2 = new Eye(imageX+381,imageY+500);
let eye3 = new Eye(imageX+607,imageY+515);
let eye4 = new Eye(imageX+627,imageY+342);
let eyes = [eye1, eye2, eye3, eye4];

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    eyes.forEach(eye => {
        eye.update();
    })
    ctx.drawImage(image, imageX, imageY, 1000, 1000);
};

animate();