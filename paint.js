let mouse = {
    x: undefined,
    y: undefined
};
window.addEventListener('mouseup', function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
    console.log(mouse.x + ", " + mouse.y);
});
var paintCanvas = document.getElementById("paint_canvas");
var paintContext = paintCanvas.getContext("2d");

const paint_image = document.getElementById("paint_image");

paintContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

paintContext.drawImage(paint_image, 0,0, 1000, 1000);

function pick(event) { //, destination
    const bounding = paintCanvas.getBoundingClientRect();
    const x = event.clientX - bounding.left;
    const y = event.clientY - bounding.top;
    const pixel = paintContext.getImageData(x, y, 1, 1);
    const pixel_data = pixel.data;
    
    const image_data = paintContext.getImageData(bounding.left,bounding.top,bounding.right,bounding.bottom);
  
    const rgba = `rgba(${pixel_data[0]}, ${pixel_data[1]}, ${pixel_data[2]}, ${pixel_data[3] / 255})`;

    console.log(rgba);
    return rgba;
}
  
paintCanvas.addEventListener("click", (event) => pick(event)); //, selectedColor