
let ongamepadconnected;
let ongamepaddisconnected;
let isGamepadConnected = false;
let gamepad, gamepadState;

const DEADZONE = 0.07;

const gamepadIndex = 0;

window.addEventListener("gamepadconnected", event => {
  console.log('Gamepad connected:');
  console.log(event.gamepad);
  isGamepadConnected = true;
});

window.addEventListener("gamepaddisconnected", event => {
  console.log('Gamepad disconnected:');
  console.log(event.gamepad);
  isGamepadConnected = false;
  gamepad = null;
});

function updateController() {
  // console.log(navigator.getGamepads())
  if (isGamepadConnected) {
    gamepad = navigator.getGamepads()[gamepadIndex];
    gamepadState = { // get values and negate Y axes
      id: gamepad.id,
      axes: [
        deadZone(gamepad.axes[0]),
        deadZone(-gamepad.axes[1]),
        deadZone(gamepad.axes[2]),
        deadZone(-gamepad.axes[3])
      ]
    }
  }
}

function deadZone(value) {
  value = Number(value);
  if (abs(value) < DEADZONE)
    return 0
  else
    return value
}