function triFromCenter(x, y, angle, showSmall) {

  //angle -= PI/2 // adjust angle so that angle=0 points upwards

  if (showSmall)
    useSize = triSize / 2
  else
    useSize = triSize

  p1x = x - useSize * sin(angle + 0)
  p1y = y - useSize * cos(angle + 0)

  p2x = x - useSize * sin(angle + 8 * PI / 9)
  p2y = y - useSize * cos(angle + 8 * PI / 9)

  p3x = x - useSize * sin(angle + 10 * PI / 9)
  p3y = y - useSize * cos(angle + 10 * PI / 9)

  return [p1x, p1y, p2x, p2y, p3x, p3y]

}

function rad2deg(radians) {
  return 180 * radians / PI;
}

function deg2rad(degrees) {
  return PI / 180 * degrees;
}

function magnitude2(a, b) {
  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
}

function clamp(val, min, max) {
  if (val < min)
    return min;
  else if (val > max)
    return max;
  else
    return val;
}

function mapSteerWheel(val) {
  inputMin = -1;
  inputMax = 1;
  outputMin = deg2rad(-90);
  outputMax = deg2rad(90);
  return (val - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin;
}