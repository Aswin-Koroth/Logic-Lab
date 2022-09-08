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
