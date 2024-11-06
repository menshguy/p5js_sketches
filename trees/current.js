let cw, ch;
let bottom = 50;
let drawControls = false;
let img;
let trees =  [];
let debug = false;
let fallColorFills;
let lightFallColorFills;

function preload() {
  // img = loadImage('../textures/paper_smooth.jpg');
  textureImg = loadImage('../textures/watercolor_1.jpg');
}

function setup() {
  colorMode(HSL);

  // Calc distance from canvas to top of screen
  let container = document.getElementById("canvas-container")
  let rect = container.getBoundingClientRect();
  let distanceFromTop = rect.top;

  // Set width and height to full window
  // cw = windowWidth || 600;
  // ch = (windowHeight - distanceFromTop) || 600;
  cw = 600;
  ch = 600;
  let canvas = createCanvas(cw, ch);
  canvas.parent(container);

  fallColorFills = [
    // 'white',
    color(25, 70, 50),  // Orange
    color(35, 80, 60),  // Yellow
    color(15, 60, 40),  // Brown
    color(45, 90, 70),  // Light Yellow
    color(5, 70, 50),   // Red
    color(5, 70, 50)    // Red
  ];
  lightFallColorFills = [
    // 'white',
    color(45, 90, 70),  // Light Yellow
    color(45, 90, 80),  // Light Yellow
    color(45, 90, 75),  // Light Yellow
    color(45, 90, 73),  // Light Yellow
    color(45, 90, 78),  // Light Yellow
    color(5, 70, 80),   // Red
    color(5, 70, 90)    // Red
  ];
}

function draw() {
  // background(38, 92, 67)
  background(180, 70, 90)
  noLoop();

  /** General Settings */
  let center = {x:cw/2, y:ch-bottom};
  let treeBatchHeight = height - bottom - random(400,500);
  /**
   * Leaves:
   *  1. Points are draw randomly across each "row"
   *  2. Rows increment up by rowSize until they reach treeBatchHeight
   *  3. Leaves are then drawn randomly around each point, avoiding gaps in the "arcs"
   *      - The arcs are essentially openface 3/4 circles that face the center of the tree
   *      - The idea behind arcs to avoid too much clutter in the center
   */
  let leafWidth = random(4, 5);
  let rowSize = 20; //x points will drawn randominly in each row. rows increment up by this amount
  let numPointsPerRow = random(8,12);
  let numLeavesPerPoint = random(40, 60); // # of leaves around each leaf point
   /**
   * Trunks:
   *  1. Tree Trunks are just random bezier lines
   */
  let numTrunks = random(8, 15);
  let numLinesPerTrunk = random(4,8);
  let trunkHeight = random(25,50);
  let trunkWidth = random(25,50)

  /** Create Tree */
  let treeBatch = new TreeBatch({treeBatchHeight, numTrunks, numLinesPerTrunk, leafWidth, numPointsPerRow, numLeavesPerPoint, rowSize, center, trunkHeight, trunkWidth})
  
  //Draw Ground Fill
  fill(fallColorFills[2])
  rect(0, height-bottom, width, height-bottom);
  
  //Draw Trees in order
  treeBatch.drawTrunks();
  treeBatch.drawLeaves();
  treeBatch.generateCircleBufferImage();

  //Draw Ground Squiggly (on top of Ground Fill & trees)
  drawGroundLine(100, ch-bottom, cw-100)

  //Draw Texture
  blendMode(MULTIPLY);
  image(textureImg, 0, 0, cw, ch);
  // treeBatch.circleBuffer.filter(BLUR, 5);
  image(treeBatch.circleBuffer, 0, 0);
  blendMode(BLEND); 
}

class TreeBatch {
  constructor({treeBatchHeight, numTrunks, numLinesPerTrunk, leafWidth, numPointsPerRow, numLeavesPerPoint, rowSize, center, trunkHeight, trunkWidth}){
    Object.assign(this, { treeBatchHeight, numTrunks, numLinesPerTrunk, leafWidth, numPointsPerRow, numLeavesPerPoint, rowSize, center, trunkHeight, trunkWidth });
    this.midpoint = {x: center.x ,y: center.y - (center.y - treeBatchHeight)/2}
    if (debug){
      fill("red")
      circle(this.center.x,this.center.y,20)
      circle(this.midpoint.x,treeBatchHeight,20)
      circle(this.midpoint.x,this.midpoint.y,20)
    }
    this.circleBuffer = createGraphics(cw, ch);
    this.trunks = this.generateTrunks();
    let {leaves, circles} = this.generateLeavesAndCircles();
    this.leaves = leaves;
    this.circles = circles;
  }

  generateTrunks() {
    let {numTrunks, numLinesPerTrunk, trunkHeight, trunkWidth} = this;
    
    let trunks = []
    for (let j = 0; j < numTrunks; j++) {
      let lines = [];
      let startPoint = {
        x: random(100, width-100),
        y: height-bottom
      };
      for (let i = 0; i < numLinesPerTrunk; i++) {
        let endPoint = {
          x: random(startPoint.x-(trunkWidth/2), startPoint.x+(trunkWidth/2)), 
          y: random((startPoint.y-trunkHeight) + (trunkHeight/2), startPoint.y-bottom-trunkHeight)
        }
        let startControlPoint = {
          x: startPoint.x, 
          y: random(startPoint.y, endPoint.y)
        }
        let endControlPoint = {
          x: endPoint.x < startPoint.x ? random(endPoint.x, startPoint.x) : random(startPoint.x, endPoint.x),
          y: random(startControlPoint.y, endPoint.y)
        }
        let controlPoints = [startControlPoint, endControlPoint]
        lines.push({ startPoint, endPoint, controlPoints })
      }
      trunks.push(lines)
    }
    return trunks;
  }

  drawTrunks(){
    //Draw Tree Branches
    this.trunks.forEach(trunk => {
      trunk.forEach(l => {
        let {startPoint, controlPoints, endPoint} = l

        //Set Styles
        stroke(10, 39, 14)
        strokeWeight(1.5);
        noFill()

        //Style the line
        beginShape();
        vertex(startPoint.x, startPoint.y)
        bezierVertex(
          controlPoints[0].x, controlPoints[0].y,
          controlPoints[1].x, controlPoints[1].y,
          endPoint.x, endPoint.y
        )
        endShape();
      })
    })

    //Unset Styles
    noStroke();
    noFill();
  }

  generatePoints(){
    let {treeBatchHeight, numPointsPerRow, rowSize} = this;
    
    //Create the Points, used to group the leaves
    let points = [];
    let min_x = 50;
    let max_x = width-50;
    let curr_y = rowSize
    for(let i=0; i < height - treeBatchHeight - bottom; i+=rowSize){
      let row = [];
      let _y = height - bottom - (curr_y)
      let min_y = _y
      let max_y = min_y + rowSize;
      for(let j=0; j < numPointsPerRow; j++){
        let p = {
          x: random(min_x, max_x), 
          y: random(min_y, max_y)
        }
        if (p.y >= treeBatchHeight) row.push(p); // dont push points that exceed the height. Remember, lower numbers for y are higher on canvas
      }

      numPointsPerRow -= 1

      // Find the point with the smallest and largest x value in the row
      let minPoint = row.reduce((min, p) => p.x < min.x ? p : min, row[0]);
      if (minPoint) minPoint.isLeftMost = true;
      let maxPoint = row.reduce((max, p) => p.x > max.x ? p : max, row[0]);
      if (maxPoint) maxPoint.isRightMost = true;

      //Push array or points in points array
      points.push(row)

      //Increment min/max x, while making sure we dont exceed midpoint. Otherwise, you will just start an inverted triange shape and end up with an hour glass
      curr_y += rowSize
      min_x += min_x > width/2 ? 0 : random(-50, 100)
      max_x += max_x < width/2 ? 0 : random(-100, 50)
    }
    return points;
  }

  getLeafBoundary(p){
    let {midpoint} = this;
    let start, stop, quad;
    let min = p.y >= 50 ? .2 * p.y : 50
    let max = p.y >= 50 ? .35 * p.y : 50
    let boundaryRadius = random(min, max); // radius grows as we get higher, so that leaves are more spread out
    
    // configure each boundary. Start/Stop create an open face circle. set debug to true to see
    if (p.x < midpoint.x && p.y < midpoint.y) {
      //upper left, empty lower right
      quad = "ul";
      start = HALF_PI;
      stop = TWO_PI;
    } else if (p.x >= midpoint.x && p.y < midpoint.y) {
      //upper right, empty lower left
      quad = "ur";
      start = PI;
      stop = HALF_PI;
    } else if (p.x < midpoint.x && p.y >= midpoint.y) {
      //lower left, empty upper right
      quad = "ll";
      start = 0;
      stop = HALF_PI + PI;
    } else { 
      // lower right, empty upper left
      quad = "lr";
      start = -HALF_PI;
      stop = PI;
    }
    return {start, stop, quad, boundaryRadius};
  }

  generateLeavesAndCircles() {
    let {leafWidth, numLeavesPerPoint} = this;
    let points = this.generatePoints();
    let leaves = [];
    let circles = [];
    
    // Create leaves that surround and face each point
    points.forEach(row => {
      row.forEach((p, i) => {
        //Leaves will be drawn within this arc shape
        let {start, stop, quad, boundaryRadius} = this.getLeafBoundary(p)
        
        if (debug) {
          fill("red");
          circle(p.x,p.y,5);
        }

        if (debug) {
          fill(color(300, 100, 50, 0.5))
          stroke("green")
          arc(p.x, p.y, boundaryRadius, boundaryRadius, start, stop )
        }

        circles.push({
          x:p.x, y: p.y, r:boundaryRadius, 
          isLeftMost: p?.isLeftMost, 
          isRightMost: p?.isRightMost
        })
        
        // For each leaf, find a spot around the point to draw it
        for (let i = 0; i < numLeavesPerPoint; i++) {
          let w = random(leafWidth-2,leafWidth+2)
          let h = random(leafWidth-2,leafWidth+2)
          
          // Only draw leaves if they fall within the boundary 
          // The following code ensures the angle falls within acceptable range
          let angle;
          if (quad === "lr" || quad === "ll"){
            angle = random(start, stop)
          }
          if (quad === "ur") {
            angle = random(-start, stop)
          }
          if (quad === "ul") {
            angle = random(start, stop)
          }
          let r = boundaryRadius/2
          let x = p.x + (cos(angle) * random(r-(r/2), r));
          let _y = p.y + (sin(angle) * random(r-(r/2), r));
          let y = _y > (height-bottom) ? height-bottom+random(0,10) : _y; //If y is below bottom (ground), set to y to bottom with some variance to draw "fallen leaves"
    
          if (debug) {
            fill("blue")
            circle(x,y,w)
          }

          leaves.push({
            x, y, w, h, 
            start: angle - HALF_PI, 
            stop: angle + HALF_PI
          })
        }
        
        //Decrement numLeavesPerPoint so that upper rows have few leaves, min 5
        numLeavesPerPoint = numLeavesPerPoint > 5 
          ? numLeavesPerPoint - 1 
          : 5
      })
    })

    return {leaves, circles};
  }

  drawLeaves() {
    stroke("black");
    strokeWeight(1);
    noFill();
    if ( random([0,1,1]) ) fill(fallColorFills[random([0,1,1,2,2,3,3,4,4])])
    this.leaves.forEach( ({x, y, w, h, start, stop}) => {
      arc(x, y, w, h, start, stop);
    })
  }

  generateCircleBufferImage() {
    this.circleBuffer.noStroke();
    this.circleBuffer.fill(lightFallColorFills[random([0,1,2,3,4])]);
    this.circles.forEach(c => {
      // this.circleBuffer.arc(p.x, p.y, r, r, start, stop);
      if (c.isLeftMost || c.isRightMost) {
        this.circleBuffer.stroke(0);
      } else {
        this.circleBuffer.noStroke();
      }
      this.circleBuffer.circle(c.x, c.y, c.r);
    })
    this.circleBuffer.noFill();
  }

  drawBlob(x, y, r) {
    beginShape();
    
    // Number of points to create a rounder shape
    let points = 12;
    let angleStep = TWO_PI / points;
    
    // Array to store the positions of each point
    let vertices = [];
    
    // Generate vertices with random radii for irregularity
    for (let i = 0; i < points; i++) {
      let angle = i * angleStep;
      let radiusOffset = random(-20, 30); // Adjusts the irregularity of the blob
      let distance = r + radiusOffset;
      
      // Calculate (x, y) of each point
      let px = x + cos(angle) * distance;
      let py = y + sin(angle) * distance;
      
      vertices.push({ x: px, y: py });
    }
    
    // Draw convex bezier curves between points
    for (let i = 0; i < vertices.length; i++) {
      let current = vertices[i];
      let next = vertices[(i + 1) % vertices.length]; // Loop back to start
      
      // Control points for a convex curve
      let control1 = {
        x: current.x + (next.x - x) * 0.2 + random(-10, 10),
        y: current.y + (next.y - y) * 0.2 + random(-10, 10)
      };
      
      let control2 = {
        x: next.x + (current.x - x) * 0.2 + random(-10, 10),
        y: next.y + (current.y - y) * 0.2 + random(-10, 10)
      };
      
      if (i === 0) {
        vertex(current.x, current.y);
      }
      bezierVertex(control1.x, control1.y, control2.x, control2.y, next.x, next.y);
    }
    
    endShape(CLOSE);
  }

  clear() {
    this.lines = []
    this.leaves = []
  }
}

function drawGroundLine(xStart, yStart, xEnd){
  let x = xStart;
  let y = yStart;
  stroke(5, 42, 12);
  strokeWeight(1);
  noFill();
  
  while (x < xEnd){
    let tickLength;
    let tickBump = random(-4, 0);
    let tickType = random(["long", "short", "long", "short", "space"]);

    if(tickType === "long"){
      tickLength = random(10, 25);
      beginShape();
      vertex(x, y, 0);
      let x2 = x;
      let y2 = y;
      let cx1 = x + tickLength / 2;
      let cy1 = y + tickBump;
      let cx2 = x + tickLength;
      let cy2 = y;
      bezierVertex(x2, y2, cx1, cy1, cx2, cy2);
      endShape();
    }
    else if(tickType === "short"){
      tickLength = random(3, 10);
      beginShape();
      vertex(x, y, 0);
      let x2 = x;
      let y2 = y;
      let cx1 = x + tickLength / 2;
      let cy1 = y + tickBump;
      let cx2 = x + tickLength;
      let cy2 = y;
      bezierVertex(x2, y2, cx1, cy1, cx2, cy2);
      endShape();
    }
    else if(tickType === "space"){
      tickLength = random(5,25)
    } 
    else {
      console.error("no such line type")
    }

    x += tickLength;
  }
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= cw && mouseY >= 0 && mouseY <= ch) {
    setup();
    clear();
    redraw();
  }
}