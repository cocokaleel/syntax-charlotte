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

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.selected = false;
    }
    draw = () => {
        if (!mouse.down) {
            this.selected = false;
        }
        if (Math.sqrt(Math.pow(mouse.x - (this.x + this.radius), 2) + Math.pow(mouse.y - (this.y + this.radius), 2)) < 10) {
            if (mouse.down) {
                this.selected = true;
            }
            // this is where we control the shape's appearance
            ctx.beginPath();
            ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
            ctx.fill();
        }
    };
    moveTo = (x, y) => {
        this.x = x;
        this.y = y;
    }
}

class Line {
    //input an array of nested length-2 arrays of positions
    constructor(points_array) {
        this.points = [];
        points_array.forEach((point) => {
            this.points.push(new Point(point[0], point[1]));
        });
    }
    draw = () => {
        if (this.points.length > 1) {
            // Start a new Path
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (var i = 1; i < this.points.length; i++) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            }
            // Draw the Path
            ctx.stroke();

            this.points.forEach((point) => {
                point.draw()
            })
        }
    };
    update = () => {
        var selectedIndex = -1;
        for (let i = 1; i < this.points.length; i++) {
            if (this.points[i].selected) {
                selectedIndex = i;
                // this.points[i].moveTo(mouse.x, mouse.y)
            }
        }
        //just move points after point, anchor to point before it (except first point, which is unmoveable)
        if (selectedIndex != -1 && selectedIndex != 0) {
            var origin = this.points[selectedIndex - 1]
            var thisPoint = this.points[selectedIndex]
            var originalLength = Math.sqrt(Math.pow(origin.x - thisPoint.x, 2) + Math.pow(origin.y - thisPoint.y, 2))
            var distToMouse = Math.sqrt(Math.pow(mouse.x - origin.x, 2) + Math.pow(mouse.y - origin.y, 2))
            //calculate new position that maintains length by finding point on vector to new point
            var newPosition = [origin.x + (originalLength / distToMouse) * (mouse.x - origin.x),
            origin.y + (originalLength / distToMouse) * (mouse.y - origin.y)]

            var distToNewPosition = Math.sqrt(Math.pow(thisPoint.x - newPosition[0], 2) + Math.pow(thisPoint.y - newPosition[1], 2))
            var originToOld = [thisPoint.x-origin.x, thisPoint.y-origin.y];
            var originToNew = [newPosition[0]-origin.x, newPosition[1]-origin.y];
            var magOld = Math.sqrt(Math.pow(originToOld[0],2)+Math.pow(originToOld[1],2))//magnitude of the originToOld vector
            var magNew = Math.sqrt(Math.pow(originToNew[0], 2)+Math.pow(originToNew[1],2))//magitude of the originToNew vector
            // console.log("internal: " + (originToOld[0]*originToNew[0]+originToOld[1]*originToNew[1])/(magOld*magNew))
            var angle = Math.asin ((originToOld[0]*originToNew[1]-originToNew[0]*originToOld[1])/(magOld*magNew)) // do it this way to make it polar??
            if (isNaN(angle)) {
                angle = 0;
            }
            // console.log(2 * Math.asin((distToNewPosition / 2)/originalLength))
            this.points[selectedIndex].moveTo(newPosition[0], newPosition[1])
            
            for (var i = selectedIndex + 1; i < this.points.length; i++) {
                // x_rotated = ((x - dx) * cos(angle)) - ((dy - y) * sin(angle)) + dx
                // y_rotated = dy - ((dy - y) * cos(angle)) + ((x - dx) * sin(angle))
                var currentPoint = this.points[i];

                // currentPoint.x -= origin.x;
                // currentPoint.y -= origin.y;

                
                // originalLength = Math.sqrt(Math.pow(origin.x - currentPoint.x, 2) + Math.pow(origin.y - currentPoint.y, 2))
                // var dx = originalLength * Math.sin(angle);
                // var dy = originalLength - originalLength*Math.cos(angle);
                var s = Math.sin(angle)
                var c = Math.cos(angle);
                var oX = currentPoint.x-origin.x;
                var oY = currentPoint.y-origin.y
                var x_rotated = oX * c - oY * s;
                var y_rotated = oX * s + oY * c;
                x_rotated += origin.x;
                y_rotated += origin.y;
                // console.log("angle "+angle)
                // var y_rotated = currentPoint.y + dy;
                // console.log("x: "+x_rotated+" y: "+y_rotated)
                this.points[i].moveTo(x_rotated,y_rotated)
            }
        }
    };
}


var lines = [new Line([[200, 200], [500, 350], [400, 600]])]

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

animate();

var leg = new Image();
leg.src = './assets/images/ants/leg1A.png'
leg.onload = () => {
    ctx.save()
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(-1 * Math.PI/2);
    ctx.drawImage(leg, leg.width/2, leg.height/2)
    ctx.restore()
}
