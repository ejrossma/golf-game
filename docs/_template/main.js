title = "Shooting Stars";

description = `
      DIRECT YOUR STAR 

   TO THE GLOWING PORTALS



PULL BACK & RELEASE TO START
`;

characters = [];

const G = {
  WIDTH: 200,
  HEIGHT: 200,

  GRAVITY: 9.8 / 60,
  DRAG: 0.01,

  MAX_BALL_VELOCITY: 5,

  LEVELSIZE: 10
}

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  theme: "shapeDark",
  isPlayingBgm: true
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
  Level 5 - Hard Maze-like level with very few solutions
*/
const levels = [
`
0000000000
0000000000
0000000000
0000000G00
0000000000
0S00000000
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
0000XXXXXX
0000000000
`,
`
0X0X0X0X0X
XS00000000
X000000000
X00XXXX0XX
X00X00000X
X00X00X00X
X00X00X00X
X00000X00X
X00000X0GX
XXXXXXXXXX
`,
`
000X00X000
0S00X0X000
X0X0X0X000
000000X000
XXX000X000
000000X00X
XXXXXXX00X
000000000X
00000000GX
XXXXXXXXXX
`
]

/**
 * @typedef {{
 * pos: Vector,
 * velocity: Vector,
 * get nextPos(): Vector
 * }} Bullet
 */

/** @type { Bullet } */
let bullet;

let levelIndex;

let currentLevel;

function update() {
  if (!ticks) {

    levelIndex = 2;

    currentLevel = constructLevel(levels[levelIndex]);
    createBorder(currentLevel);

    bullet = {
      pos: vec(bulletStartPos.x, bulletStartPos.y),
      velocity: vec(1,0.5),
      get nextPos() {
        return vec(this.pos.x + this.velocity.x, this.pos.y + this.velocity.y);
      }
    }
  }

  if (levelIndex == 0) text("AIM FOR THIS ->", 55, 75);

  // draw the level
  color("blue");
  currentLevel.forEach(l => {
    line(l.p1, l.p2, 2);
  });

  // copy the bullet velocity in case it has to be changed in the case of a collision
  let newVelocity = vec(bullet.velocity);
  let closestCollision;
  // check for a collision with any of the lines
  for(let i = 0; i < currentLevel.length; i++){
    // get current line
    // let l = lines[i];
    let l = currentLevel[i];

    // check for collision
    let collision = LineLine(
      bullet.pos.x, bullet.pos.y, bullet.nextPos.x, bullet.nextPos.y,
      l.p1.x,       l.p1.y,       l.p2.x,           l.p2.y
    );
    
    // if there is a collision
    if ( collision.collided && collision.intX != bullet.pos.x && collision.intY != bullet.pos.y) {
      // if there is no closest collision, this is the closest collision
      if (!closestCollision) closestCollision = collision;
      
      // if this collision is nearer than the previous closest collision, it is now the closest collision
      if (closestCollision && vec(collision.intX, collision.intY).distanceTo(bullet.pos) <= vec(closestCollision.intX, closestCollision.intY).distanceTo(bullet.pos)) {
        // set the new velocity to something that takes will bring the bullet to the collision point
        newVelocity = vec(collision.intX - bullet.pos.x, collision.intY - bullet.pos.y);
  
        // flip velocity based on line type
        if (l.p1.x == l.p2.x) { // vertical line
          bullet.velocity.x *= -1;
        } else if (l.p1.y == l.p2.y) { // horizontal line
          bullet.velocity.y *= -1;
        }
        
        // set closest collision
        closestCollision = collision;
      }
    }
  };

  // add the velocity to the bullet position
  bullet.pos.add(newVelocity);

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
    //setup next level here
    //levelIndex++;
  }
  if (closestCollision){
    particle(closestCollision.intX, closestCollision.intY, 10, 1);
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
