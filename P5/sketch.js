const windowSize = 1000;
let x, y;
const triSize = 75;
const robotRadius = 300;
let curAngle = 0;
let gamma = 0;
let curMode = "CRAB";
let R_max = 3000;
let turnRadius = Infinity;

delta_lim = 90 // "steering" wheel can go only +/- 90 degrees of gamma

// common text stuff
const textX = Math.floor(windowSize * 0.01);
const textX2 = Math.floor(windowSize * 0.75);
const textXMid = Math.floor(windowSize * 0.4);
const textY = 30;
const commonTextSize = 30;

// gpad text stuff
let gpadText, gpadText2


//robot text stuff
let vel = 0;

let robot;

class Wheel {
  constructor(theta) {

    this.alpha = 0;
    this.theta = theta;
    this.calibOffset = theta;

  }

  setAngle(angle) {
    this.alpha = angle;
  }

  setTheta(angle) { // ONLY USED FOR THE STEERING WHEEL! other thetas are constant.
    this.theta = angle;
    this.calibOffset = angle;
  }

  getAngle() {
    if (this.alpha > 360)
      this.alpha -= 360;
    else if (this.alpha < 0)
      this.aplpha += 360
    return this.alpha + this.calibOffset;
  }
}

class Robot {
  constructor(x, y, r, theta) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.theta = theta;

    this.wheel1 = new Wheel(0);
    this.wheel2 = new Wheel(2 * PI / 3);
    this.wheel3 = new Wheel(4 * PI / 3);

    this.steerWheel = new Wheel(0);
  }

  setAngle(angle) {
    this.theta = angle;
  }

  getWheelByIndex(index) {
    if (index == 0) {
      return this.wheel1;
    } else if (index == 1) {
      return this.wheel2;
    } else if (index == 2) {
      return this.wheel3;
    }
  }

  getWheelPos(wheel) {
    let wheelX = this.x - this.r * sin(this.theta + wheel.theta)
    let wheelY = this.y - this.r * cos(this.theta + wheel.theta)
    return [wheelX, wheelY, wheel.getAngle() + this.theta]
  }

  show() {
    // draw body
    fill('red');
    stroke('red');
    circle(x, y, this.r * 2);

    // draw center indicator
    fill('white')
    stroke('white')
    triangle(...triFromCenter(x, y, robot.theta));

    // draw wheel1
    fill('blue')
    stroke('blue')
    triangle(...triFromCenter(...this.getWheelPos(this.wheel1)))

    // draw wheel2
    fill('green')
    stroke('green')
    triangle(...triFromCenter(...this.getWheelPos(this.wheel2)))

    // draw wheel2
    fill('teal')
    stroke('teal')
    triangle(...triFromCenter(...this.getWheelPos(this.wheel3)))

    // draw the steering wheel
    fill('orange')
    stroke('orange')
    triangle(...triFromCenter(...this.getWheelPos(this.steerWheel), true))
  }
}

function makeGamepadText() {
  if (isGamepadConnected) {
    gpadText = "Gamepad Connected: "
    gpadText2 = gamepad.id;
  }
  else {
    gpadText = "No Gamepad Connected. Connect one and press any button."
    gpadText2 = ""
  }
  stroke(0);
  fill('white');
  textSize(commonTextSize);
  text(gpadText, textX, textY);
  text(gpadText2, textX, textY * 2);
  text("Left Stick", textX, textY * 5);
  text("Right Stick", textX2, textY * 5);
  if (isGamepadConnected) {
    text('X: ' + gamepadState.axes[0].toFixed(3), textX, textY * 6);
    text('Y: ' + gamepadState.axes[1].toFixed(3), textX, textY * 7);
    text('X: ' + gamepadState.axes[2].toFixed(3), textX2, textY * 6);
    text('Y: ' + gamepadState.axes[3].toFixed(3), textX2, textY * 7);
  }
}

function makeRobotStatsText() {
  stroke(0);
  fill('white');
  textSize(commonTextSize);
  text("Mode: " + curMode, textXMid, textY * 3)
  text("gamma: " + rad2deg(gamma).toFixed(3) + '\u00B0', textX, textY * 28);
  text('Velocity: ' + vel.toFixed(2), textX, textY * 30)
  text('TurnRadius: ' + turnRadius.toFixed(2), textX, textY * 32)
}

function updateSteerWheel(theta, delta) {
  robot.steerWheel.setTheta(theta);
  robot.steerWheel.setAngle(delta);
}

function doTurnMode() {
  // Pure turn: set all wheels to 90 degrees, and then map input to the power
  curMode = "TURN";
  robot.wheel1.setAngle(deg2rad(90));
  robot.wheel2.setAngle(deg2rad(90));
  robot.wheel3.setAngle(deg2rad(90));
  turnRadius = 0;
  vel = -gamepadState.axes[2];
}

function doCrabDrive() {
  curMode = "CRAB";
  gamma = atan2(-gamepadState.axes[0], gamepadState.axes[1]);
  vel = clamp(magnitude2(gamepadState.axes[0], gamepadState.axes[1]), 0, 1);
  robot.wheel1.setAngle(gamma);
  robot.wheel2.setAngle(gamma - robot.wheel2.calibOffset);
  robot.wheel3.setAngle(gamma - robot.wheel3.calibOffset);
  turnRadius = Infinity
  updateSteerWheel(0, 0);
}

function doSnakeDrive() {
  curMode = "SNAKE";
  gamma = atan2(-gamepadState.axes[0], gamepadState.axes[1]);
  vel = clamp(magnitude2(gamepadState.axes[0], gamepadState.axes[1]), 0, 1);
  updateSteerWheel(gamma, mapSteerWheel(-gamepadState.axes[2]));
  turnRadius = robot.r / tan(robot.steerWheel.alpha);
  //set up snake mode math now
  let offsets = [0, 120, 240]
  let tanDelCL = tan(robot.steerWheel.alpha)
  for (let i = 0; i < 3; i++) {
    gamma_i = offsets[i] - gamma; // eqn 5-7
    R_i = robot.r * Math.sqrt(1 + (1 / Math.pow(tanDelCL, 2)) - 2 * (sin(gamma_i / tanDelCL)))
    vel_i = vel * R_i / R_max;
  }
}

function doTestSteer() {
  if (gamepadState.axes[2] > 0) {
    curAngle -= deg2rad(1);
  } else if (gamepadState.axes[2] < 0) {
    curAngle += deg2rad(1);
  }
}

function setup() {
  createCanvas(windowSize, windowSize);
  x = width / 2;
  y = height / 2;
  background(0);
  angleMode(RADIANS);
  robot = new Robot(x, y, robotRadius, 0);
  robot.setAngle(curAngle);
}

function draw() {
  background(0);
  updateController();
  makeGamepadText();
  makeRobotStatsText();
  robot.setAngle(curAngle);
  if (isGamepadConnected) {
    if (gamepadState.axes[2] == 0) {
      doCrabDrive(); // if right joystick is neutral, crab mode only
    } else if (magnitude2(gamepadState.axes[0], gamepadState.axes[1]) == 0) {
      doTurnMode(); // if left joystick is neutral, pure twist mode
    } else {
      doSnakeDrive();
    }
  }

  robot.show();
}