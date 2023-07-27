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
    };
    moveTo = (x, y) => {
        this.x = x;
        this.y = y;
    }
}

class Segment {
    constructor(handle_location, angle, url, imgWidth, imgHeight, child) {
        this.handle_location = handle_location;
        this.currentAngle = angle
        this.child = child;
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        this.image = new Image();
        this.image.src = "assets/images/ants/" + url;
        this.ready = false;
        this.image.onload = () => { this.ready = true; }
    }
    init(xUL, yUL, joint) {
        this.xUL = xUL;
        this.yUL = yUL;
        this.handle = joint;
    }
    draw = () => {
        if (this.ready) {
            ctx.drawImage(this.image, this.xUL, this.yUL)
        } else {
            console.log("not ready")
        }
        this.handle.update();//todo move me
        this.handle.draw()
    };
    update = () => {

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
        var runningXUL = this.startX; //
        var runningYUL = this.startY;
        while (!(currentSeg === undefined)) {
            console.log('do i happen')
            var handleX = runningXUL;
            var handleY = runningYUL;
            //find the handle X and Y based on it's location on the image
            if (currentSeg.handle_location == 'bottom-left') {
                handleY += currentSeg.imgHeight;
            } else if (currentSeg.handle_location == 'bottom-right') {
                handleY += currentSeg.imgHeight;
                handleX += currentSeg.imgWidth;
            } else if (currentSeg.handle_location == 'top-right') {
                handleX += currentSeg.imgWidth;
            }
            console.log('handleX' + handleX)
            console.log('handle y ' + handleY)
            currentSeg.init(runningXUL, runningYUL, new Joint(handleX, handleY))
            //move the running X and Y based on where the handle location is
            //find the handle X and Y based on it's location on the image
            if (!(currentSeg.child === undefined)) {
                if (currentSeg.handle_location == 'bottom-left') {
                    runningYUL += currentSeg.imgHeight;
                    runningXUL -= currentSeg.child.imgWidth;
                } else if (currentSeg.handle_location == 'bottom-right') {
                    runningXUL += currentSeg.imgWidth;
                    runningYUL += currentSeg.imgHeight;
                } else if (currentSeg.handle_location == 'top-right') {
                    runningXUL += currentSeg.imgWidth;
                    runningYUL -= currentSeg.imgHeight;
                }
            }
            currentSeg = currentSeg.child
        }
    }
    draw = () => {
        var currentSeg = this.segmentRoot;
        ctx.save();
        while (!(currentSeg === undefined)) {
            ctx.rotate(currentSeg.angle);
            currentSeg.draw();
            currentSeg = currentSeg.child;
        }
        ctx.restore();
    };
    update = () => {

    };
}


var lines = [new Line(100, 100, [['bottom-left', 0, 'leg1A.png', 93, 110], ['bottom-left', 0, 'leg1B.png', 71, 135]])]

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    lines.forEach((line) => {
        line.draw();
        // console.log('hi')
    })
    lines.forEach((line) => {
        line.update();
    })
}

animate();