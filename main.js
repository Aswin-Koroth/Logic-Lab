//LOGIC SIM V2.0
const canvas = document.querySelector(".canvas"),
  ctx = canvas.getContext("2d");

const gateButtons = document.querySelectorAll(".gate");
const addButton = document.querySelectorAll(".add");
const removeButton = document.querySelectorAll(".remove");

const loadToMemory = true;

let tempSelection = null;
let currentConLineIndex = null;
let currentSelectedGate = null;
let snapable = false;

const defaultGateInputCount = 2;
const defaultInputBoxCount = 2;
const defaultOutputBoxCount = 2;
let defaultBoxPackingCount = 13; //changes with canvas height

let currentInputBoxCount = defaultInputBoxCount;
let currentOutputBoxCount = defaultOutputBoxCount;
const maxBoxCount = 14;
const minBoxCount = 1;

let GATES = [];
let INPUTBOXES = [];
let OUTPUTBOXES = [];

function main() {
  setEventListeners();
  updateCanvas();
  createBoolBox();
  createCustomGateButtons();
}

function createCustomGateButtons() {
  if (loadToMemory) loadGates();
  storedGates.forEach((gate) => createGateBtn(gate));
  // let buttons = Object.keys(localStorage);
  // buttons.forEach((btn) => createGateBtn(btn));
}

function createBoolBox() {
  let radius = boolBox.radius;
  defaultBoxPackingCount = Math.round(canvas.height / (2 * radius) - 1);
  //INPUTS
  if (INPUTBOXES[currentInputBoxCount] !== undefined) {
    INPUTBOXES[currentInputBoxCount].connection.disconnect();
    INPUTBOXES.pop();
  }
  for (let i = 0; i < currentInputBoxCount; i++) {
    let fac = (defaultBoxPackingCount - currentInputBoxCount) * radius;
    let x = 40;
    let y = lerp(
      fac,
      canvas.height - fac,
      (i + 1) / (currentInputBoxCount + 1)
    );
    if (INPUTBOXES[i] === undefined) INPUTBOXES.push(new inputBox(x, y, i));
    else INPUTBOXES[i].position.y = y;
  }
  //OUTPUTS
  if (OUTPUTBOXES[currentOutputBoxCount] !== undefined) {
    OUTPUTBOXES[currentOutputBoxCount].connection.disconnect();
    OUTPUTBOXES.pop();
  }
  for (let i = 0; i < currentOutputBoxCount; i++) {
    let fac = (defaultBoxPackingCount - currentOutputBoxCount) * radius;
    let x = canvas.width - 40;
    let y = lerp(
      fac,
      canvas.height - fac,
      (i + 1) / (currentOutputBoxCount + 1)
    );
    if (OUTPUTBOXES[i] === undefined) OUTPUTBOXES.push(new outputBox(x, y, i));
    else OUTPUTBOXES[i].position.y = y;
  }
}

function updateCanvas(timestamp) {
  canvas.width = window.innerWidth - 80;
  canvas.height = window.innerHeight - 100;
  //Mark gates for delete
  if (parseInt(timestamp) % 1000 == 0 && timestamp != 0) {
    markForDelete();
  }
  //boolbox
  [...INPUTBOXES, ...OUTPUTBOXES].forEach((box) => box.update(ctx));
  //Gates
  GATES.forEach((gate) => {
    if (gate.markedForDelete) remove(gate, GATES);
    gate.update(ctx, gate === currentSelectedGate);
  });
  requestAnimationFrame(updateCanvas);
}

function markForDelete() {
  GATES.forEach((gate) => {
    if (
      gate.position.x >= canvas.width ||
      gate.position.x + gate.width <= 0 ||
      gate.position.y >= canvas.height ||
      gate.position.y + gate.height <= 0
    )
      gate.markedForDelete = true;
  });
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
      connectionPoint.radius
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
      connectionPoint.radius
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
    let isIn = isInCircle(
      event,
      box.position.x,
      box.position.y,
      boolBox.radius
    );
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
  let button = event.target;
  let type = button.getAttribute("data-type");
  if (type == 0 && currentInputBoxCount < maxBoxCount) currentInputBoxCount++;
  else if (type == 1 && currentOutputBoxCount < maxBoxCount)
    currentOutputBoxCount++;
  createBoolBox();
}

function removeBox(event) {
  let button = event.target;
  let type = button.getAttribute("data-type");
  if (type == 0 && currentInputBoxCount > minBoxCount) currentInputBoxCount--;
  else if (type == 1 && currentOutputBoxCount > minBoxCount)
    currentOutputBoxCount--;
  createBoolBox();
}

function createGateBtn(label) {
  let div = document.querySelector(".custom");
  let button = document.createElement("div");
  button.classList.add("btn", "gate");
  button.setAttribute("data-name", label);
  button.innerText = label;

  button.addEventListener("mousedown", spawn);
  div.appendChild(button);
}

function spawn(event) {
  let button = event.target;
  let fun = button.getAttribute("data-name");
  let index = GATES.push(createGate(fun, event.pageX, event.pageY)) - 1;
  currentSelectedGate = tempSelection = GATES[index];
}

function getGateData(name) {
  let rawData = JSON.parse(localStorage.getItem(name));
  let circuit = getCircuit(rawData);
  let inputCount = circuit.points.input.length;
  let outputCount = circuit.points.output.length;

  return {
    inCount: inputCount,
    outCount: outputCount,
    circuit: circuit.circuit,
    name: name,
    points: circuit.points,
  };
}

function getCircuit(rawData) {
  let ob = rawData.connections;
  let gate = rawData.gates;
  let circuit = [];
  let points = { input: [[]], output: [] };
  //creating all gates
  gate.forEach((g) => circuit.push(createGate(g)));

  circuit.forEach((gt, index) => {
    //setting output points
    ob[index].output.forEach((con, i) =>
      con.forEach((line) => {
        if (line.length == 2) {
          let ind =
            gt.output[i].connections.push(new connectionLine(gt.output[i])) - 1;
          circuit[line[0]].input[line[1]].connect(
            gt.output[i].connections[ind]
          );
        } else points.output[line[0]] = gt.output[i];
      })
    );
    //setting input points
    ob[index].input.forEach((inp, i) => {
      if (inp != null) {
        if (!points.input[inp]) points.input[inp] = [];
        points.input[inp].push(gt.input[i]);
      }
    });
  });
  return { circuit: circuit, points: points };
}

function createGate(name, x = 0, y = 0) {
  switch (name) {
    case "AND":
      return new AND(x, y, defaultGateInputCount);
    case "OR":
      return new OR(x, y, defaultGateInputCount);
    case "NOT":
      return new NOT(x, y);
    case "NAND":
      return new NAND(x, y, defaultGateInputCount);
    case "NOR":
      return new NOR(x, y, defaultGateInputCount);
    case "XOR":
      return new XOR(x, y, defaultGateInputCount);
    default:
      gateData = getGateData(name);
      return new customGate(
        x,
        y,
        gateData.inCount,
        gateData.outCount,
        gateData.circuit,
        gateData.name,
        gateData.points
      );
  }
}

function addCustomGate() {
  let isAlert = false;
  for (let i = 0; i < INPUTBOXES.length; i++) {
    if (!INPUTBOXES[i].connection.connections[0]) isAlert = true;
  }
  if (!isAlert)
    for (let i = 0; i < OUTPUTBOXES.length; i++) {
      if (!OUTPUTBOXES[i].connection.connection) isAlert = true;
    }
  if (isAlert) alert("Some Input/Output connections are empty");
  else getRawData();
}

function getRawData() {
  let name = prompt("Name");
  if (name == "") {
    alert("Name is empty");
    getRawData();
    return;
  } else if (name == null) return;
  console.log(name);
  let gates = GATES.map((g) => g.name);
  let rawData = { gates: gates, connections: [] };

  GATES.forEach((gt) => {
    let input = [];
    let output = [];
    gt.input.forEach((inp) => {
      if (!inp.connection) return;
      let parent = inp.connection.start.parent;
      if (parent.isGate) input.push(null);
      else input.push(parent.index);
    });
    gt.output.forEach((out) => {
      let conList = [];
      out.connections.forEach((con) => {
        let parent = con.end.parent;
        if (parent.isGate) {
          let gateIndex = GATES.indexOf(parent.isGate);
          conList.push([gateIndex, parent.index]);
        } else conList.push([parent.index]);
      });
      output.push(conList);
    });
    rawData.connections.push({ input: input, output: output });
  });
  //saving gate data in localstorage
  localStorage.setItem(name, JSON.stringify(rawData));
  storedGates.push(name);

  createGateBtn(name);
  //clearing
  GATES = [];
  connectionPoints = { input: [], output: [] };
  INPUTBOXES = [];
  OUTPUTBOXES = [];
  createBoolBox();
}

function deleteGate(gate) {
  //disconnect input and output connections
  [...gate.input, ...gate.output].forEach((con) => con.disconnect());
  //remove input connection points from input array
  for (let i = 0; i < gate.inputCount; i++)
    remove(gate.input[i], connectionPoints.input);
  //remove output connection points from output array
  for (let i = 0; i < gate.outputCount; i++)
    remove(gate.output[i], connectionPoints.output);
  //remove gate from array
  remove(gate, GATES);
}

main();

// 3/8/2022
// Aswin-Koroth
