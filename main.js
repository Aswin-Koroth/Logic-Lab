//LOGIC SIM V2.0
let canvas = document.querySelector(".canvas"),
  ctx = canvas.getContext("2d");

let gateButtons = document.querySelectorAll(".gate");
// let dltButton = document.querySelector(".dlt");
let addButton = document.querySelectorAll(".add");
let removeButton = document.querySelectorAll(".remove");

let tempSelection = null;
let currentConLineIndex = null;
let currentSelectedGate = null;
let snapable = false;

let inputBoxCount = 2;
let outputBoxCount = 1;

let GATES = [];
let INPUTBOXES = [];
let OUTPUTBOXES = [];

function main() {
  setEventListeners();
  updateCanvas();
  createBoolBox();
}

function createBoolBox() {
  let fac = canvas.height * (20 / 100); //20% of canvas.height
  //INPUTS
  if (INPUTBOXES[inputBoxCount] !== undefined) {
    INPUTBOXES[inputBoxCount].connection.disconnect();
    INPUTBOXES.pop();
  }
  for (let i = 0; i < inputBoxCount; i++) {
    let x = 40;
    let y = lerp(fac, canvas.height - fac, (i + 1) / (inputBoxCount + 1));
    if (INPUTBOXES[i] === undefined) INPUTBOXES.push(new inputBox(x, y));
    else INPUTBOXES[i].position.y = y;
  }
  //OUTPUTS
  if (OUTPUTBOXES[outputBoxCount] !== undefined) {
    OUTPUTBOXES[outputBoxCount].connection.disconnect();
    OUTPUTBOXES.pop();
  }
  for (let i = 0; i < outputBoxCount; i++) {
    let x = canvas.width - 40;
    let y = lerp(fac, canvas.height - fac, (i + 1) / (outputBoxCount + 1));
    if (OUTPUTBOXES[i] === undefined) OUTPUTBOXES.push(new outputBox(x, y));
    else OUTPUTBOXES[i].position.y = y;
  }
}

function updateCanvas() {
  canvas.width = window.innerWidth - 100;
  canvas.height = window.innerHeight - 150;
  //boolbox
  [...INPUTBOXES, ...OUTPUTBOXES].forEach((box) => box.update(ctx));
  GATES.forEach((gate) => {
    gate.update(ctx, gate === currentSelectedGate);
  });
  requestAnimationFrame(updateCanvas);
}

function isInCircle(event, circleX, circleY, radius) {
  let x = event.offsetX - circleX;
  let y = event.offsetY - circleY;
  hyp = Math.hypot(x, y);
  return hyp <= radius;
}

function getCurrentSelection(event) {
  //check for output points
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
  //check for input points
  for (let i = connectionPoints.input.length - 1; i >= 0; i--) {
    let point = connectionPoints.input[i];
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
      event.offsetX > gate.position.x &&
      event.offsetX < gate.position.x + gate.width &&
      event.offsetY > gate.position.y &&
      event.offsetY < gate.position.y + gate.height
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
  canvas.addEventListener("contextmenu", onRClick);
  canvas.addEventListener("click", onClick);
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mousemove", onMouseMove);
  addEventListener("mouseup", onMouseUp);

  // dltButton.addEventListener("click", deleteGate);
  addButton.forEach((button) => {
    button.addEventListener("click", addBox);
  });
  removeButton.forEach((button) => {
    button.addEventListener("click", removeBox);
  });
  gateButtons.forEach((button) => {
    button.addEventListener("mousedown", spawn);
  });
}

function onRClick(event) {
  console.log(event.button);
  let point = getCurrentSelection(event);
  if (point != null) point.disconnect();
}

function onClick(event) {
  //check inputboxes
  for (let i = INPUTBOXES.length - 1; i >= 0; i--) {
    let box = INPUTBOXES[i];
    let isIn = isInCircle(event, box.position.x, box.position.y, box.radius);
    if (isIn) {
      box.connection.value = !box.connection.value;
    }
  }
}
function onMouseDown(event) {
  if (event.button === 0) {
    tempSelection = getCurrentSelection(event);
    if (tempSelection instanceof gate) {
      remove(tempSelection, GATES);
      GATES.push(tempSelection);
      tempSelection.offset.x = event.offsetX - tempSelection.position.x;
      tempSelection.offset.y = event.offsetY - tempSelection.position.y;
    } else if (tempSelection instanceof outputPoint) {
      currentConLineIndex =
        tempSelection.connections.push(new connectionLine(tempSelection)) - 1;
    }
    currentSelectedGate = GATES[GATES.length - 1];
  }
}

function onMouseMove(event) {
  if (event.button === 0) {
    if (tempSelection instanceof gate) {
      //Moving Gate
      tempSelection.position.x = event.offsetX - tempSelection.offset.x;
      tempSelection.position.y = event.offsetY - tempSelection.offset.y;
    } else if (tempSelection instanceof outputPoint) {
      //Moving Connection Line
      tempSelection.connections[currentConLineIndex].end.position.x =
        event.offsetX;
      tempSelection.connections[currentConLineIndex].end.position.y =
        event.offsetY;
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
}

function onMouseUp(event) {
  if (tempSelection instanceof outputPoint) {
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

function addBox(event) {
  //max = 5
  let button = event.target;
  let type = button.getAttribute("data-type");
  if (type == 0 && inputBoxCount < 5) inputBoxCount++;
  else if (type == 1 && outputBoxCount < 5) outputBoxCount++;
  createBoolBox();
}

function removeBox(event) {
  //min = 1
  let button = event.target;
  let type = button.getAttribute("data-type");
  if (type == 0 && inputBoxCount > 1) inputBoxCount--;
  else if (type == 1 && outputBoxCount > 1) outputBoxCount--;
  createBoolBox();
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

function newGate() {
  //check connection points list for duplicates
  let point = { input: [], output: [] };
  for (let i = 0; i < INPUTBOXES.length; i++) {
    let box = INPUTBOXES[i];
    if (!box.connection.connections[0]) continue;
    let pointList = [];
    box.connection.connections.forEach((con) => {
      pointList.push(con.end);
    });
    point.input.push(pointList);
  }
  for (let i = 0; i < OUTPUTBOXES.length; i++) {
    let box = OUTPUTBOXES[i];
    if (!box.connection.connection) continue;
    point.output.push(box.connection.connection.start);
  }
  console.log(point);
  let gates = [...GATES];
  GATES = [];
  let ind =
    GATES.push(new customGate(100, 200, inputBoxCount, gates, "NOR", point)) -
    1; //temp
  let cgate = GATES[ind];
  console.log(cgate);
  INPUTBOXES = [];
  OUTPUTBOXES = [];
  createBoolBox();
}

function deleteGate(gate) {
  //disconnect input connections
  for (let i = 0; i < gate.input.length; i++) gate.input[i].disconnect();
  //disconnect output connections
  for (let i = 0; i < gate.output.connections.length; i++)
    currentSelectedGate.output.disconnect();
  //remove input connection points from input array
  for (let i = 0; i < gate.inputCount; i++)
    remove(gate.input[i], connectionPoints.input);
  //remove output connection points from output array
  remove(gate.output, connectionPoints.output);
  //remove gate from array
  remove(gate, GATES);
}

main();

// 3/8/2022
// Aswin-Koroth
