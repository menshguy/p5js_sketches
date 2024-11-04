let buffers, rowhomes, bottom;
let cw = 600;
let ch = 600;

function setup() {
  let canvas = createCanvas(cw, ch);
  canvas.parent('#canvas-container');
  colorMode(HSL);
}

function draw() {
  background("antiquewhite");
  noLoop();
  bottom = height - 100;

  drawSquigglyLine(50, bottom, width - 100, 0);

  let numTrees = floor(random(5, 12))
  let x = 100;
  for (let i = 0; i < numTrees; i++) {
    let w = null // Not using yet
    let h = floor(random(100,200))
    let y = bottom - h
    marker_line(x, y, w, h)
    x += random(10, width/numTrees);
  }
}

// Function to draw a single squiggly line
function drawSquigglyLine(x, y, length, angle) {
  let segments = floor(length / 5); // Number of small segments in the line
  let amp = 0.75;                  // Amplitude of squiggle
  noFill();
  // stroke(color(30, 28, 57))
  stroke(0)
  strokeWeight(1);                // Thinner lines for finer ink-like detail

  beginShape();
  for (let i = 0; i < segments; i++) {
    let offsetX = cos(angle) * i * 5 + sin(angle) * random(-amp, amp);
    let offsetY = sin(angle) * i * 5 + cos(angle) * random(-amp, amp);

    let px = x + offsetX;
    let py = y + offsetY;

    vertex(px, py);
  }
  endShape();
}

function marker_line (x, y, w, h, settings={}) {
  let {fill_c, stroke_c, stroke_w} = settings;
  let numLines = 8;
  
  stroke(stroke_c || "black")
  strokeWeight(stroke_w || 1)
  // fill(fill_c || "white")
  // rect(x, y, w, h)
  let lean = random(["left", "sraight", "right"])

  
  for (let i = 0; i < numLines; i++) {  // Draw multiple lines to make it look rough
    
    let x2;
    switch (lean) {
      case "left":
        x2 = random(-12, -6);
        break;
      case "right":
        x2 = random(5, 12);
        break;
      case "straight":
        x2 = random(-6, 6);
        break;
    }
    
    line(
      x + random(-2, 2), 
      y + random(-2, 2), 
      x + x2, 
      y + h + random(-2, 2)
    );
  }
}

// -- Events -- //
function mousePressed(){
  if (mouseX >= 0 && mouseX <= cw && mouseY >= 0 && mouseY <= ch) {
    clear();
    redraw();
  }
}