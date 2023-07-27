var canvas = document.getElementById("rotate_canvas")
var ctx = canvas.getContext("2d")

let mouse = {
    x: undefined,
    y: undefined,
    down: false
};
window.addEventListener('mousemove', function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
});
window.addEventListener('mousedown', () => {
    mouse.down = true;
})
window.addEventListener('mouseup', () => { mouse.down = false; })

class Joint {
    //x,y are in relation to the original canvas origin
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.selected = false;
    }
    draw = () => {
        if (this.selected) {
            // this is where we control the shape's appearance
            ctx.fillStyle = "red"
            ctx.beginPath();
            ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
            ctx.fill();
        }
    };
    update = () => {
        //when the mouse gets picked up, deselect this joint
        if (this.selected && !mouse.down) {
            this.selected = false;
        }
        if (Math.sqrt(Math.pow(this.x - mouse.x + 5, 2) + Math.sqrt(Math.pow(this.y - mouse.y-5, 2)))<10) {
            this.selected = true;
        }
        this.draw();
    };
    moveTo = (x, y) => {
        this.x = x;
        this.y = y;
    }
}

class Segment {
    constructor(handle_location, angle, url, imgWidth, imgHeight, child) {
        this.handle_location = handle_location;
        this.currentAngle = 0
        console.log("currentAngle: " + this.currentAngle)
        this.child = child;
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        this.image = new Image();
        this.image.src = "assets/images/ants/" + url;
        this.ready = false;
        this.image.onload = () => { this.ready = true; }
    }
    init(xUL, yUL, xH, yH, jointX, jointY) {
        //dxUL and dyUL are set with the parent's UL as origin
        this.dxUL = xUL;
        this.dyUL = yUL;
        this.dxHandle = xH;
        this.dyHandle = yH;
        this.handle = new Joint(jointX, jointY)
    }
    draw = () => {
        if (this.ready) {
            ctx.drawImage(this.image, this.dxUL,this.dyUL)
            ctx.strokeRect(this.dxUL, this.dyUL, this.image.width, this.image.height);
            
            ctx.translate(this.dxHandle, this.dyHandle)

        } else {
            console.log("not ready")
        }
    };
    rotate = (originX, originY, angle) => {
        //todo fill out with information about how to rotate about the specified origin
    }
    update = () => {
        this.handle.update();
        //check for rotation asks
        // if (this.handle.selected) {

        // }
        //calculate how far mouse has moved and implied angle from there
    };
}

class Line {
    // x, y = start point for the line of images
    // a list of segment information: [the attachment site to the next segment, the angle difference, and the image url]
    constructor(x, y, segments) {
        this.startX = x;
        this.startY = y;
        this.segmentRoot = undefined;

        var seg;

        //initialize the link-list structure
        for (var i = segments.length - 1; i >= 0; i--) {
            console.log('init started')
            this.segmentRoot = new Segment(segments[i][0], segments[i][1], segments[i][2], segments[i][3], segments[i][4], seg)
            console.log(this.segmentRoot)
            seg = this.segmentRoot;
        }
        var currentSeg = this.segmentRoot;
        var runningHandleRealX = this.startX;
        var runningHandleRealY = this.startY;

        var dxH = 0;
        var dyH = 0;
        while (!(currentSeg === undefined)) {
            var dxUL = -currentSeg.imgWidth;
            var dyUL = 0;
            var dxH = -currentSeg.imgWidth;
            var dyH = currentSeg.imgHeight;

            runningHandleRealX+=dxH;
            runningHandleRealY+=dyH;


            currentSeg.init(dxUL, dyUL, dxH, dyH, runningHandleRealX, runningHandleRealY)

            currentSeg = currentSeg.child
        }
    }
    draw = () => {
        var currentSeg = this.segmentRoot;
        ctx.save();
        ctx.translate(this.startX, this.startY)
        while (!(currentSeg === undefined)) {
            // console.log(currentSeg.currentAngle);
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


var lines = [new Line(300, 300, [['bottom-left', 0, 'leg1A.png', 93, 110], ['bottom-left', 0, 'leg1B.png', 71, 135]])]

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    lines.forEach((line) => {
        line.update();
    })
    lines.forEach((line) => {
        line.draw();
    })
}

animate();