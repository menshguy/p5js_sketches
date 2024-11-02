let cw = 600;
let ch = 600;
let bottom = 100;
let x1, x2, y1, y2, endX, endY;
let lines = []

function setup() {
  createCanvas(cw, ch);
  colorMode(HSL);
  let numLines = 3
  
  for (let i = 0; i < numLines; i++) {
    let lineLength = 400
    let startPoint = {x:cw/2, y:ch-bottom};
    let endPoint = {x:(cw/2) + random(-50, 50), y:ch-bottom-lineLength}
    lines.push({
      startPoint,
      endPoint,
      controlPoints: [
        {
          x: startPoint.x, 
          y: startPoint.y-random(50,ch-bottom)
        }, {
          x: random(cw/2-200, cw/2+200),
          y: endPoint.y+random(0, startPoint.y-random(50,ch-bottom))
        }
      ]
    })
  }
}

function draw() {
  background("antiquewhite");

 
  //Draw the Lines
  lines.forEach(l => {
    let {startPoint, controlPoints, endPoint} = l

    //Style the line
    stroke(color(15, 28, 47))
    strokeWeight(2);
    noFill()
    beginShape();
    vertex(startPoint.x, startPoint.y)
    bezierVertex(
      controlPoints[0].x, controlPoints[0].y,
      controlPoints[1].x, controlPoints[1].y,
      endPoint.x, endPoint.y
    )
    endShape();
  
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
  })
}

function mousePressed() {
  lines.forEach(line => {
    let p = line.controlPoints
    let x1 = p[0].x
    let y1 = p[0].y
    let x2 = p[1].x
    let y2 = p[1].y
    if (dist(mouseX, mouseY, x1, y1) < 10) {
      line.isDragging = {i: 0};
    }
    if (dist(mouseX, mouseY, x2, y2) < 10) {
      line.isDragging = {i: 1};
    }
  });
}

function mouseDragged() {
  lines.forEach(line => {
    let p = line.controlPoints
    if (line.isDragging) {
      p[line.isDragging.i].x = mouseX;
      p[line.isDragging.i].y = mouseY;
    }
  });
}

function mouseReleased() {
  lines.forEach(line => {
    line.isDragging = false;
  });
}