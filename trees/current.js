let cw, ch;
let bottom = 50;
let drawControls = false;
let img;
let trees = [];
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
  let treeBatchHeight = random(400,500);
  /**
   * Leaves:
   *  1. Points are draw randomly across each "row"
   *  2. Rows increment up by rowSize until they reach treeBatchHeight
   *  3. Leaves are then drawn randomly around each point, avoiding gaps in the "arcs"
   *      - The arcs are essentially openface 3/4 circles that face the center of the tree
   *      - The idea behind arcs to avoid too much clutter in the center
   */
  let leafWidth = random(4, 5);
  let rowSize = 30; //x points will drawn randominly in each row. rows increment up by this amount
  let numPointsPerRow = random(15,20);
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
  
  /** Create Buffers */
  let circleBuffer = createGraphics(cw, ch)
  
  //Draw Ground Fill
  fill(fallColorFills[2])
  rect(0, height-bottom, width, height-bottom);
  
  //Draw Ground Squiggly (on top of Ground Fill & trees)
  drawGroundLine(100, ch-bottom, cw-100)
  
  //Draw Trees in order
  treeBatch.trunks.forEach(trunk => drawTrunk(trunk, trunkHeight, trunkWidth));
  treeBatch.circles.forEach(c => {
    drawToBuffer(circleBuffer, c)
  });
  drawCircleBuffer(circleBuffer)
  treeBatch.leaves.forEach(row => row.forEach(l => drawLeaf(l)));
  
  //Draw Texture
  blendMode(MULTIPLY);
  image(textureImg, 0, 0, cw, ch);
  blendMode(BLEND); 
}

class TreeBatch {
  constructor({treeBatchHeight, numTrunks, numLinesPerTrunk, leafWidth, numPointsPerRow, numLeavesPerPoint, rowSize, center, trunkHeight, trunkWidth}){
    Object.assign(this, { treeBatchHeight, numTrunks, numLinesPerTrunk, leafWidth, numPointsPerRow, numLeavesPerPoint, rowSize, center, trunkHeight, trunkWidth });
    this.midpoint = {x: center.x ,y: center.y - treeBatchHeight/2}
    if (debug){
      fill("yellow")
      circle(this.midpoint.x,height - bottom - treeBatchHeight,20)
      fill("pink")
      circle(this.midpoint.x,this.midpoint.y,20)
      fill("red")
      circle(this.center.x,this.center.y,20)
    }
    // this.circleBuffer = createGraphics(cw, ch);
    this.trunks = this.generateTrunks();
    this.points = this.generatePoints();
    this.circles = this.generateCircles();
    this.leaves = this.generateLeaves();
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

  generatePoints(){
    let {treeBatchHeight, numPointsPerRow, rowSize, trunkHeight, midpoint:m} = this;
    let points = [];
    let min_x = 50;
    let max_x = width-50;

    let start = height - bottom;
    let h = start - treeBatchHeight;
    for(let i = start; i > h; i-=rowSize){
      console.log(h, i)
      let row = [];
      let min_y = i;
      let max_y = i - rowSize;
      for(let j=0; j < numPointsPerRow; j++){
        let x = random(min_x, max_x);
        let y = random(min_y, max_y)
        let boundary = this.generatePointBoundary(x, y, m.x, m.y)
        row.push({x, y, boundary});
          
        //Draw points
        if (debug) { 
          fill("red");
          circle(x,y,5);
        }
      }

      // Find the point with the smallest and largest x value in the row
      let minPoint = row.reduce((min, p) => p.x < min.x ? p : min, row[0]);
      if (minPoint) minPoint.isLeftMost = true;
      let maxPoint = row.reduce((max, p) => p.x > max.x ? p : max, row[0]);
      if (maxPoint) maxPoint.isRightMost = true;

      //Push array or points in points array
      points.push(row)

      //Increment min/max x, while making sure we dont exceed midpoint. Otherwise, you will just start an inverted triange shape and end up with an hour glass
      min_x += min_x > width/2 ? 0 : random(-25, 50)
      max_x += max_x < width/2 ? 0 : random(-50, 25)
    }
          
    return points;
  }

  generatePointBoundary(px, py, mx, my){
    let min = 50;
    let max = 50 * (py/100);
    let radius = random(min, max); // radius grows as we get higher, so that leaves are more spread out
    
    // Calculate the differences in x and y and calc angle us atan2
    let dx = mx - px;
    let dy = my - py;
    let angle = atan2(dy, dx);
    let start = angle + QUARTER_PI
    let stop = angle - QUARTER_PI
    
    return {start, stop, radius};
  }

  generateCircles() {
    let {points} = this;
    let circles = [];
    
    // Create leaves that surround and face each point
    points.forEach(row => {
      row.forEach(({x:px, y:py, boundary:b, isLeftMost, isRightMost}) => {
        if (debug) {
          fill(color(300, 100, 50, 0.5))
          stroke("green")
          let d = b.radius * 2;
          arc(px, py, d, d, b.start, b.stop )
        }

        circles.push({ x:px, y:py, r:b.radius, isLeftMost, isRightMost })
      })
    })
    return circles;
  }

  generateLeaves() {
    let {leafWidth, numLeavesPerPoint, points} = this;
    let leaves = [];
    
    // Create leaves that surround and face each point
    points.forEach(row => {
      let num = numLeavesPerPoint
      row.forEach(({x:px, y:py, boundary:b}) => {
        // For each leaf, find a spot around the point to draw it
        console.log("startnum", num)
        let row = []
        for (let i = 0; i < num; i++) {
          console.log("i", i)
          let w = random(leafWidth-2,leafWidth+2)
          let h = w
          // Only draw leaves if they fall within the boundary 
          let angle = random(b.start, b.start + 3*HALF_PI)
          let r = random(b.radius/3, b.radius/2) 
          let x = px + (cos(angle) * r);
          let y = py + (sin(angle) * r) > (height-bottom) //If y is below bottom (ground), set to y to bottom with some variance to draw "fallen leaves"
            ? height-bottom+random(0,10) 
            : py + (sin(angle) * r); 
          row.push({x, y, w, h, start:angle-HALF_PI, stop:angle+HALF_PI })
          
          if (debug) {
            fill("blue")
            circle(x,y,w)
          }
        }
        leaves.push(row)
        console.log("num", num)
        num = num > 5 ? num - 10 : 5  //Decrement numLeavesPerPoint so that upper rows have few leaves, min 5
      })
    })

    return leaves;
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

function drawLeaf({x, y, w, h, start, stop}) {
  //Set Styles
  stroke("black");
  strokeWeight(1);
  noFill();
  if ( random([0,1,1]) ) fill(fallColorFills[random([0,1,1,2,2,3,3,4,4])])
  
  // Draw the Leaf
  arc(x, y, w, h, start, stop);
}

function drawToBuffer(circleBuffer, {x,y,r,isRightMost, isLeftMost}) {

  circleBuffer.noStroke();
  circleBuffer.fill(lightFallColorFills[random([3])]);
  
  // if (isLeftMost || isRightMost) {
  //   circleBuffer.stroke(0);
  // } else {
  //   circleBuffer.noStroke();
  // }
  circleBuffer.circle(x, y, r);
  circleBuffer.noFill();
}

function drawCircleBuffer(circleBuffer){
  blendMode(MULTIPLY);
  image(circleBuffer, 0, 0);
  blendMode(BLEND); 
}

function drawTrunk(tree, trunkHeight, trunkWidth){
  let trunkBuffer = createGraphics(cw, ch);
  tree.forEach(line => {
    let {startPoint, controlPoints, endPoint} = line

    //Set Styles
    trunkBuffer.stroke(10, 39, 14)
    trunkBuffer.strokeWeight(1);
    trunkBuffer.noFill()

    //Style the line
    trunkBuffer.beginShape();
    trunkBuffer.vertex(startPoint.x, startPoint.y)
    trunkBuffer.bezierVertex(
      controlPoints[0].x, controlPoints[0].y,
      controlPoints[1].x, controlPoints[1].y,
      endPoint.x, endPoint.y
    )
    trunkBuffer.endShape();

    // Erase a circle area
    if (random([0,1])) randomErase();
    
    //Unset Styles
    trunkBuffer.noStroke();
    trunkBuffer.noFill();

    function randomErase(){
      trunkBuffer.fill("red")
      trunkBuffer.noStroke(10)
      if (!debug) trunkBuffer.erase();
      trunkBuffer.circle(startPoint.x+random(-trunkWidth/2, trunkWidth/2), endPoint.y-trunkHeight/2, 30);
      if (!debug) trunkBuffer.noErase();
    }
  })

  image(trunkBuffer, 0, 0)
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

function calculateDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= cw && mouseY >= 0 && mouseY <= ch) {
    setup();
    clear();
    redraw();
  }
}