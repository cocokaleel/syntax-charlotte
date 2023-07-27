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

class Segment {
    constructor(x,y, handle_location, angle, url) {
        this.upper_left_x = x;
        this.upper_left_y = y;
        this.handle_location = handle_location
        this.currentAngle = angle
        this.image = new Image();
        this.image.src = "assets/images/ants/"+url;
    }
    draw = () => {

    };
}

class Line {
    //x, y = start point for the line of images
    // a list of segment information: the attachment site to the previous segment, the angle difference, and the image url
    constructor(x, y, segments) {
        this.startX = x;
        this.startY = y;
        this.segments = []
        var runningX = x;
        var runningY = y;
        segments.forEach((segment)=> {
            if(this.segments[this.segments.length-1].handle_location == "bottom-left")
            var handle_location = segment[0]
            var angle = segment[1]
            var url = segment[2]
            var seg = new Segment(runningX, runningY, handle_location, angle, url);
            if (handle_location == "bottom-right") {
                runningX += seg.image.width;
                runningY += seg.image.height;
            } else if (handle_location == "bottom-left") {
                runningY += seg.image.height;
            }
        })
    }
    draw = () => {
        
    };
    update = () => {
        
    };
}


var lines = [new Line(100, 100, [['bottom-left', 0,'leg1A.png'],['bottom-left', 0, 'leg1B.png']])]

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    lines.forEach((line) => {
        line.draw();
    })
    lines.forEach((line) => {
        line.update();
    })
}
