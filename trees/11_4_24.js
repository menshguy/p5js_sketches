let cw = 600;
let ch = 600;
let bottom = 100;
let drawControls = false;
let img;
let trees =  [];

function preload() {
  // img = loadImage('../textures/paper_smooth.jpg');
  textureImg = loadImage('../textures/watercolor_1.jpg');
}

function setup() {
  let canvas = createCanvas(cw, ch);
  canvas.parent('#canvas-container');
  colorMode(HSL);
}

function draw() {
  background(38, 59, 87)
  noLoop();

  let trees = [];
  let numTrees = random(3,7)
  let center = {x:cw/2, y:ch-bottom}
  for (let i = 0; i < numTrees; i++) {
    let numLines = floor(random(5,21));
    let startPoint = {x: random(center.x-(cw/2 - 100), center.x+(cw/2 - 100)), y: center.y};
    let treeHeight = random(100,200);
    let treeWidth = random(100,200)
    let tree = new Tree({numLines, startPoint, treeHeight, treeWidth})
    trees.push(tree)
  }
  
  //Draw Trees
  stroke(5, 42, 12);
  strokeWeight(2);
  noFill()
  trees.forEach(tree => {
    tree.drawTree();
    tree.drawLeaves();
  }); 

  //Draw Base Line
  stroke(5, 42, 12);
  strokeWeight(1);
  drawBaseLine(100, ch-bottom, cw-100)

  //Draw Texture
  blendMode(MULTIPLY);
  image(textureImg, 0, 0, cw, ch);
  blendMode(BLEND); 
}

function drawBaseLine(xStart, y, xEnd){
  let x = xStart;
  
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

class Tree {
  constructor({numLines, startPoint, treeHeight, treeWidth}){
    Object.assign(this, { numLines, startPoint, treeHeight, treeWidth });
    this.lines = this.generateTree();
    this.leaves = this.generateLeaves();
  }

  generateTree() {
    let {startPoint, numLines, treeHeight, treeWidth} = this;
    let lines = [];

    for (let i = 0; i < numLines; i++) {
      let endPoint = {
        x: startPoint.x + random(-(treeWidth/2), treeWidth/2), 
        y: random((startPoint.y-bottom-treeHeight) + (treeHeight/2), startPoint.y-bottom-treeHeight)
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
    return lines;
  }

  generateLeaves() {
    let leaves = [];
    let radius = random(125, 150); // Create the large enclosing circle, but don't draw it
    // Draw small half-circles on the right half only
    let numCircles = 900; // Number of small half-circles
    for (let i = 0; i < numCircles; i++) {
      // Random angle between 0 and PI for the right half
      let angle = random(-PI, PI);
      // Random radius within the main circle's radius
      let r = sqrt(random(0,0.5)) * radius;
      let x = cos(angle) * r;
      let y = sin(angle) * r;
      // Calculate the angle of the half-circle to face the center
      let angleToCenter = atan2(y, x);

      // Draw the half-circle
      
      let w = random(10,20)
      let h = random(10,20)
      leaves.push({x, y, w, h, start: angleToCenter - HALF_PI, stop: angleToCenter + HALF_PI})
    }
    return leaves;
  }

  drawLeaves() {
    let {startPoint, treeHeight} = this;

    stroke("black");
    strokeWeight(1);
    fill

    // Draw everything within a push-pop block to apply rotation to this block only
    push();
    translate(startPoint.x, startPoint.y-(bottom/2)-(treeHeight));
    rotate(radians(-90));

    this.leaves.forEach( ({x, y, w, h, start, stop}) => {
      fill(random([
        color(44, 59, 77), 
        color(35, 45, 47),
        color(19, 66, 66),
        color(86, 38, 55)
      ]))
      arc(x, y, w, h, start, stop);
    })
    
    pop();
  }

  drawTree(){
    //Draw Tree Branches
    this.lines.forEach(l => {
      let {startPoint, controlPoints, endPoint} = l

      //Style the line
      beginShape();
      vertex(startPoint.x, startPoint.y)
      bezierVertex(
        controlPoints[0].x, controlPoints[0].y,
        controlPoints[1].x, controlPoints[1].y,
        endPoint.x, endPoint.y
      )
      endShape();
      
      if(drawControls){
        //Draw Anchor Points
        stroke("black");
        strokeWeight(5);
        point(startPoint.x, startPoint.y)
        point(endPoint.x, endPoint.y)
        
        //Draw Control Points for Reference
        stroke("red");
        strokeWeight(5);
        controlPoints.forEach(p => {
          point(p.x, p.y)
        })
      
        //Connect Control Points to Anchor Points
        stroke("red")
        strokeWeight(1);
        line(startPoint.x, startPoint.y, controlPoints[0].x, controlPoints[0].y)
        line(endPoint.x, endPoint.y, controlPoints[1].x, controlPoints[1].y)
      }
    })
  }

  clear() {
    this.lines = []
    this.leaves = []
  }
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= cw && mouseY >= 0 && mouseY <= ch) {
    setup();
    clear();
    redraw();
  }
}