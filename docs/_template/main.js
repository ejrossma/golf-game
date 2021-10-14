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
`;

/**
 * @typedef {{
 * pos: Vector,
 * velocity: Vector,
 * get nextPos(): Vector
 * }} Bullet
 */

/**@type { Bullet } */
let bullet;

function levelLine(x1, y1, x2, y2) {
  return {
    p1: vec(x1, y1),
    p2: vec(x2, y2)
  }
}

let levels = {
  one: [
    levelLine(0,0,6,0),
    levelLine(6,0,6,2),
    levelLine(6,2,9,2),
    levelLine(9,2,9,3),
    levelLine(9,3,10,3),
    levelLine(10,3,10,8),
    levelLine(10,8,9,8),
    levelLine(9,8,9,9),
    levelLine(9,9,8,9),
    levelLine(8,9,8,10),
    levelLine(0,10,3,10),
    levelLine(3,8,3,10),
    levelLine(0,0,0,10),
    levelLine(3,8,4,8),
    levelLine(4,8,4,10),
    levelLine(4,10,8,10)
  ]
}

let currentLevel;

function update() {
  if (!ticks) {
    // set starting values
    currentLevel = levels.one

    bullet = {
      pos: vec(20, 20),
      velocity: vec(1,0.8),
      get nextPos() {
        return vec(this.pos.x + this.velocity.x, this.pos.y + this.velocity.y);
      }
    }
  }

  // draw the level
  color("blue");
  currentLevel.forEach(l => {
    line(l.p1.x * 20, l.p1.y * 20, l.p2.x * 20, l.p2.y * 20, 2);
  });

  // copy the bullet velocity in case it has to be changed in the case of a collision
  let newVelocity = vec(bullet.velocity);
  // check for a collision with any of the lines
  for(let i = 0; i < currentLevel.length; i++){
    // get current line
    let l = currentLevel[i];

    // check for collision
    let collision = LineLine(
      bullet.pos.x, bullet.pos.y, bullet.nextPos.x, bullet.nextPos.y,
      l.p1.x * 20,  l.p1.y * 20,  l.p2.x * 20,      l.p2.y * 20
    );
    
    // if there is a collision
    if (collision.collided) {
      // TODO: Make sure that if there are multiple collisions on the same frame, pick the closest one
      
      // set the new velocity to something that takes will bring the ball to the collision point
      newVelocity = vec(collision.intX - bullet.pos.x, collision.intY - bullet.pos.y);

      // flip velocity based on line type
      if (l.p1.x == l.p2.x) { // vertical line
        bullet.velocity.x *= -1;
      } else if (l.p1.y == l.p2.y) { // horizontal line
        bullet.velocity.y *= -1;
      }

      // break when collison is found. This could cause problems with collisions near corners
      break;
    }
  };

  // add the velocity to the bullet position
  bullet.pos.add(newVelocity);

  // draw the bullet
  color("yellow");
  line(bullet.pos, bullet.pos, 3);

  // draw the line from the bullet's position to the bullet's next position (not accurate on collision frames)
  color("green");
  line(bullet.pos, bullet.nextPos, 1);
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
  let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

  // if uA and uB are between 0-1, lines are colliding
  if (uA > 0 && uA <= 1 && uB > 0 && uB <= 1) {
    return {
      collided: true,
      intX: x1 + (uA * (x2-x1)),
      intY: y1 + (uA * (y2-y1))
    }
  }

  return {collided: false};
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
