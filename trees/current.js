let cw, ch;
let bottom = 20;
let drawControls = false;
let img;
let trees = [];
let debug = false;
let fallColorFills;
let forest;
let season;

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
  cw = 800;
  ch = 800;
  let canvas = createCanvas(cw, ch);
  canvas.parent(container);
  
  colors = {
    winter: [
      'white',
      color(200, 10, 90),  // Light Blue
      color(210, 20, 80),  // Medium Blue
      color(220, 30, 70),  // Dark Blue
      color(230, 40, 60),  // Grayish Blue
      color(240, 50, 50),  // Steel Blue
      color(250, 60, 40),  // Slate Blue
      color(260, 70, 30),  // Deep Blue
      color(270, 80, 20),  // Navy Blue
      color(280, 90, 10),  // Midnight Blue
      color(290, 100, 5),  // Blackish Blue
    ],
    fall: [
      color(5, 70, 28),   // Red
      color(25, 70, 20),  // Orange
      color(35, 80, 30),  // Yellow
      color(15, 60, 25),  // Brown
      color(45, 90, 23),  // Light Yellow
      color(5, 70, 28),   // Red
      color(25, 70, 50),  // Orange
      color(35, 80, 60),  // Yellow
      color(15, 60, 50),  // Brown
      color(45, 90, 50),  // Light Yellow
      color(5, 70, 50),   // Red
    ], 
    spring: [
      'white',
      color(25, 70, 30),  // Orange
      color(35, 80, 40),  // Yellow
      color(15, 60, 35),  // Brown
      color(45, 90, 33),  // Light Yellow
      color(5, 70, 38),   // Red
      color(25, 70, 60),  // Orange
      color(35, 80, 70),  // Yellow
      color(15, 60, 60),  // Brown
      color(45, 90, 60),  // Light Yellow
      color(5, 70, 60),   // Red
    ], 
    summer: [
      color(82, 90, 75),  // Light Yellow
      color(120, 60, 40),  // Dark Green
      color(130, 70, 50),  // Medium Green
      color(140, 80, 60),  // Light Green
      color(110, 50, 30),  // Olive Green
      color(150, 90, 70),  // Lime Green
      color(125, 65, 45),  // Forest Green
      color(135, 75, 55),  // Grass Green
      color(145, 85, 65),  // Pale Green
      color(115, 55, 35),  // Moss Green
      color(155, 95, 75),  // Bright Green
    ]
  }

  let forestHeights = {
    summer: random(ch/2, ch),
    winter: random(50, 150),
    fall: random(ch/4, ch-ch/7),
    spring: random(ch/4, ch-ch/10),
  }
  
  /** General Settings */
  season = random(['spring', 'fall', 'winter', 'summer'])
  let center = {x:cw/2, y:ch-bottom};
  let forestHeight = forestHeights[season];
  let fills = colors[season];
  console.log("season", season)
  /** Trunks:
   *   1. Tree Trunks are just random bezier lines
   */
  let numTrunks = random(15, 20);
  let numLinesPerTrunk = random(4,8);
  let trunkHeight = random(100, forestHeight + 20);
  let trunkWidth = random(width/12,width/10)
  /** Leaves:
   *  1. Points are draw randomly across each "row"
   *  2. Rows increment up by rowHeight until they reach forestHeight
   *  3. Leaves are then drawn randomly around each point, avoiding gaps in the "arcs"
   *      - The arcs are essentially openface 3/4 circles that face the center of the tree
   *      - The idea behind arcs to avoid too much clutter in the center
  */
  let pointBoundaryRadius;
  if (season === 'spring' || season === 'fall') {
    pointBoundaryRadius = {min: 50, max: 150}; // Example values for spring
  } else if (season === 'summer') {
    pointBoundaryRadius = {min: 70, max: 220}; // Example values for fall
  } else if (season === 'winter') {
    pointBoundaryRadius = {min: 150, max: 200}; // Example values for winter
  }
  let pointsStart = height - bottom - pointBoundaryRadius.min;
  
  let numPointsPerRow;
  if (season === 'spring' || season === 'fall') {
    numPointsPerRow = random(width/100 , width/60); // Example values for spring
  } else if (season === 'summer') {
    numPointsPerRow = random(width/100 , width/50); // Example values for fall
  } else if (season === 'winter') {
    numPointsPerRow = random(1, 3); // Example values for winter
  }
  
  let numLeavesPerPoint;
  if (season === 'spring' || season === 'fall') {
    numLeavesPerPoint = random(1000, 1200); // Example values for spring
  } else if (season === 'summer') {
    numLeavesPerPoint = random(1200, 1500); // Example values for fall
  } else if (season === 'winter') {
    numLeavesPerPoint = random(1, 5); // Example values for winter
  }
  let leafWidth = season === "summer" ? random(4, 4) : random(2, 3);
  let rowHeight = season === "fall" ? 30 : 20; //x points will drawn randominly in each row. rows increment up by this amount
   

  /** Create Tree */
  forest = new Forest({
    forestHeight, numTrunks, numLinesPerTrunk, leafWidth, numPointsPerRow, 
    numLeavesPerPoint, rowHeight, center, trunkHeight, trunkWidth, pointsStart,
    pointBoundaryRadius, fills
  })
}

function draw() {
  noLoop();

  if (season === "fall") {
    background(39, 26, 73) //brown
  } 
  else if (season === "spring") {
    background(43, 62, 90) //orange
  }
  else if (season === "winter") {
    background(208,18,83) //deep blue
  }
  else if (season === "summer") {
    background(56,85,91) //light yellow
  }
  
  /** Create Buffers */
  let circleBuffer = createGraphics(cw, ch)
  
  //Draw Ground Fill
  let groundFill = season === "winter" ? "white" : forest.fills[4]
  if (season === "winter") {
    fill(groundFill)
    noStroke()
    rect(0, height-bottom, width, height-bottom);
  }
  
  //Draw Ground Squiggly (on top of Ground Fill & trees)
  drawGroundLine(25, ch-bottom, cw-25, groundFill)
  
  //Draw Trees in order
  forest.trunks.forEach(trunk => drawTrunk(trunk, forest.trunkHeight, forest.trunkWidth));
  // forest.circles.forEach(c => {
  //   drawToBuffer(circleBuffer, c, fills)
  // });
  // drawCircleBuffer(circleBuffer)
  forest.leaves.forEach(row => row.forEach(l => {
    drawLeaf(l, 0.2, random(forest.fills))
  }));
  
  //Draw Texture
  blendMode(MULTIPLY);
  image(textureImg, 0, 0, cw, ch);
  blendMode(BLEND); 
}

class Forest {
  constructor({
    forestHeight, numTrunks, numLinesPerTrunk, leafWidth, numPointsPerRow, 
    numLeavesPerPoint, rowHeight, center, trunkHeight, trunkWidth, pointsStart,
    pointBoundaryRadius, fills
  }){
    Object.assign(this, {
      forestHeight, numTrunks, numLinesPerTrunk, leafWidth, numPointsPerRow, 
      numLeavesPerPoint, rowHeight, center, trunkHeight, trunkWidth, pointsStart,
      pointBoundaryRadius, fills
    });
    this.fills = fills;
    this.midpoint = {x: center.x ,y: center.y - forestHeight/2}
    this.trunks = this.generateTrunks();
    this.points = this.generatePoints();
    this.circles = this.generateCircles();
    this.leaves = this.generateLeaves();

    if (debug){
      fill("yellow")
      circle(this.midpoint.x,height - bottom - forestHeight,20)
      fill("pink")
      circle(this.midpoint.x,this.midpoint.y,20)
      fill("red")
      circle(this.center.x,this.center.y,20)
    }
  }

  generateTrunks() {
    let {numTrunks, numLinesPerTrunk, trunkHeight, trunkWidth} = this;
    
    let trunks = []
    for (let j = 0; j < numTrunks; j++) {
      let lines = [];
      let startPoint = {
        x: random(width/10, width - (width/10)),
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
    let {forestHeight, numPointsPerRow, rowHeight, pointsStart, midpoint:m} = this;
    let points = [];
    let min_x = width/10;
    let max_x = width - (width/10);

    let total_h = height - bottom - forestHeight;
    for(let i = pointsStart; i > total_h; i-=rowHeight){
      let row = [];
      let min_y = i;
      let max_y = i - rowHeight;
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
      // let minPoint = row.reduce((min, p) => p.x < min.x ? p : min, row[0]);
      // if (minPoint) minPoint.isLeftMost = true;
      // let maxPoint = row.reduce((max, p) => p.x > max.x ? p : max, row[0]);
      // if (maxPoint) maxPoint.isRightMost = true;

      //Push array or points in points array
      points.push(row)

      //Increment min/max x, while making sure we dont exceed midpoint. Otherwise, you will just start an inverted triange shape and end up with an hour glass
      let w = width/10
      let increments = {
        summer: () => random(-20, 20), 
        winter: () => random(-w, w*1.5), 
        spring: () => random(-w, w*1.5), 
        fall: () => random(-w, w*1.5)
      }
      // let increments = {summer:, winter, spring, fall:}
      min_x += min_x > width/2 ? 0 : increments[season]();
      max_x += max_x < width/2 ? 0 : increments[season]();
    }
          
    return points;
  }

  generatePointBoundary(px, py, mx, my){
    let {pointBoundaryRadius:pbr} = this
    let min = pbr.min;
    let max = pbr.max;
    let radius = random(min, max); 
    
    // Calculate the differences in x and y and calc angle us atan2
    let dx = mx - px;
    let dy = my - py;
    let angle = atan2(dy, dx);
    
    // This won't do anything, but if you want to create a gap that faces center you can take the values in the comments
    let start = 0 // angle + QUARTER_PI
    let stop = TWO_PI // angle - QUARTER_PI
    
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
      let num = numLeavesPerPoint;
      row.forEach(({x:px, y:py, boundary:b}) => {
        //Create Leaves and push into row
        let row = []
        for (let i = 0; i < num; i++) {
          //Width and Height of leaves
          let leaf_w = random(leafWidth-2,leafWidth+2)
          let leaf_h = random(leaf_w,leaf_w+4)
          
          //Angle leaf towards center of its boundary
          let angle = random(b.start, b.stop)
          let r = random(0, b.radius/2) 
          
          //Calculate polar coordinates
          let isFallenLeaf = py + (sin(angle) * r) >= (height-bottom) //If py is below the ground, we flag it so we can create fallen leaves later
          let x = px + (cos(angle) * r);
          let y = isFallenLeaf //If y is below bottom (ground), set to y to bottom with some variance to draw "fallen leaves"
            ? season === "summer"
              ? ch + 100 // get it off the screen! No fallen leaves in summer
              : height-bottom+random(0,15) 
            : py + (sin(angle) * r);
          angle = isFallenLeaf ? PI : angle; //Angle fallen leaves horizonally
            
          //Push Leaf into row
          row.push({x, y, w:leaf_w, h:leaf_h, angle, start:angle-HALF_PI, stop:angle+HALF_PI })
          
          //Debug - Draw leaf point in Blue
          if (debug) {
            fill("blue")
            circle(x,y,leaf_w)
          }
        }
        //Push row
        leaves.push(row)
        //Decrease number of leaves per point until 5 leaf minimum
        num = num > 5 ? num - 10 : 5;
      })
    })
    return leaves;
  }

  clear() {
    this.lines = []
    this.leaves = []
  }
}

function drawLeaf({x, y, w, h, angle, start, stop}, p, fill_c) {
  let typeOfLeaf = random(0,1) > p ? "full" : "outline";
  
  if (typeOfLeaf === "full") {
    drawFullLeaf()
  } else {
    drawOutline()
  }
  
  // Draw the Leaf
  function drawFullLeaf() {
    push();
    noStroke();
    fill(fill_c)
    translate(x,y);
    rotate(angle);
    arc(0, 0, h, w, 0, TWO_PI);
    pop();
  }

  function drawOutline() {
    push();
    stroke("black");
    strokeWeight(1);
    noFill();
    translate(x,y);
    arc(0, 0, w, w, start-0.2, stop+0.2); //open faced arc pointing toward boundary center
    pop();
  }
}

function drawToBuffer(circleBuffer, {x, y, r}, fills) {

  circleBuffer.noStroke();
  circleBuffer.fill(fills[random([3])]);
  
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
    let {startPoint:s, controlPoints:cps, endPoint:e} = line

    //Set Styles
    trunkBuffer.push()
    trunkBuffer.stroke('black')
    trunkBuffer.strokeWeight(1);
    trunkBuffer.noFill()

    // -- Curve Style -- //
    trunkBuffer.beginShape();
    trunkBuffer.vertex(s.x, s.y)
    trunkBuffer.bezierVertex(
      cps[0].x, cps[0].y,
      cps[1].x, cps[1].y,
      e.x, e.y
    )
    trunkBuffer.endShape();

    // -- Straight Style == //
    // marker_rect(e.x, e.y, 5, trunkHeight+bottom)

    // Erase a circle area
    if (random([0,1])) randomErase();
    
    //Unset Styles
    trunkBuffer.pop()

    function randomErase(){
      if (!debug) trunkBuffer.fill("red")
      trunkBuffer.noStroke(10)
      if (!debug) trunkBuffer.erase();
      trunkBuffer.circle(
        s.x+random(-trunkWidth/2, trunkWidth/2), 
        e.y-trunkHeight/2, 
        50
      );
      if (!debug) trunkBuffer.noErase();
    }
  })

  image(trunkBuffer, 0, 0)
}

function drawGroundLine(xStart, yStart, xEnd, fill_c){
  let x = xStart;
  let y = yStart;
  stroke(fill_c);
  strokeWeight(1);
  fill_c ? fill(fill_c) : noFill()
  
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

function marker_rect (x, y, w, h, fill_c = "white", stroke_c = "black") {
  
  stroke(stroke_c)
  fill(fill_c)

  for (let i = 0; i < 3; i++) {  // Draw multiple lines to make it look rough

    // Right line
    let yOffset = random(0, 4)
    line(
      x + random(-2, 2), 
      y, 
      x + random(-2, 2), 
      h + y
    );

    let yOffset2 = random(0, 4)
    line(
      x + random(-2, 2), 
      y, 
      x + random(-2, 2), 
      h + y
    );
    
    let yOffset3 = random(0, 4)
    line(
      x + random(-2, 2), 
      y, 
      x + random(-2, 2), 
      h + y
    );

    let yOffset4 = random(0, 4)
    line(
      x + random(-2, 2), 
      y, 
      x + random(-2, 2), 
      h + y
    );
  }

  noStroke()
  noFill()
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