//LOGIC SIM V2.0
let canvas = document.querySelector(".canvas"),
  ctx = canvas.getContext("2d");

let gateButtons = document.querySelectorAll(".gate");
let addButton = document.querySelectorAll(".add");
let removeButton = document.querySelectorAll(".remove");

let tempSelection = null;
let currentConLineIndex = null;
let currentSelectedGate = null;
let snapable = false;

let inputBoxCount = 2;
let outputBoxCount = 1;
let maxBoxCount = 9;
let minBoxCount = 1;

let GATES = [];
let INPUTBOXES = [];
let OUTPUTBOXES = [];

let rawData = {};
let customGateData = {};

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
    if (INPUTBOXES[i] === undefined) INPUTBOXES.push(new inputBox(x, y, i));
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
    if (OUTPUTBOXES[i] === undefined) OUTPUTBOXES.push(new outputBox(x, y, i));
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
  let div = document.querySelector(".custom");
  let button = document.createElement("div");
  button.classList.add("btn", "gate");
  button.setAttribute("data-name", label);
  button.innerText = label;

  button.addEventListener("mousedown", spawn);
  div.appendChild(button);
}

function spawn(event) {
  //redesign
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
    default:
      gateData = getGateData(fun);
      index =
        GATES.push(
          new customGate(
            event.pageX,
            event.pageY,
            gateData.inCount,
            gateData.outCount,
            gateData.circuit,
            gateData.name,
            gateData.points
          )
        ) - 1;
  }
  currentSelectedGate = tempSelection = GATES[index];
}
var a = null;
function getGateData(name) {
  let circuit = getCircuit(rawData[name]);
  a = circuit;
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

// var list = ["NOT", "OR", "OR"];
// var obj = [
//   { input: [0], output: [[[2, 0]]] },
//   { input: [1, 2], output: [[[2, 1]]] },
//   { input: [null], output: [[[0]]] },
// ];

// var constomData = {
//   gates: ["OR", "NOT"],
//   connections: [
//     { input: [0, 1], output: [[[1, 0]]] },
//     { input: [null], output: [[[0]]] },
//   ],
// };

function getCircuit(rawData) {
  //optimize - 1 forEach
  let ob = rawData.connections;
  let gate = rawData.gates;
  let circuit = [];
  let points = { input: [[]], output: [] };
  gate.forEach((g, index) => {
    gt = createGate(g.name);
    ob[index].output.forEach((con, i) => {
      con.forEach((line) => {
        if (line.length == 1) {
        } //set output box
        else {
          gt.output[i].connections.push(new connectionLine(gt.output[i]));
        }
      });
    });
    circuit.push(gt);
  });

  circuit.forEach((gt, index) => {
    ob[index].output.forEach((con, i) => {
      con.forEach((line, j) => {
        if (line.length == 2) {
          circuit[line[0]].input[line[1]].connect(gt.output[i].connections[j]);
        } else {
          console.log(gt, "dddd", line[0]);
          points.output[line[0]] = gt.output[i];
        }
      });
    });
    ob[index].input.forEach((inp, i) => {
      if (inp != null) {
        if (!points.input[inp]) points.input[inp] = [];
        points.input[inp].push(gt.input[i]);
      }
    });
  });
  return { circuit: circuit, points: points };
}

function createGate(name, x = 100, y = 100) {
  switch (name) {
    case "AND":
      return new AND(x, y);
      break;
    case "OR":
      return new OR(x, y);
      break;
    case "NOT":
      return new NOT(x, y);
      break;
    case "NAND":
      return new NAND(x, y);
      break;
    case "NOR":
      return new NOR(x, y);
      break;
    case "XOR":
      return new XOR(x, y);
      break;
  }
}

function getRawData() {
  let name = "HELLO"; //name get temp
  rawData[name] = { gates: [], connections: [] };
  rawData[name].gates = [...GATES];

  GATES.forEach((gt, index) => {
    let input = [];
    let output = [];
    gt.input.forEach((inp) => {
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
    rawData[name].connections.push({ input: input, output: output });
  });

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
