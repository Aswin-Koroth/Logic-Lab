function lerp(A, B, v) {
  return A + (B - A) * v;
}

function remove(element, list, count = 1) {
  while (count > 0) {
    let i = list.indexOf(element);
    if (i < 0) {
      break;
    }
    list.splice(i, 1);
    count--;
  }
}

function drawArrow(context, startX, startY, endX, endY, color) {
  //Only works for vertical down arrows
  let arrowHeadWidth = 10;
  let arrowHeadHeight = 10;
  context.lineWidth = 1.5;
  context.beginPath();
  context.strokeStyle = color;
  context.moveTo(startX, startY);
  context.lineTo(endX, endY - arrowHeadHeight);
  context.stroke();
  context.beginPath();
  context.moveTo(endX - arrowHeadWidth / 2, endY - arrowHeadHeight);
  context.lineTo(endX + arrowHeadWidth / 2, endY - arrowHeadHeight);
  context.lineTo(endX, endY);
  context.closePath();
  context.fill();
  context.stroke();
}

function drawRoundRect(context, x, y, width, height, cValue = 10) {
  if (cValue > Math.min(width, height) / 2)
    cValue = Math.min(width, height) / 2;
  let starX = x + cValue;
  let endX = x + width - cValue;
  let startY = y + cValue;
  let endY = y + height - cValue;

  context.beginPath();
  context.moveTo(starX, y);
  context.lineTo(endX, y);
  context.quadraticCurveTo(x + width, y, x + width, startY);
  context.lineTo(x + width, endY);
  context.quadraticCurveTo(x + width, y + height, endX, y + height);
  context.lineTo(starX, y + height);
  context.quadraticCurveTo(x, y + height, x, endY);
  context.lineTo(x, startY);
  context.quadraticCurveTo(x, y, starX, y);
}
