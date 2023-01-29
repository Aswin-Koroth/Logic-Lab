//LOGIC SIM V3.0
const canvas = document.querySelector(".canvas"),
  ctx = canvas.getContext("2d");

const root = document.querySelector(":root");
const gateButtons = document.querySelectorAll(".gateBtn");
const addButton = document.querySelectorAll(".add");
const removeButton = document.querySelectorAll(".remove");
const bg = document.querySelector(".bg");

const loadToMemory = true;
let paused = false;

let tempSelection = null;
let currentConLineIndex = null;
let currentSelectedGate = null;
let snapable = false;

let pressedKeys = [];
let keyCodes = {
  control: 17,
  command: 91,
  delete: 46,
  enter: 13,
  plus: 107,
  minus: 109,
};

let gateInputCount = 2;
let inputBoxCount = 2;
let outputBoxCount = 2;
let boxPackingCount = 13; //changes with canvas height
const maxBoxCount = 14;
const minBoxCount = 1;

let GATES = [];
let INPUTBOXES = [];
let OUTPUTBOXES = [];
let GATEBUTTONSLIST = {
  default: ["AND", "OR", "NOT", "NAND", "NOR", "XOR"],
  custom: [],
};

function main() {
  setTheme();
  setEventListeners();
  updateCanvas();
  createBoolBox();
  createCustomGateButtons();
}

function updateCanvas() {
  canvas.width = window.innerWidth - 120;
  canvas.height = window.innerHeight - 100;
  ctx.fillStyle = "red";
  ctx.fill();
  if (GATES.length == 0) {
    drawHelp(ctx);
  }
  //boolbox
  [...INPUTBOXES, ...OUTPUTBOXES].forEach((box) => box.update(ctx));
  //Gates
  GATES.forEach((gate) => {
    if (gate.markedForDelete) {
      deleteGate(gate);
      return;
    }
    gate.update(ctx, gate === currentSelectedGate);
  });
  //labels
  [...connectionPoints.input, ...connectionPoints.output].forEach((con) =>
    con.drawLabel(ctx)
  );
  requestAnimationFrame(updateCanvas);
}

function setTheme() {
  canvas.style.backgroundColor = Theme.canvas;
  document.body.style.backgroundColor = Theme.body;
  root.style.setProperty("--addRemove-color", Theme.addRemove);
}

function createCustomGateButtons() {
  if (loadToMemory) loadGates();
  if (localStorage.gates !== undefined) {
    let gateData = JSON.parse(localStorage.gates);
    Object.keys(gateData).forEach((gate) => createGateBtn(gate));
  }
}

function createBoolBox() {
  let radius = boolBox.radius;
  boxPackingCount = Math.round(canvas.height / (2 * radius) - 1);
  //INPUTS
  if (INPUTBOXES[inputBoxCount] !== undefined) {
    INPUTBOXES[inputBoxCount].connection.disconnect();
    INPUTBOXES.pop();
  }
  for (let i = 0; i < inputBoxCount; i++) {
    let fac = (boxPackingCount - inputBoxCount) * radius;
    let x = 40;
    let y = lerp(fac, canvas.height - fac, (i + 1) / (inputBoxCount + 1));
    if (INPUTBOXES[i] === undefined) INPUTBOXES.push(new inputBox(x, y, i));
    else INPUTBOXES[i].position.y = y;
  }
  //OUTPUTS
  if (OUTPUTBOXES[outputBoxCount] !== undefined) {
    OUTPUTBOXES[outputBoxCount].connection.disconnect();
    OUTPUTBOXES.pop();
  }
  for (let i = 0; i < outputBoxCount; i++) {
    let fac = (boxPackingCount - outputBoxCount) * radius;
    let x = canvas.width - 40;
    let y = lerp(fac, canvas.height - fac, (i + 1) / (outputBoxCount + 1));
    if (OUTPUTBOXES[i] === undefined) OUTPUTBOXES.push(new outputBox(x, y, i));
    else OUTPUTBOXES[i].position.y = y;
  }
}

function drawHelp(context) {
  let drawColor = "#666666";
  //Text
  context.fillStyle = drawColor;
  context.font = "400 1.3em Montserrat";
  context.textBaseline = "middle";
  context.textAlign = "center";

  context.fillText("DRAG AND DROP", canvas.width / 2, canvas.height / 2);
  //arrow and line
  let x = canvas.width / 2;
  let y = canvas.height / 2 + canvas.height / 7;
  let arrowLength = canvas.height - 60 - y;
  drawArrow(context, x, y, x, y + arrowLength, drawColor);
  //Line
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(80, canvas.height - 20);
  context.lineTo(canvas.width - 80, canvas.height - 20);
  context.stroke();
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
  //canvas
  canvas.addEventListener("contextmenu", onRClick);
  canvas.addEventListener("click", onClick);
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mousemove", onMouseMove);

  addEventListener("mouseup", onMouseUp);
  //keyboard
  addEventListener("keydown", keyPressed);
  addEventListener("keyup", keyRelease);
  //buttons
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

function keyPressed(event) {
  if (!pressedKeys.includes(event.keyCode)) pressedKeys.push(event.keyCode);
}

function keyRelease(event) {
  switch (event.keyCode) {
    case keyCodes.plus:
      handleGateInputs(0, currentSelectedGate);
      break;
    case keyCodes.minus:
      handleGateInputs(1, currentSelectedGate);
      break;
    case keyCodes.delete:
      deleteGate(currentSelectedGate);
      break;
  }
  remove(event.keyCode, pressedKeys);
}

function onRClick(event) {
  let point = getCurrentSelection(event);
  if (point instanceof connectionPoint) if (point != null) point.disconnect();
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
      box.toggle();
    }
  }
}
function onMouseDown(event) {
  pressedKeys.push(event.button); //adding mouse button to list
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
  // root.style.setProperty("--cursor", "grabbing"); ////////////
}

function onMouseMove(event) {
  if (pressedKeys.includes(0)) {
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
  // show label on hover
  [...connectionPoints.input, ...connectionPoints.output].forEach((con) => {
    let isIn = isInCircle(
      event,
      con.position.x,
      con.position.y,
      connectionPoint.radius
    );
    if (
      isIn &&
      (pressedKeys.includes(keyCodes.control) ||
        pressedKeys.includes(keyCodes.command))
    ) {
      con.hover = true;
    } else con.hover = false;
  });
}

function onMouseUp(event) {
  if (event.button === 0) {
    if (tempSelection instanceof outputPoint) {
      if (snapable && snapable.connection == null) {
        snapable.connect(tempSelection.connections[currentConLineIndex]);
        snapable = false;
      } else {
        tempSelection.disconnect(currentConLineIndex);
      }
    }
    tempSelection = null;
  }
  remove(event.button, pressedKeys); //removing mouse button from list
  //Mark gates for delete if out of frame
  markForDelete();
  // root.style.setProperty("--cursor", "grab"); ///////////
}

function addBox(event) {
  let button = event.target;
  let type = button.getAttribute("data-type");
  if (type == 0 && inputBoxCount < maxBoxCount) inputBoxCount++;
  else if (type == 1 && outputBoxCount < maxBoxCount) outputBoxCount++;
  createBoolBox();
}

function removeBox(event) {
  let button = event.target;
  let type = button.getAttribute("data-type");
  if (type == 0 && inputBoxCount > minBoxCount) inputBoxCount--;
  else if (type == 1 && outputBoxCount > minBoxCount) outputBoxCount--;
  createBoolBox();
}

function createGateBtn(label) {
  let parent = document.querySelector(".gates");
  let div = document.querySelector(".custom");
  if (div == null) {
    div = document.createElement("div");
    div.classList.add("group", "custom");
  }
  let button = document.createElement("div");
  button.classList.add("btn", "gateBtn");
  button.setAttribute("data-name", label);
  button.innerText = label;

  button.addEventListener("mousedown", spawn);
  div.appendChild(button);
  parent.appendChild(div);
  GATEBUTTONSLIST.custom.push(label);
}

function spawn(event) {
  pressedKeys.push(event.button);
  let button = event.target;
  let fun = button.getAttribute("data-name");
  let index = GATES.push(createGate(fun, event.pageX, event.pageY)) - 1;
  currentSelectedGate = tempSelection = GATES[index];
  // root.style.setProperty("--cursor", "grabbing"); ////////////
}

function getGateData(name) {
  let rawData = JSON.parse(localStorage.gates)[name];
  let conLabel = rawData.label;
  let circuit = getCircuit(rawData);
  let inputCount = circuit.points.input.length;
  let outputCount = circuit.points.output.length;

  return {
    inCount: inputCount,
    outCount: outputCount,
    conLabel: conLabel,
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
  gate.forEach((g, index) => {
    let inputCount = ob[index].input.length;
    circuit.push(createGate(g, 0, 0, inputCount));
  });

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

function createGate(name, x = 0, y = 0, inputCount = gateInputCount) {
  inputCount = Math.max(2, inputCount);
  switch (name) {
    case "AND":
      return new AND(x, y, inputCount);
    case "OR":
      return new OR(x, y, inputCount);
    case "NOT":
      return new NOT(x, y);
    case "NAND":
      return new NAND(x, y, inputCount);
    case "NOR":
      return new NOR(x, y, inputCount);
    case "XOR":
      return new XOR(x, y, inputCount);
    default:
      gateData = getGateData(name);
      return new customGate(
        x,
        y,
        gateData.inCount,
        gateData.outCount,
        gateData.circuit,
        gateData.name,
        gateData.points,
        gateData.conLabel
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
  if (isAlert) showAlert("Some Input/Output connections are empty.");
  else showPrompt("TYPE NAME", saveGateGroup);
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

function showPrompt(prompt, func) {
  const promptBox = document.querySelector(".promptbox");
  const titleText = document.querySelector(".promptbox .titlebar span");
  const cross = document.querySelector(".promptbox .cross");
  const textBox = document.querySelector(".text");
  const okBtn = document.querySelector(".okbtn");
  const warningBox = document.querySelector(".warning");

  togglePause();
  titleText.innerText = prompt;
  promptBox.style.display = "block";
  textBox.focus();

  cross.addEventListener(
    "click",
    () => {
      textBox.value = "";
      promptBox.style.display = "none";
      warningBox.innerText = "";
      togglePause();
    },
    { once: true }
  );

  okBtn.addEventListener("click", () => {
    let name = textBox.value.trim();
    if (name == "") warningBox.innerText = "Text field is empty.";
    else if (
      [...GATEBUTTONSLIST.custom, GATEBUTTONSLIST.default].includes(name)
    )
      warningBox.innerText = "Name already exists.";
    else {
      cross.click();
      func(name);
    }
  });
  textBox.addEventListener("keydown", (event) => {
    if (event.key == "Enter") okBtn.click();
  });
}

function togglePause() {
  if (paused) bg.style.display = "none";
  else bg.style.display = "block";
  paused = !paused;
}

function saveGateGroup(name) {
  let gates = GATES.map((g) => g.name);
  let rawData = {
    gates: gates,
    connections: [],
    label: { input: [], output: [] },
  };

  GATES.forEach((gt) => {
    let input = [];
    let output = [];
    gt.input.forEach((inp) => {
      if (!inp.connection) {
        input.push(null);
        return;
      }
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
  //setting input labels
  INPUTBOXES.forEach((box) =>
    rawData.label.input.push(box.connection.label.text)
  );
  //setting output labels
  OUTPUTBOXES.forEach((box) =>
    rawData.label.output.push(box.connection.label.text)
  );
  //saving gate data in localstorage
  addToStorage(name, rawData);

  createGateBtn(name);
  //clearing
  GATES = [];
  connectionPoints = { input: [], output: [] };
  INPUTBOXES = [];
  OUTPUTBOXES = [];
  createBoolBox();
}

function deleteGate(gate) {
  if (gate === null) return;
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
  currentSelectedGate = null;
}

function handleGateInputs(mode, gate) {
  //mode = 0 => increment
  //mode = 1 => decrement
  if (gate != null) {
    if (mode == 0) gate.incrementInputCount();
    else if (mode == 1) gate.decrementInputCount();
  }
}

main();

// 3/8/2022
// Aswin-Koroth
