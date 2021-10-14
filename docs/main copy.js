title = "GOLF BABY";

description = `
`;

characters = [
`
 rr
rrrr
rrrr
 rr
`
];

const G = {
  HEIGHT: 200,
  WIDTH: 300,
  
  GRAVITY: 9.8 / 60,
  HORIZONGTAL_DRAG: 0.1,
  
  GOLFBALL_SPEED_MIN: 0.25,
  GOLFBALL_SPEED_MAX: 5,
  GOLFBALL_ROTATION_SPEED: 0.1,

  PLAYER_HIT_SPEED_MIN: 1,
  PLAYER_HIT_SPEED_MAX: 10,
}

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  theme: "shape",
};

/**
 * @typedef {{
 * pos: Vector,
 * rotation: number,
 * velocity: Vector,
 * sprite: string,
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

/**
 * @type { Platform[] }
 */
let platforms;

//player clicked on ball
let clickedOnBall = false;
//ball is grounded on a platform
let grounded = true;

let arcRotation = 0;

function update() {
  if (!ticks) {
    clickedOnBall = false;
    arcRotation = 0;

    ball = {
      pos: vec(50, 80),
      rotation: 0,
      velocity: vec(0, 0),
      sprite: "a"
    }

    console.log(ball.pos);
  }

  //draw ball transparent
    //check for collisions
    //handle math
    //adjust position
      //draw ball black

  //color("transparent");
  // grounded = char(ball.sprite, ball.pos, {rotation: ball.rotation}).isColliding.rect.green;
  // while(char(ball.sprite, ball.pos, {rotation: ball.rotation})) {

  // }

  //if the ball is in the air
  if (!grounded) {
    //rotate ball
    ball.rotation += G.GOLFBALL_ROTATION_SPEED;
    //find if ball has reached terminal velocity
    if (ball.velocity.y < G.GOLFBALL_SPEED_MAX) {
      ball.velocity.y += G.GRAVITY;
    }
  //if ball is grounded on a platform
  } else {
    ball.rotation = 0;
    //reset ball vector
    //ball.velocity.set();
  }
  ball.pos.add(ball.velocity);

  color("black");
  char(ball.sprite, ball.pos, {rotation: ball.rotation});
  
  arc(vec(50, 50), 3, 2, arcRotation, 2*Math.PI + arcRotation);
  arcRotation += 0.005;

  if (input.isJustPressed && ball.velocity.equals(vec(0, 0))) {
    color("transparent");
    clickedOnBall = box(input.pos, 1, 1).isColliding.char.a;
    if (clickedOnBall) console.log("Ball Clicked");
  }

  if (input.isJustReleased && clickedOnBall) {
    // Call Ball Movement Function
    BallMovement();

    clickedOnBall = false;
  }
}

function BallMovement() {
  let tempBallPos = vec(ball.pos);
  let directionVector = tempBallPos.sub(input.pos);
  directionVector.clamp(-G.GOLFBALL_SPEED_MAX, G.GOLFBALL_SPEED_MAX, -G.GOLFBALL_SPEED_MAX, G.GOLFBALL_SPEED_MAX);
  ball.velocity.add(directionVector);
  console.log(directionVector);
}
