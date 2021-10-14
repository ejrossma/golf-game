title = "GOLF BABY";

description = `
`;

characters = [];

const G = {
  WIDTH: 200,
  HEIGHT: 200,

  GRAVITY: 9.8 / 60,
  DRAG: 0.01,

  MAX_BALL_VELOCITY: 5,
}

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  theme: "shapeDark",
};

let lvl1 = 
`
000000XXXX
0G0000XXXX
XXX000000X
XXXX000000
X00XXXX000
X000000000
XXXX00XX00
000000X000
0S0X00X00X
000X0000XX
`

// /**
//  * @typedef {{
//  * pos: Vector,
//  * rotation: number,
//  * velocity: Vector,
//  * sprite: string,
//  * }} Ball
//  */

// /**
//  * @type { Ball }
//  */
// let ball;

/**
 * @typedef {{
 * pos: Vector,
 * radius: number,
 * velocity: Vector,
 * rotation: number,
 * }} Ball
 */

/**
 * @type { Ball }
 */
let ball;

//Platform type for making levels

/**
 * @typedef {{
 * pos: Vector,
 * width: number,
 * height: number,
 * }} Platform
 */

//player clicked on ball
let clickedOnBall;
//ball is grounded on a platform
let grounded;

// let levels = {
//   levelOne: [
//     {pos: vec(20, 180), width: 100, height: 10}
//   ]
// }

let levels = {
  one: [
    vec(0,0), vec(6,0),
    vec(6,2), vec(9,2),
    vec(9,3), vec(10,3),
    vec(10,8), vec(9,8),
    vec(9,9), vec(8,9),
    vec(8,10), vec(4,10),
    vec(4,8), vec(3,8),
    vec(3,10), vec(0,10),
    vec(0,7), vec(4,7),
    vec(4,6), vec(1,6),
    vec(1,4), vec(3,4),
    vec(3,5), vec(7,5),
    vec(7,4), vec(4,4),
    vec(4,3), vec(3,3),
    vec(3,2), vec(0,2),
    vec(0,0)
  ]
}

let currentLevel;

function update() {
  if (!ticks) {
    // set starting values
    clickedOnBall = false;
    grounded = false;
    currentLevel = levels.one

    // define ball
    ball = {
      pos: vec(50, 50),
      radius: 3,
      velocity: vec(0, 0),
      rotation: 0
    }
  }

  // test line
  // color("blue");
  // line(10, 10, input.pos.x, input.pos.y);

  // draw platforms
  color("blue");
  // currentLevel.forEach(line => {
  //   
  // });
  for(let i = 0; i < currentLevel.length - 1; i++){
    line(currentLevel[i].x * 20, currentLevel[i].y * 20, currentLevel[i+1].x * 20, currentLevel[i+1].y * 20, 1);
  }

  // add gravity
  // ball.velocity.add(0, G.GRAVITY).clamp(-G.MAX_BALL_VELOCITY, G.MAX_BALL_VELOCITY, -G.MAX_BALL_VELOCITY, G.MAX_BALL_VELOCITY);

  let testBalPos = vec(ball.pos).add(ball.velocity);
  currentLevel.forEach(platform => {
    // check for collisions
    // calculate new ball position
    // calculate new ball velocity
  });

  // set new ball position
  // set new ball velocity
  
  // ball.pos = newBallPos;

  // draw ball
  // color("red");
  // if (isColliding) color("blue");
  // arc(ball.pos, ball.radius, 2, ball.rotation, 2 * Math.PI + ball.rotation);
}

function HitBall() {
  
}

function PointRectDistance(x, y, rx, ry, rw, rh) {
  let dx = Math.max(rx - x, 0, x - rx + rw);
  let dy = Math.max(ry - y, 0, y - ry + rh);
  return Math.sqrt(dx*dx + dy*dy);
}

function LineLine(x1, y1, x2, y2, x3, y3, x4, y4){
  // calculate the distance to intersection point
  let uA = ((x4-x3) * (y1-y3) - (y4-y3) * (x1-x3)) / ((y4-y3) * (x2-x1) - (x4-x3) * (y2-y1));
  let uB = ((x2-x1) * (y1-y3) - (y2-y1) * (x1-x3)) / ((y4-y3) * (x2-x1) - (x4-x3) * (y2-y1));

  // if uA and uB are between 0-1, lines are colliding
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return true;
  }

  return false;
}

function LineRect(x1, y1, x2, y2, rx, ry, rw, rh) {
  // check if the line intersects with any of the sides of the rectangle
  let left =   LineLine(x1,y1,x2,y2, rx,ry,rx, ry+rh);
  let right =  LineLine(x1,y1,x2,y2, rx+rw,ry, rx+rw,ry+rh);
  let top =    LineLine(x1,y1,x2,y2, rx,ry, rx+rw,ry);
  let bottom = LineLine(x1,y1,x2,y2, rx,ry+rh, rx+rw,ry+rh);

  // if any return true, collision is occuring
  if (left || right || top || bottom) {
    return true;
  }

  return false;
}

function CircleRect(cx, cy, radius, rx, ry, rw, rh) {
  // temporary variables to set edges for testing
  let testX = cx;
  let testY = cy;
  let collidingEdge = "none";

  // which edge is closest?
  // left edge
  if (cx < rx) {
    testX = rx;
    collidingEdge = "left";
  }
  // right edge
  else if (cx > rx+rw){
    testX = rx+rw;
    collidingEdge = "right";
  }

  // top edge
  if (cy < ry){
    testY = ry;
    collidingEdge = "top";
  }
  // bottom edge
  else if (cy > ry+rh){
    testY = ry+rh;
    collidingEdge = "bottom";
  }

  // get distance from closest edges
  let distX = cx - testX;
  let distY = cy - testY;
  let distance = Math.sqrt((distX * distX) + (distY * distY));

  // if the distance is less than tha radius, collision occurs
  if (distance <= radius) {
    return {distance: distance, side: collidingEdge};
  }

  return {distance: -1, side: "none"};
}
