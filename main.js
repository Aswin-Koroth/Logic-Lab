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
const maxBoxCount = 14;
const minBoxCount = 1;

let GATES = [];
let INPUTBOXES = [];
let OUTPUTBOXES = [];
let GATEBUTTONSLIST = {
  default: ["AND", "OR", "NOT", "NAND", "NOR", "XOR"],
  custom: [],
};

let canvasLastHeight = window.innerHeight - 100;

function main() {
  setTheme();
  setEventListeners();
  updateCanvas();
  createBoolBox();
  createCustomGateButtons();
}

function updateCanvas() {
  if (canvas.height != canvasLastHeight) {
    canvasLastHeight = canvas.height;
    createBoolBox();
  }
  canvas.width = window.innerWidth - 120;
  canvas.height = window.innerHeight - 100;
  // ctx.fillStyle = "red";
  // ctx.fill();
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
  // [...connectionPoints.input, ...connectionPoints.output].forEach((con) =>
  //   con.drawLabel(ctx)
  // );
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
  let gap = 10;
  //INPUTS
  if (INPUTBOXES[inputBoxCount] !== undefined) {
    INPUTBOXES[inputBoxCount].connection.disconnect();
    remove(INPUTBOXES[inputBoxCount].connection, connectionPoints.output);
    INPUTBOXES.pop();
  }
  for (let i = 0; i < inputBoxCount; i++) {
    let fac =
      canvas.height / 2 -
      (radius + gap / inputBoxCount) -
      (inputBoxCount * radius + gap);
    let x = 40; //distance from edge
    let y = lerp(fac, canvas.height - fac, (i + 1) / (inputBoxCount + 1));
    if (INPUTBOXES[i] === undefined) INPUTBOXES.push(new inputBox(x, y, i));
    else INPUTBOXES[i].position.y = y;
  }
  //OUTPUTS
  if (OUTPUTBOXES[outputBoxCount] !== undefined) {
    OUTPUTBOXES[outputBoxCount].connection.disconnect();
    remove(OUTPUTBOXES[outputBoxCount].connection, connectionPoints.input);
    OUTPUTBOXES.pop();
  }
  for (let i = 0; i < outputBoxCount; i++) {
    let fac =
      canvas.height / 2 -
      (radius + gap / outputBoxCount) -
      (outputBoxCount * radius + gap);
    let x = canvas.width - 40; //distance from edge
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
