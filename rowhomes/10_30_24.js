console.log("rh runs...")
let buffers, rowhomes, bottom;
let cw, ch;

function setup() {
  // Calc distance from canvas to top of screen
  let container = document.getElementById("canvas-container")
  let rect = container.getBoundingClientRect();
  let distanceFromTop = rect.top;

  // Set width and height to full window
  cw = windowWidth || 600;
  ch = (windowHeight - distanceFromTop) || 600;
  let canvas = createCanvas(cw, ch);
  canvas.parent('#canvas-container');

  //General Settings
  colorMode(HSL);
  bottom = 25;
  rowhomes = [];
  buffers = [];

  //Draw Main Rowhome
  const h = random(ch/3, ch);
  const w = random(ch/6, cw);
  const x = (width - w) / 2;
  const y = height - bottom;
  const fill_c = color(23, 100, 54)
  const rowhome = new Rowhome({x, y, w, h, fill_c});
  rowhomes.push(rowhome)

  //Draw a rowhome to the left
  const lh = random(ch/3, ch);
  const lw = random(ch/6, cw);
  const lx = (x - lw) - 2; //start at the main rowhom x and move over to the left by this rowhomes w
  const ly = height - bottom;
  const fill_lc = color(23, 100, 94)
  const rowhome_left = new Rowhome({x:lx, y:ly, w:lw, h:lh, fill_c:fill_lc})
  rowhomes.push(rowhome_left)

  //Draw a rowhome to the right
  const rh = random(ch/3, ch);
  const rw = random(ch/6, cw);
  const rx = (x + w) + 2; //start at the main rowhom x and move over to the right by main row home w
  const ry = height - bottom;
  const fill_rc = color(23, 100, 94)
  const rowhome_right = new Rowhome({x:rx, y:ry, w:rw, h:rh, fill_c:fill_rc})
  rowhomes.push(rowhome_right)

  //If there is still space to the left, draw yet another home (TODO: Make more dynamic)
  if (lx > 0) {
    const h = random(ch/3, ch);
    const w = random(ch/6, cw);
    const x = (lx - w) - 2; 
    const y = height - bottom;
    const fill_c = color(23, 100, 94)
    const rowhome_left = new Rowhome({x, y, w, h, fill_c})
    rowhomes.push(rowhome_left)
  }

  //If there is still space to the right, draw yet another home (TODO: Make more dynamic)
  if (rx + rw < width) {
    const h = random(ch/3, ch);
    const w = random(ch/6, cw);
    const x = (rx + w) + 2; 
    const y = height - bottom;
    const fill_c = color(23, 100, 94)
    const rowhome_right = new Rowhome({x, y, w, h, fill_c})
    rowhomes.push(rowhome_right)
  }
}

function draw() {
  background(183, 52, 88);
  noStroke();
  noLoop();
  
  buffers.forEach(buffer => { buffer?.clear() }) // Clear the graphics buffers
  rowhomes.forEach(rowhome => rowhome.draw()) // Draw rowhomes
  marker_rect(0, height-bottom, width, bottom, color(204, 14, 60)) // Draw Sidewalk
}

class Rowhome {
  constructor ({x, y, w, h, fill_c="red", stroke_c="black"}) {
    Object.assign(this, {x, y, w, h, fill_c, stroke_c})
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.fill_c = fill_c;
    this.stroke_c = stroke_c;
    this.configs = [
      {min:0,   max:80,  proportion:random([0, random(0.05, 0.1)]),    content:['window']},
      {min:100, max:200, proportion:random(0.25, 0.35),                content:['window', 'window']},
      {min:100, max:150, proportion:random([0, random(0.2, 0.25)]),    content:['circle', 'window']},
      {min:0,   max:150, proportion:random([0, random(0.2, 0.25)]),    content:['circle', 'window']},
      {min:0,   max:150, proportion:random([0, random(0.2, 0.25)]),    content:['circle', 'window']},
      {min:20,   max:150, proportion:random(0.05, 0.25),               content:['circle', 'window']},
    ]
    this.numFloors = this.configs.length;
    this.totalHeight = this.configs.reduce((a, b) => a + b.proportion, 0); //sum of floor all proportions. Needed to calculate floor heights
    this.allFloors = this.generateAllFloors();
  }
  
  /**
   * Generates all the x,y,w,h and content data for each floor in the home.
   * @returns {Array} returns a nested array for FloorSections, 
   * @example [[x,y,w,h,content,fill_c, stroke_c], ...]
   */
  generateAllFloors() {
    let {x, y, w, h, totalHeight, configs} = this;
    return configs.map((config, i) => {
      //TODO: Fix this so that the total height is never exceeded
      let fh = h/totalHeight * config.proportion; //find each floors height based on asigned proportion
      if (fh > config.max) fh = config.max;
      if (fh < config.min) fh = config.min;
      y -= fh;
      return this.generateFloorSections({x, y, w, h:fh, config})
    })
  }
  
  /**
   * Generates all the x,y,w,h and content data for each FloorSection and returns a nestary array of FloorSections
   * @returns {Array} returns a nested array for FloorSections, [[x,y,w,h,content,fill_c, stroke_c],[x,y,w,h,content], ...]
   * @example [FloorSection, FloorSection, ...]
   */
  generateFloorSections({x, y, w, h, config}){
    let {fill_c, numFloors} = this;
    let {content} = config
    let numCols = random([2,2,3,3,3,4,4,4,4,5])
    let sectionProportions = getSectionProportions(numCols)
    let sections = getSections(sectionProportions, numCols)
    return sections;
    
    //create an array populated with the proportion value of each section
    function getSectionProportions(numCols) {
      let sectionProportions = [];
      let remainder = numCols;
      for (let j = 0; j < numCols; j++) {
        // if it's the last index, we assign the remainder to the last index
        let value = j === numCols - 1 ? remainder : floor(random(0, remainder + 1));
        remainder -= value;
        sectionProportions.push(value);
      }
      return sectionProportions;
    }
    
    
    //Use the proportion values generated above to calculate the actual width of each section
    function getSections(sectionProportions, numCols) {
      let sx = x;
      return sectionProportions.map(p => {
        let sw = (w/numCols) * p
        let floorSection = new FloorSection({
          x:sx, y, w:sw, h, content: random(content), fill_c
        });
        sx += sw;
        return floorSection;
      })
    }
  }

  drawFullHouseForTesting(){
    // this doesnt work at the moment
    let {x,y,w,h} = this;
    fill("red");
    rect(x-5, ch-y-5, w+10, h+10);
    noFill();
  }

  drawFloors() {
    let {allFloors} = this;
    allFloors.forEach(floor => {
      floor.forEach(floor_section => {
        if(floor_section.w) floor_section.draw();
      })
    });
  }

  draw() {
    this.drawFloors();
    if (false) this.drawFullHouseForTesting();
  }
}

class FloorSection {
  constructor({x, y, w, h, content, fill_c="yellow", stroke_c = "black"}){
    let fill_c_dark = color(hue(fill_c), saturation(fill_c), max(0, lightness(fill_c) - 10));
    Object.assign(this, {x, y, w, h, content, stroke_c, fill_c, fill_c_dark})
  }

  setStyles() {
    let {fill_c, fill_c_dark, stroke_c} = this;
    stroke(fill_c_dark)
    strokeWeight(1)
    fill(fill_c)
  }

  unSetStyles() {
    noStroke();
    noFill()
  }

  drawFloorBG() {
    let {x,y,w,h} = this;
    rect(x,y,w,h)
  }

  drawContent() {
    let {x, y, w, h, fill_c_dark, content, i} = this;
    switch (content) {
      case "door":
        drawDoor(x, y, w, h, fill_c_dark)
        break;
      case "window":
        drawWindow(x, y, w, h, fill_c_dark)
        break;
      case "circle":
        drawWindow(x, y, w, h, fill_c_dark)
        break;
      default:
        console.error("Section content does not exist:", content, i)
        break;
    }
  }

  drawTexture() {
    if (this.w <= 0 || this.h <= 0) {
      console.error("Invalid buffer dimensions", this.w, this.h);
      return;
    }

    let shadowBuffer = createGraphics(this.w, this.h);
    let shadowMaskBuffer = createGraphics(this.w, this.h);
    buffers.push(shadowBuffer, shadowMaskBuffer); // This will let us clear all buffers later

    drawTextureHatches(0, 0, this.w, this.h, shadowBuffer);

    shadowMaskBuffer.fill("black");
    shadowMaskBuffer.rect(0, 0, this.w, this.h);
    shadowMaskBuffer.noFill();

    let shadowImage = shadowBuffer.get(); // Get the current state of the graphics buffers
    let shadowMask = shadowMaskBuffer.get();
    // shadowImage.filter(BLUR, 1)
    
    shadowImage.mask(shadowMask); // Use the mask on the image
    
    blendMode(BURN);
    image(shadowImage, this.x, this.y);
    blendMode(BLEND); // Reset blend mode to default
  }

  draw () {
    if (this.h !== 0 && this.w !== 0) {
      this.setStyles();
      this.drawFloorBG();
      this.drawContent();
      this.drawTexture();
      this.unSetStyles();
    }
  }
}

//-- Details --//
function drawDoor (x, y, w, h, fill_c) {
  // x,y should always be relative to the current section, so 
  let sw = random(40, 50);
  let sh = random(80, 100);

  let centered = x + (w/2) - (sw/2);
  let aligned_left = x + random(5, 10);
  let aligned_right = x + w - (sw + random(5, 10));
  let sx = random([centered, aligned_left, aligned_right]);
  let sy = y + h - sh;

  fill(fill_c);
  noStroke()
  rect(sx, sy, sw, sh); 
  noFill();
}

function drawWindow (x, y, w, h, fill_c) {
  let sx = x + 5;
  let sy = y + 5;
  let sw = w - 10;
  let sh = h - 10;

  fill(fill_c);
  rect(sx, sy, sw, sh); 
  noFill();
}

function drawCircle (x, y, w, h, fill_c) {
  // x,y should always be relative to the current section, so 
  let sx = x + 5;
  let sy = y + 5;
  let sw = w - 10;
  let sh = h - 10;

  fill(fill_c);
  rect(sx, sy, sw, sh); 
  noFill();
}

function drawAwning (x, y, w, h, fill_c) {
  fill(fill_c)
  quad(x, y, x+w, y+10, x-10, y+10, x+w+10, y+10); // quad(x1, y1, x2, y2, x3, y3, x4, y4)
  noFill()
}

// -- MARKERS -- //
function marker_rect (x, y, w, h, fill_c = "white", stroke_c = "black") {
  
  stroke(stroke_c)
  fill(fill_c)
  rect(x, y, w, h)

  for (let i = 0; i < 3; i++) {  // Draw multiple lines to make it look rough
    let xOffset = random(-5, 4);  // Random offset for sketchy effect
    let yOffset = random(-5, 6);
    
    // Top line
    line(
      x + random(-2, 2), 
      y + random(-2, 2), 
      x + w + random(-2, 2), 
      y + random(-2, 2)
    );
    
    // Right line
    line(
      x + w + random(-2, 2), 
      y + random(-2, 2), 
      x + w + random(-2, 2), 
      y + h + random(-2, 2)
    );
    
    // Bottom line
    line(
      x + random(-2, 2), 
      y + h + random(-2, 2), 
      x + w + random(-2, 2), 
      y + h + random(-2, 2)
    );
    
    // Left line
    line(
      x + random(-2, 2), 
      y + random(-2, 2), 
      x + random(-2, 2), 
      y + h + random(-2, 2)
    );
  }

  noStroke()
  noFill()
}

function drawTextureHatches(_x, _y, w, h, buffer) {
  let lineSpacing = 6;  // Spacing between squiggly lines
  let length = 20;       // Length of each squiggly line
  let angle = PI / 4;    // Direction for all lines (45 degrees)

  for (let y = _y; y < h; y += lineSpacing) {
    for (let x = _x; x < w; x += lineSpacing) {
      drawSquigglyLine(x, y, length, angle, buffer);
    }
  }
}

// Function to draw a single squiggly line
function drawSquigglyLine(x, y, length, angle, buffer) {
  let segments = floor(length / 5); // Number of small segments in the line
  let amp = 1;                  // Amplitude of squiggle
  buffer.stroke("grey")
  buffer.strokeWeight(0.5);                // Thinner lines for finer ink-like detail
  // buffer.stroke(0);                        // Black ink for squiggle lines

  buffer.beginShape();
  for (let i = 0; i < segments; i++) {
    let offsetX = cos(angle) * i * 5 + sin(angle) * random(-amp, amp);
    let offsetY = sin(angle) * i * 5 + cos(angle) * random(-amp, amp);

    let px = x + offsetX;
    let py = y + offsetY;

    buffer.vertex(px, py);
  }
  buffer.endShape();
}

//-- HELPER FUNCS --//
function sumArray(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
  }
  return arr;
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