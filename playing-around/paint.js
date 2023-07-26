let mouse = {
    x: undefined,
    y: undefined
};
window.addEventListener('mouseup', function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
});

var paintCanvas = document.getElementById("paint_canvas");
var paintContext = paintCanvas.getContext("2d");

const paint_image = document.getElementById("paint_image");

paintContext.clearRect(0, 0, window.innerWidth, window.innerHeight);


//only pass in empty sections
function floodFill(x_coord,y_coord) {
    //get the ImageData object wrapper from the context
    const image_data = paintContext.getImageData(0,0,paintCanvas.width,paintCanvas.height);
    //extract the Uint8ClampedArray from ImageData
    var data = image_data.data;
    
    //use FloodFill algorithm with a queue to edit data array while running checks on it (visited-checks are done by color, only empty space can be colored in)
    //https://en.wikipedia.org/wiki/Flood_fill
    var queue = [];
    
    queue.push([x_coord, y_coord]);

    var rColor = [Math.random()*255, Math.random()*255, Math.random()*255];

    while (queue.length != 0) {
        var n = queue.shift();
        var x = n[0];
        var y = n[1];
        const pixel = paintContext.getImageData(x, y, 1, 1);
        const pixel_data = pixel.data;

        //locate the pixel in the Uint8ClampedArray of the data object
        const index = 4*(y*paintCanvas.width+x);
        
        if (data[index+3]==0&&data[index+3]!=125) {
            //pixel is empty so the up, down, left, and right should be added

            //change the pixel to be colored in
            data[index] = rColor[0];
            data[index+1] = rColor[1];
            data[index+2] = rColor[2];
            data[index+3] = 125;

            if (x-1>=0){queue.push([x-1,y]);}
            if (x+1<paintCanvas.width) {queue.push([x+1, y]);}
            if (y-1>=0) {queue.push([x, y-1]);} else {console.log("nopedy")}
            if (y+1<paintCanvas.height) {queue.push([x, y+1]);} else {console.log("nope")}
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

    paintContext.putImageData(image_data, 0,0);
}

function pick(event) {
    const bounding = paintCanvas.getBoundingClientRect();

    //get the x and y locations relative to the upper lefthand location of the canvas (canvas internal 0,0)
    const x_coord = event.clientX - bounding.left;
    const y_coord = event.clientY - bounding.top;
    const pixel = paintContext.getImageData(x_coord, y_coord, 1, 1);
    const pixel_data = pixel.data;

    if (pixel_data[0]==0&&pixel_data[1]==0&&pixel_data[2]==0) {
        floodFill(x_coord,y_coord);
    }
}
  
paintCanvas.addEventListener("click", (event) => pick(event));


//ZONE OF LEARNING

    //example code for overwriting entire image
    // for (var i = Math.max(x_coord-5, 0); i<Math.min(paintCanvas.width, x_coord+5); i++) {
    //     for (var j = Math.max(y_coord-5, 0); j<Math.min(y_coord+5,paintCanvas.height); j++) {
    //         const index = 4*(j*paintCanvas.width+i);
            
    //         data[index] = 255;
    //         data[index+1] = 0;
    //         data[index+2] = 0;
    //         data[index+3] = 255;
    //     }
    // }

paintContext.drawImage(paint_image, 0,0, 1000, 1000);