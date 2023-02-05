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

function isInCircle(event, circleX, circleY, radius) {
  let x = event.offsetX - circleX;
  let y = event.offsetY - circleY;
  hyp = Math.hypot(x, y);
  return hyp <= radius;
}

function showAlert(alert) {
  const alertbox = document.querySelector(".alertbox");
  const cross = document.querySelector(".alertbox .cross");
  const prompt = document.querySelector(".alertbox .prompt");

  togglePause();
  prompt.innerText = alert;
  alertbox.style.display = "block";
  cross.addEventListener(
    "click",
    () => {
      alertbox.style.display = "none";
      togglePause();
    },
    {
      once: true,
    }
  );
}

function drawArrow(context, startX, startY, endX, endY, color) {
  let arrowHeadWidth = 10;
  let arrowHeadHeight = 10;
  let lineWidth = 1.5;

  let sign = Math.sign(startX - endX ? startX - endX : -1);

  let deltaX = endX - startX; // X component of line
  let deltaY = endY - startY; // Y component of line
  // PI/2 - angle between the line and x axis = angle between arrow base and x axis
  let angleX = Math.PI / 2 - Math.atan(deltaY / deltaX); // Math.PI/2 = 90 degree
  // line length = line_end - arrow_head_height
  let lineEndX = endX + sign * Math.sin(angleX) * arrowHeadHeight;
  let lineEndY = endY + sign * Math.cos(angleX) * arrowHeadHeight;

  context.lineWidth = lineWidth;
  context.lineCap = "round";
  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(startX, startY);
  context.lineTo(lineEndX, lineEndY);
  context.moveTo(
    lineEndX - (arrowHeadWidth / 2) * Math.cos(angleX),
    lineEndY + (arrowHeadWidth / 2) * Math.sin(angleX)
  );
  context.lineTo(
    lineEndX + (arrowHeadWidth / 2) * Math.cos(angleX),
    lineEndY - (arrowHeadWidth / 2) * Math.sin(angleX)
  );
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
