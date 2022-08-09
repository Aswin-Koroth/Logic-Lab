//GATE SIM V2
let canvas = document.querySelector(".canvas"),
  ctx = canvas.getContext("2d");

let gateButtons = document.querySelectorAll(".gate");
let dltButton = document.querySelector(".dlt");
let tempSelection = null;
let currentConLineIndex = null;
let snapable = false;
let currentSelectedGate = null;

let inputBoxCount = 2;
let outputBoxCount = 1;

let GATES = [];
let INPUTBOXES = [];
let OUTPUTBOXES = [];

function abc() {
  console.log("hello");
  ctx.globalCompositeOperation = "copy";
  ctx.drawImage(ctx.canvas, 100, 0);
  ctx.globalCompositeOperation = "source-over";
}

function main() {
  setEventListeners();
  updateCanvas();
  createBoolBox();
}

function createBoolBox() {
  //INPUTS
  for (let i = 0; i < inputBoxCount; i++) {
    let fac = canvas.height * (20 / 100);
    let x = 40;
    let y = lerp(fac, canvas.height - fac, (i + 1) / (inputBoxCount + 1));
    INPUTBOXES.push(new inputBox(x, y));
  }
  //OUTPUTS
  for (let i = 0; i < outputBoxCount; i++) {
    let fac = canvas.height * (20 / 100);
    let x = canvas.width - 40;
    let y = lerp(fac, canvas.height - fac, (i + 1) / (outputBoxCount + 1));
    OUTPUTBOXES.push(new outputBox(x, y));
  }
}

function updateCanvas() {
  canvas.width = window.innerWidth - 150;
  canvas.height = window.innerHeight - 150;
  [...INPUTBOXES, ...OUTPUTBOXES].forEach((box) => box.update(ctx));
  GATES.forEach((gate) => {
    if (gate === currentSelectedGate) gate.update(ctx, true);
    else gate.update(ctx, false);
  });
  requestAnimationFrame(updateCanvas);
}

function isInCircle(event, circleX, circleY, radius) {
  let x = event.clientX - circleX;
  let y = event.clientY - circleY;
  hyp = Math.hypot(x, y);
  return hyp <= radius;
}

function getCurrentSelection(event) {
  //check for connection points
  for (let i = connectionPoints.output.length - 1; i >= 0; i--) {
    let point = connectionPoints.output[i];
    let isIn = isInCircle(
      event,
      point.position.x,
      point.position.y,
      point.radius
    );
    if (isIn) return point;
  }
  //check for gates
  for (let i = GATES.length - 1; i >= 0; i--) {
    let gate = GATES[i];
    if (
      event.clientX > gate.position.x &&
      event.clientX < gate.position.x + gate.width &&
      event.clientY > gate.position.y &&
      event.clientY < gate.position.y + gate.height
    )
      return gate;
  }
  return null;
}

function isSnapable(event) {
  for (let i = connectionPoints.input.length - 1; i >= 0; i--) {
    let point = connectionPoints.input[i];
    let isIn = isInCircle(
      event,
      point.position.x,
      point.position.y,
      inputPoint.snapDistance
    );
    if (isIn) return point;
  }
  return false;
}

function setEventListeners() {
  canvas.addEventListener("click", onClick);
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mousemove", onMouseMove);
  addEventListener("mouseup", onMouseUp);
  dltButton.addEventListener("click", abc);
  gateButtons.forEach((button) => {
    button.addEventListener("mousedown", spawn);
  });
}

function onClick(event) {
  if (event.button === 0) {
    //check inputboxes
    for (let i = INPUTBOXES.length - 1; i >= 0; i--) {
      let box = INPUTBOXES[i];
      let isIn = isInCircle(event, box.position.x, box.position.y, box.radius);
      if (isIn) {
        box.connection.value = !box.connection.value;
      }
    }
  }
}
function onMouseDown(event) {
  console.log(event);
  if (event.button === 0) {
    tempSelection = getCurrentSelection(event);
    if (tempSelection instanceof gate) {
      remove(tempSelection, GATES);
      GATES.push(tempSelection);
      tempSelection.offset.x = event.clientX - tempSelection.position.x;
      tempSelection.offset.y = event.clientY - tempSelection.position.y;
    } else if (tempSelection instanceof connectionPoint) {
      currentConLineIndex =
        tempSelection.connections.push(new connectionLine(tempSelection)) - 1;
    }
    currentSelectedGate = GATES[GATES.length - 1];
  }
}

function onMouseMove(event) {
  if (tempSelection instanceof gate) {
    //Moving Gate
    tempSelection.position.x = event.clientX - tempSelection.offset.x;
    tempSelection.position.y = event.clientY - tempSelection.offset.y;
  } else if (tempSelection instanceof connectionPoint) {
    //Moving Connection Line
    tempSelection.connections[currentConLineIndex].end.position.x =
      event.clientX;
    tempSelection.connections[currentConLineIndex].end.position.y =
      event.clientY;
    snapable = isSnapable(event);
    if (snapable && snapable.connection == null) {
      //temp replace
      tempSelection.connections[currentConLineIndex].end.position.x =
        snapable.position.x;
      tempSelection.connections[currentConLineIndex].end.position.y =
        snapable.position.y;
    }
  }
}

function onMouseUp(event) {
  if (tempSelection instanceof connectionPoint) {
    if (snapable && snapable.connection == null) {
      //temp replace
      // let replace = snapable.connection != null;
      snapable.connect(tempSelection.connections[currentConLineIndex]);
      tempSelection.connections[currentConLineIndex].end = snapable;
      // if (replace) {
      //   remove(snapable.connection, snapable.connection.start.connections);
      //   snapable.disconnect();
      // }
      snapable = false;
    } else {
      tempSelection.disconnect(currentConLineIndex);
    }
  }
  tempSelection = null;
}

function spawn(event) {
  let button = event.target;
  let fun = button.getAttribute("data-name");
  let index;
  switch (fun) {
    case "AND":
      index = GATES.push(new AND(event.pageX, event.pageY)) - 1;
      break;
    case "OR":
      index = GATES.push(new OR(event.pageX, event.pageY)) - 1;
      break;
    case "NOT":
      index = GATES.push(new NOT(event.pageX, event.pageY)) - 1;
      break;
    case "NAND":
      index = GATES.push(new NAND(event.pageX, event.pageY)) - 1;
      break;
    case "NOR":
      index = GATES.push(new NOR(event.pageX, event.pageY)) - 1;
      break;
    case "XOR":
      index = GATES.push(new XOR(event.pageX, event.pageY)) - 1;
      break;
  }

  currentSelectedGate = tempSelection = GATES[index];
}

main();

// 3/8/2022
// Aswin-Koroth
