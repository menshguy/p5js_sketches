console.log("rh runs...")
let buffers, rowhomes, bottom;
let cw = 600;
let ch = 600;

function setup() {
  let canvas = createCanvas(cw, ch);
  canvas.parent('#canvas-container');
  colorMode(HSL);
  bottom = 100;
}

function draw() {
  background("antiquewhite");
  noLoop();
  
  line(50, height-bottom, width-50, height-bottom)
}

// -- Events -- //
function mousePressed(){
  // Check if mouse is inside canvas
  if (mouseX >= 0 && mouseX <= cw && mouseY >= 0 && mouseY <= ch) {
    clear();
    setup();
    redraw();
  }
}