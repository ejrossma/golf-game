title = "CyberBullet";

description = `
    [Click/Hold]
Pull back on bullet!
`;

characters = [];

const G = {
  WIDTH: 200,
  HEIGHT: 200,

  GRAVITY: 9.8 / 60,
  DRAG: 0.01,

  MAX_BALL_VELOCITY: 2,

  LEVELSIZE: 10
}

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  theme: "shapeDark",
  isPlayingBgm: true,
  isReplayEnabled: true
};

let bulletStartPos;
let goalPos;

/* Level Concepts
  Rules Level - Have to intentionally miss to not get in 0 bounces
  Intro Level - Very Easy (Able to Get it in 1 Bounce)
  Risk Taking Level - Force Player to Choose One of Two Directions (One Easy, but more bounces)
  Satisfying Level - Symmetrical & need to follow pattern of map to get a satisfying win no matter which direction you choose
*/

/* Level Plan
  Level 1 - Freebie to teach them the game
  Level 2 - Able to get in 1 bounce if you are a gamer, but easy in 2-4 bounces
  Level 3 - One simple path, One shortcut path. Possible to lose if its your first or 2nd time playing
  Level 4 - Medium difficulty with even possibility of losing/success
*/
const levels = [
`
0000000000
0000000000
0000000000
0000000G00
0000000000
00S0000000
0000000000
0000000000
0000000000
0000000000
`,
`
0000000000
0S00000000
0000000000
XXXXX00000
000X000000
000X000000
000X000G00
000X000000
0X00XXXXXX
0000000000
`,
`
000X0X0X0X
0S00000000
0000000000
X00XXXXX0X
000X00000X
X00X00000X
000X0XXX0X
X0000X0X0X
00000X0XGX
XXXXXXXXXX
`,
`
000X00X000
0S00X0X0X0
X0X0X0X000
000000X0X0
XXX0000000
000000X00X
XXXX0XX00X
000000000X
00000000GX
XXXXXXXXXX
`
]

const STATE = {
  WAITING: 0,
  FREE: 1,
}

/**
 * @typedef {{
 * pos: Vector,
 * velocity: Vector,
 * state: number,
 * get nextPos(): Vector
 * }} Bullet
 */

/** @type { Bullet } */
let bullet;

let levelIndex;

let currentLevel;

let readyForLaunch;

let levelScore;

function update() {
  if (!ticks) {

    levelIndex = 0;
    readyForLaunch = false;
    levelScore = 1000;

    currentLevel = constructLevel(levels[levelIndex]);
    createBorder(currentLevel);

    bullet = {
      pos: vec(bulletStartPos.x, bulletStartPos.y),
      velocity: vec(0,0),
      state: STATE.WAITING,
      get nextPos() {
        return vec(this.pos.x + this.velocity.x, this.pos.y + this.velocity.y);
      }
    }
  }

  color("yellow");
  if (levelIndex == 0) text("AIM FOR THIS ->", 55, 73);

  // draw the level
  color("blue");
  currentLevel.forEach(l => {
    line(l.p1, l.p2, 2);
  });

  // check for player input
  if (bullet.state == STATE.WAITING) {
    if (input.isJustPressed) {
      readyForLaunch = true;
    }

    if (input.isPressed && !input.pos.equals(bullet.pos) && readyForLaunch) {
      color("black");
      let endPoint = vec(-(input.pos.x - bullet.pos.x), -(input.pos.y - bullet.pos.y)).normalize().mul(6).add(bullet.pos);
      // line(bullet.pos, endPoint,1);
      line(bullet.pos, endPoint, 1);
    }

    if (input.isJustReleased && readyForLaunch) {
      let bulletToInputVector = vec(-input.pos.x + bullet.pos.x, -input.pos.y + bullet.pos.y).normalize().mul(G.MAX_BALL_VELOCITY);
      bullet.velocity.add(bulletToInputVector);
      readyForLaunch = false;
      bullet.state = STATE.FREE;
    }
  }

  // copy the bullet velocity in case it has to be changed in the case of a collision
  let newVelocity = vec(bullet.velocity);
  let closestCollision;
  // check for a collision with any of the lines
  for(let i = 0; i < currentLevel.length; i++){
    // get current line
    let l = currentLevel[i];

    // check for collision
    let collision = LineLine(
      bullet.pos.x, bullet.pos.y, bullet.nextPos.x, bullet.nextPos.y,
      l.p1.x,       l.p1.y,       l.p2.x,           l.p2.y
    );
    
    // if there is a collision
    if ( collision.collided && (collision.intX != bullet.pos.x || collision.intY != bullet.pos.y)) {
      if (!closestCollision || vec(collision.intX, collision.intY).distanceTo(bullet.pos) <= vec(closestCollision.intX, closestCollision.intY).distanceTo(bullet.pos)) {
        // set closest collision
        closestCollision = collision;

        // set the new velocity to something that takes will bring the bullet to the collision point
        newVelocity = vec(collision.intX - bullet.pos.x, collision.intY - bullet.pos.y);
  
        // flip velocity based on line type
        if (l.p1.x == l.p2.x) { // vertical line
          bullet.velocity.x *= -1;
        } else if (l.p1.y == l.p2.y) { // horizontal line
          bullet.velocity.y *= -1;
        }
      }
    }
  };

  // add the velocity to the bullet position
  if (bullet.state == STATE.FREE) bullet.pos.add(newVelocity);

  //draw the trail
  color("yellow");
  particle(bullet.pos.x - newVelocity.x, bullet.pos.y - newVelocity.y, 5);

  //draw the goal
  color("red");
  rect(goalPos.x - 2, goalPos.y - 2, 10);

  // draw the bullet
  color("yellow");
  const beatLevel = line(bullet.pos, bullet.pos, 3).isColliding.rect.red;
  if (beatLevel) {
    console.log("Level Beaten");
    if (levelIndex != 4) {
      nextLevel();
    } else {
      end("CONGRATULATIONS YOU WIN!!");
    }
  }

  if (closestCollision){
    particle(closestCollision.intX, closestCollision.intY, 10, 1);
    addScore(-25);
  }

  //make reset button
  if (bullet.state == STATE.FREE) {
    color("green");
    rect(80, 5, 40, 10);
    color("white");
    text("RESET", vec(88, 9));

    //check if player is clicking reset button
    color("transparent");
    let inputCollider = rect(input.pos, 1);
    const isClickingButton = inputCollider.isColliding.rect.green;
    if (input.isJustPressed && isClickingButton) {
      console.log("Reset Level");
      reset();
    }
  }
}

function reset() {
  addScore(-50);
  //same level
    //reset ball position & get ready to launch & change state to waiting
  bullet = {
    pos: vec(bulletStartPos.x, bulletStartPos.y),
    velocity: vec(0,0),
    state: STATE.WAITING,
    get nextPos() {
      return vec(this.pos.x + this.velocity.x, this.pos.y + this.velocity.y);
    }
  }
}

function nextLevel() {
  addScore(levelScore);
  levelScore = 1000 + 1000 * levelIndex;
  levelIndex++;
  currentLevel = constructLevel(levels[levelIndex]);
  createBorder(currentLevel);
  bullet = {
    pos: vec(bulletStartPos.x, bulletStartPos.y),
    velocity: vec(0,0),
    state: STATE.WAITING,
    get nextPos() {
      return vec(this.pos.x + this.velocity.x, this.pos.y + this.velocity.y);
    }
  }
}

function levelLine(x1, y1, x2, y2) {
  return {
    p1: vec(x1, y1),
    p2: vec(x2, y2)
  }
}

function constructLevel(levelString) {
  let levelToReturn = [];
  levelString = levelString.trim();

  let currentX = 0;
  let currentY = 0;
  for(let i = 0; i < levelString.length; i++){
    let character = levelString[i];
    switch(character) {
      case "0":
        currentX++;
      break;
      case "X":
        levelToReturn.push(
          levelLine(currentX * 20, currentY * 20, (currentX + 1) * 20, currentY * 20),
          levelLine((currentX + 1) * 20, currentY * 20, (currentX + 1) * 20, (currentY + 1) * 20),
          levelLine(currentX * 20, (currentY + 1) * 20, (currentX + 1) * 20, (currentY + 1) * 20),
          levelLine(currentX * 20, currentY * 20, currentX * 20, (currentY + 1) * 20),
        )
        currentX++;
      break;
      case "S":
          bulletStartPos = vec((currentX + 0.5) * 20, (currentY + 0.5) * 20);
          currentX++;
      break;
      case "G":
          goalPos = vec((currentX + 0.5) * 20, (currentY + 0.5) * 20);
          currentX++;
      break;
      case "\n":
        // go to the next line
        currentX = 0;
        currentY ++;
      break;
    }
  };

  return levelToReturn;
}

function createBorder(level) {
  level.push(
    levelLine(0,0,200,0),
    levelLine(200,0,200,200),
    levelLine(0,0,0,200),
    levelLine(0,200,200,200)
  )
}

function HitBall() {
  
}

function PointRectDistance(x, y, rx, ry, rw, rh) {
  let dx = Math.max(rx - x, 0, x - rx + rw);
  let dy = Math.max(ry - y, 0, y - ry + rh);
  return Math.sqrt(dx*dx + dy*dy);
}

function onSegment(p, q, r) {
  if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) return true;
   
    return false;
}

function checkOrientation(p, q, r) {
  let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
   
  if (val == 0) return 0; // collinear
  
  return (val > 0)? 1: 2; // clock or counterclock wise
}

function doIntersect(p1, q1, p2, q2)
{
 
  // Find the four orientations needed for general and
  // special cases
  let o1 = checkOrientation(p1, q1, p2);
  let o2 = checkOrientation(p1, q1, q2);
  let o3 = checkOrientation(p2, q2, p1);
  let o4 = checkOrientation(p2, q2, q1);
  
  // General case
  if (o1 != o2 && o3 != o4)
      return true;
  
  // Special Cases
  // p1, q1 and p2 are collinear and p2 lies on segment p1q1
  if (o1 == 0 && onSegment(p1, p2, q1)) return true;
  
  // p1, q1 and q2 are collinear and q2 lies on segment p1q1
  if (o2 == 0 && onSegment(p1, q2, q1)) return true;
  
  // p2, q2 and p1 are collinear and p1 lies on segment p2q2
  if (o3 == 0 && onSegment(p2, p1, q2)) return true;
  
  // p2, q2 and q1 are collinear and q1 lies on segment p2q2
  if (o4 == 0 && onSegment(p2, q1, q2)) return true;
  
  return false; // Doesn't fall in any of the above cases
}

function getIntersection(p1, q1, p2, q2) {
  let d = (p1.x - q1.x) * (p2.y - q2.y) - (p1.y - q1.y) * (p2.x - q2.x);

  let x = (p1.x * q1.y - p1.y * q1.x) * (p2.x - q2.x) - (p1.x - q1.x) * (p2.x * q2.y - p1.y * q2.x);
  let y = (p1.x * q1.y - p1.y * q1.x) * (p2.y - q2.y) - (p1.y - q1.y) * (p2.x * q2.y - p1.y * q2.x);

  return vec(x/d, y/d);
}

function LineLine(x1, y1, x2, y2, x3, y3, x4, y4){
  // calculate the distance to intersection point
  let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

  // if uA and uB are between 0-1, lines are colliding
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
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
