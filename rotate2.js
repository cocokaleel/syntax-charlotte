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
    // console.log("mousex " + mouse.x + " mousey " + mouse.y)
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
        if (Math.sqrt(Math.pow(this.x - mouse.x + 5, 2) + Math.sqrt(Math.pow(this.y - mouse.y - 5, 2))) < 10) {
            if (mouse.down) {this.selected = true;}
            this.draw();
        }

    };
    moveTo = (x, y) => {
        this.x = x;
        this.y = y;
    }
    rotateAbout = (originX, originY, angle) => {
        //rotate about the specified origin
        var x = this.x;
        var y = this.y;
        x -= originX
        y -= originY
        var cos = Math.cos(-angle % (2*Math.PI))
        var sin = Math.sin(-angle % (2*Math.PI))
        var newX = (x*cos + y*sin) + originX;
        var newY = (y*cos + -x*sin) + originY;
        this.x = newX;
        this.y = newY;
    }
}

class Segment {
    constructor(handle_location, angle, url, child) {
        this.handle_location = handle_location;
        this.currentAngle = 0
        this.initialAngle = angle
        this.child = child;
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
            ctx.drawImage(this.image, this.dxUL, this.dyUL)
            // ctx.strokeRect(this.dxUL, this.dyUL, this.image.width, this.image.height);

            ctx.translate(this.dxHandle, this.dyHandle)

        } else {
            console.log("not ready")
        }
    };
    update = () => {
        this.handle.update();
        //check for rotation asks
        if (this.child && this.child.handle.selected) {
            //calculate how far mouse has moved and implied angle from there
            var directionHandleToMouse = [mouse.x - this.handle.x, mouse.y - this.handle.y]
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
                // console.log(seg.handle)
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
        this.segmentRoot = undefined;

        var seg;

        //initialize the link-list structure
        for (var i = segments.length - 1; i >= 0; i--) {
            console.log('init started')
            this.segmentRoot = new Segment(segments[i][0], segments[i][1], segments[i][2], seg)
            console.log(this.segmentRoot)
            seg = this.segmentRoot;
        }
        var currentSeg = this.segmentRoot;
        var runningHandleRealX = this.startX;
        var runningHandleRealY = this.startY;

        var dxH = 0;
        var dyH = 0;
        var last_handle_position = currentSeg.handle_location
        var last_seg_width = 0;
        var last_seg_height = 0;
        while (!(currentSeg === undefined)) {
            if (last_handle_position == "bottom-left") {
                var dxUL = -currentSeg.image.width;
                var dyUL = 0;
                var dxH = -currentSeg.image.width;
                var dyH = currentSeg.image.height;
            } else if (last_handle_position == "bottom-right"){
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

            runningHandleRealX += dxH;
            runningHandleRealY += dyH;


            currentSeg.init(dxUL, dyUL, dxH, dyH, runningHandleRealX, runningHandleRealY)
            last_handle_position = currentSeg.handle_location
            last_seg_width = currentSeg.image.width
            last_seg_height = currentSeg.image.height
            
            currentSeg = currentSeg.child
        }

        //set up initial angles
        currentSeg = this.segmentRoot;
        while (!(currentSeg === undefined)) {
            //rotate handles
            if (!(currentSeg.child===undefined)) {
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


var lines = [new Line(190, 475, [['bottom-left', 0, 'leg1A.png'],['bottom-left', -Math.PI/8, 'leg1B.png'], ['bottom-left', -Math.PI/4, 'leg1C.png']]),
            new Line(200,500,[['bottom-right', 0, 'leg2A.png'], ['bottom-left', 0, 'leg2B.png']]),
            new Line(400,491,[['bottom-right', 0, 'leg3A.png'], ['bottom-right', 0, 'leg3B.png']]),
            new Line(540,460,[['bottom-left', 0, 'leg4A.png'], ['bottom-left', 0.6, 'leg4B.png']]),
            new Line(650,450,[['bottom-right', 0, 'leg5A.png'], ['bottom-left', 0, 'leg5B.png'], ['bottom-left',0,'leg5C.png'],['bottom-left',0,'leg5D.png'],['bottom-left',0,'leg5E.png']]),
            new Line(700,500,[['bottom-left', 0, 'leg6A.png'], ['bottom-left', 0, 'leg6B.png'], ['bottom-left',0,'leg6C.png']]),
            new Line(400,380,[['top-right', 0, 'leg7A.png'], ['top-right', 0, 'leg7B.png']])
        ]


var antsNoLegsImage = new Image;
antsNoLegsImage.src = './assets/images/ants/antsnolegs.png'

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "black"
    // ctx.fillRect(0,0, window.innerWidth, window.innerHeight);
    ctx.drawImage(antsNoLegsImage, 0,0)
    lines.forEach((line) => {
        line.update();
    })
    lines.forEach((line) => {
        line.draw();
    })
}

animate();