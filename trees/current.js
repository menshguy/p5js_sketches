let cw, ch;
let bottom = 50;
let drawControls = false;
let img;
let trees =  [];
let debug = false;

function preload() {
  // img = loadImage('../textures/paper_smooth.jpg');
  textureImg = loadImage('../textures/watercolor_1.jpg');
}

function setup() {
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
}

function draw() {
  colorMode(HSL);
  background(38, 92, 67)
  noLoop();

  let center = {x:cw/2, y:ch-bottom}
  let maxHeight = height - random(0,300);
  let levelSize = 5;
  let leafWidth = random(4, 5);
  let numLeafPoints = random(5,10);
  let numLeaves = random(5, 10); // # of leaves around each leaf point
  let numLines = random(4,8);
  let numTrunks = random(8, 15);
  let trunkHeight = random(25,50);
  let trunkWidth = random(25,50)
  let tree = new Tree({maxHeight, numTrunks, numLines, leafWidth, numLeafPoints, numLeaves, levelSize, center, trunkHeight, trunkWidth})
  
  //Draw Trucks, Leaves, Baseline
  tree.drawTrunks();
  tree.drawLeaves();
  drawBaseLine(100, ch-bottom, cw-100)

  //Draw Texture
  blendMode(MULTIPLY);
  image(textureImg, 0, 0, cw, ch);
  blendMode(BLEND); 
}

class Tree {
  constructor({maxHeight, numTrunks, numLines, leafWidth, numLeafPoints, numLeaves, levelSize, center, trunkHeight, trunkWidth}){
    Object.assign(this, { maxHeight, numTrunks, numLines, leafWidth, numLeafPoints, numLeaves, levelSize, center, trunkHeight, trunkWidth });
    this.midpoint = {x: center.x ,y: center.y - (maxHeight/2)}
    if (debug){
      fill("red")
      circle(this.midpoint.x,this.midpoint.y,20)
    }
    this.trunks = this.generateTrunks();
    this.leaves = this.generateLeaves();
  }

  generateTrunks() {
    let {numTrunks, numLines, trunkHeight, trunkWidth} = this;
    
    let trunks = []
    for (let j = 0; j < numTrunks; j++) {
      let lines = [];
      let startPoint = {
        x: random(50, width-50),
        y: height-bottom
      };
      for (let i = 0; i < numLines; i++) {
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

  generateLeaves() {
    let {maxHeight, midpoint, leafWidth, numLeafPoints, numLeaves, levelSize} = this;
    let points = [];
    let leaves = [];
    let numLevels = height/levelSize;
    
    //Create the Points, used to group the leaves
    let min_x = 0;
    let max_x = width;
    for(let i=0; i < numLevels; i++){
      let current_y = i*levelSize
      if (current_y < maxHeight) {
        let min_y = height - bottom - (current_y);
        let max_y = height - bottom - (current_y + levelSize);
        for(let j=0; j < numLeafPoints; j++){ 
          let p = {
            x: random(min_x, max_x), 
            y: random(min_y, max_y)
          }
          points.push(p);
        }
        min_x += random(-50, 100)
        max_x += random(-100, 50)
      }
    }

    // Create leaves that surround and face each point
    points.forEach(p => {
      
      if (debug) {
        fill("red");
        circle(p.x,p.y,5);
      }

      // Determine the quadrant of the point
      let start;
      let stop;
      if (p.x < midpoint.x && p.y < midpoint.y) {
          //upper left, empty lower right
          start = HALF_PI;
          stop = 0;
      } else if (p.x >= midpoint.x && p.y < midpoint.y) {
          //upper right, empty lower left
          start = PI;
          stop = HALF_PI;
      } else if (p.x < midpoint.x && p.y >= midpoint.y) {
          //lower left, empty upper right
          start = 0;
          stop = HALF_PI + PI;
      } else { 
        // lower right, empty upper left
          start = -HALF_PI;
          stop = PI;
      }
      
      // For each leaf, find a spot around the point to draw it
      for (let i = 0; i < numLeaves; i++) {
        let r = random(20000 / p.y, 40000 / p.y);
        let w = random(leafWidth-1,leafWidth+1)
        let h = random(leafWidth-1,leafWidth+1)
        
        
        let angle = random(start, stop);
        let x = p.x + (cos(angle) * random(r, r));
        let _y = p.y + (sin(angle) * random(r, r));
        let y_aboveBottom = _y
        let y_belowBottom = height-bottom+random(0,10); // This will fill the area below the ground with Fallen leaves
        let y = _y > (height-bottom) ? y_belowBottom : y_aboveBottom; //If y is below bottom (ground), set to bottom with some variance. This will be fallen leaves
        
        if (debug) {
          fill("Red")
          stroke("green")
          arc(p.x, p.y, r, r, start, stop )
        }

        // push();
        // translate(p.x, p.y);
        // let angleToCenter = atan2(y-p.y, x-p.x); //angle toward the point
        // pop();
        
        if (debug) {
          fill("blue")
          circle(x,y,w)
        }
        
        if (angle > start || angle < stop) {
          // If the angle is outside the arc, skip pushing this leaf
          leaves.push({
            x, y, w, h, 
            start: angle - HALF_PI, 
            stop: angle + HALF_PI
          })
        }
      }
    })

    return leaves;
  }

  drawLeaves() {
    stroke("black");
    strokeWeight(1);
    this.leaves.forEach( ({x, y, w, h, start, stop}) => {
      let fills = [
        // 'white',
        color(25, 70, 50),  // Orange
        color(35, 80, 60),  // Yellow
        color(15, 60, 40),  // Brown
        color(45, 90, 70),  // Light Yellow
        color(5, 70, 50),   // Red
        color(5, 70, 50)    // Red
      ];
      
      noFill();
      if ( random([0,1,1]) ) fill(fills[random([0,1,1,2,2,3,3,4,4])])
      arc(x, y, w, h, start, stop);
    })
    noFill();
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

function drawBaseLine(xStart, y, xEnd){
  let x = xStart;
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