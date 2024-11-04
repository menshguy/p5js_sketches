let cw = 600;
let ch = 600;
let bottom = 100;
let drawControls = false;
let trees = []

function setup() {
  let canvas = createCanvas(cw, ch);
  canvas.parent('#canvas-container');
  colorMode(HSL);
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
}

function draw() {
  // background(202, 50, 95); //cool blue
  background(38, 59, 87)
  noLoop();
  
  //Draw Trees
  stroke(5, 42, 12);
  strokeWeight(2);
  noFill()
  //Draw the Tree(s)
  trees.forEach(tree => {
    tree.drawTree();
    tree.drawLeaves();
    tree.drawLeaves
  }); 

  //Draw Base Line
  stroke(5, 42, 12);
  strokeWeight(1);
  drawBaseLine(100, ch-bottom, cw-100)
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

  drawLeaves() {
    let {startPoint, treeHeight} = this;

    // Draw everything within a push-pop block to apply rotation to this block only
    push();
    translate(startPoint.x, startPoint.y-(bottom/2)-(treeHeight));
    rotate(radians(-90));
    // Draw the large white circle
    let radius = random(125, 150);
    noFill()
    noStroke()
    // fill(255); // White color for the large circle
    ellipse(0, 0, radius, radius);

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
      fill(random([
        color(44, 59, 77), 
        color(35, 45, 47),
        color(19, 66, 66),
        color(86, 38, 55)
      ]))
      stroke("black")
      let w = random(10,20)
      let h = random(10,20)
      arc(x, y, w, h, angleToCenter - HALF_PI, angleToCenter + HALF_PI);
    }
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
  }
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= cw && mouseY >= 0 && mouseY <= ch) {
    redraw()
  }
}