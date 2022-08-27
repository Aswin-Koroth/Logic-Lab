//LOGIC SIM V1.0
let canvas = document.querySelector(".canvas"),
  ctx = canvas.getContext("2d");

let gateButtons = document.querySelectorAll(".gate");
let dltButton = document.querySelector(".dlt");
let currentSelection = null;
let lastSelected = null; //temp delete variable
let currentInpGate = { gate: null, con: null };
let currentInpBox = { box: null, con: null };
let snapToGate = null;
let snapToBox = null;

function main() {
  updateCanvas();
  setEventListeners();
}

function updateBoxes(Boxes) {
  for (let i = 0; i < Boxes.length; i++) {
    let y = lerp(0, window.innerHeight - 100, (i + 1) / (Boxes.length + 1));
    Boxes[i].update(ctx, y);
  }
}

function updateCanvas() {
  canvas.width = window.innerWidth - 5;
  canvas.height = window.innerHeight - 150;
  connections.forEach((con) => {
    con.update(ctx);
  });
  updateBoxes(inputBoxes);
  updateBoxes(outputBoxes);
  gates.forEach((gate) => {
    gate.update(ctx);
  });
  requestAnimationFrame(updateCanvas);
}

function setEventListeners() {
  canvas.addEventListener("contextmenu", onRClick);
  canvas.addEventListener("click", onClick);
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseup", onMouseUp);
  gateButtons.forEach((button) => {
    button.addEventListener("mousedown", spawn);
  });
  dltButton.addEventListener("click", deleteGate);
}

function onClick(event) {
  inputBoxes.forEach((input) => {
    isIn = isInCircle(event, input.x, input.y, input.radius);
    if (isIn) {
      input.output = !input.output;
    }
  });
}

function onRClick(event) {
  for (let i = gates.length - 1; i >= 0; i--) {
    for (let j = 0; j < gates[i].inputs.length; j++) {
      let point = gates[i].inPoints[j];
      let isIn = isInCircle(event, point.x, point.y, point.radius);
      if (isIn) {
        let con = gates[i].inputCon[j];
        if (con.startGate.outputCon != undefined) {
          remove(con, con.startGate.outputCon);
        } else {
          remove(con, con.startGate.connection);
        }
        remove(con, connections);
        delete gates[i].inputCon[j];
      }
    }
  }
  for (let i = outputBoxes.length - 1; i >= 0; i--) {
    let point = outputBoxes[i].conPoint;
    let isIn = isInCircle(event, point.x, point.y, point.radius);
    if (isIn) {
      let con = outputBoxes[i].connection[0];
      remove(con, con.startGate.outputCon);
      remove(con, connections);
      outputBoxes[i].connection = [];
    }
  }
}

function onMouseDown(event) {
  currentInpGate.gate = getCurrentConnection(event, true);
  currentInpBox.box = getCurrentConnection(event, false);
  if (currentInpGate.gate != null) {
    currentInpGate.con =
      connections.push(new Connection(currentInpGate.gate, true)) - 1;
  } else {
    tempSelection = getSelectedGate(event);
    lastSelected = tempSelection; //temp delete variable
    if (tempSelection != null) {
      remove(tempSelection, gates);
      gates.push(tempSelection);
      tempSelection.offset.x = event.clientX - tempSelection.x;
      tempSelection.offset.y = event.clientY - tempSelection.y;
    }
  }

  if (currentInpBox.box != null) {
    currentInpBox.con =
      connections.push(new Connection(currentInpBox.box, false)) - 1;
  }
}

function onMouseMove(event) {
  snapToGate = getCurrentConnection(event, true);
  snapToBox = getCurrentConnection(event, false);
  if (currentInpGate.gate != null || currentInpBox.box != null) {
    let conIndex = Boolean(currentInpGate.gate)
      ? currentInpGate.con
      : currentInpBox.con;
    if (snapToGate != null) {
      connections[conIndex].end.x =
        snapToGate.gate.inPoints[snapToGate.index].x;
      connections[conIndex].end.y =
        snapToGate.gate.inPoints[snapToGate.index].y;
    } else if (snapToBox != null) {
      connections[conIndex].end.x = snapToBox.box.conPoint.x;
      connections[conIndex].end.y = snapToBox.box.conPoint.y;
    } else {
      connections[conIndex].end.x = event.clientX;
      connections[conIndex].end.y = event.clientY;
    }
  } else {
    if (tempSelection != null) {
      tempSelection.x = event.clientX - tempSelection.offset.x;
      tempSelection.y = event.clientY - tempSelection.offset.y;
    }
  }
}

function onMouseUp() {
  let isStartGate = Boolean(currentInpGate.gate) ? true : false;
  let isEndGate = Boolean(snapToGate) ? true : false;
  let conIndex = isStartGate ? currentInpGate.con : currentInpBox.con;
  if (snapToGate == null && snapToBox == null) {
    if (currentInpGate.gate != null || currentInpBox.box != null) {
      connections.splice(conIndex, 1);
    }
  } else {
    if (isEndGate) {
      connections[conIndex].endGate = snapToGate.gate;
      connections[conIndex].endIndex = snapToGate.index;
      snapToGate.gate.inputCon[snapToGate.index] = connections[conIndex];
    } else {
      connections[conIndex].endGate = snapToBox.box;
      connections[conIndex].endIndex = 0;
      snapToBox.box.connection.push(connections[conIndex]);
    }
    if (isStartGate) {
      currentInpGate.gate.outputCon.push(connections[conIndex]);
    } else {
      currentInpBox.box.connection.push(connections[conIndex]);
    }
    connections[conIndex].isGate.end = isEndGate;
    snapToGate = null;
    snapToBox = null;
  }
  currentInpGate.gate = null;
  currentInpBox.box = null;
  tempSelection = null;
}

function deleteGate() {
  let gate = gates.pop();
  if (gate != undefined) {
    gate.outputCon.forEach((con) => {
      con.endGate.inputCon = {};
      con.endGate.connection = [];
      remove(con, connections);
    });
    for (let i = 0; i < gate.inputs.length; i++) {
      remove(gate.inputCon[i], connections);
    }
  }
}

function getColor(bool) {
  return bool ? "#8edf34" : "#47555E"; //true:false
}

function isInCircle(event, circleX, circleY, radius) {
  let x = event.clientX - circleX;
  let y = event.clientY - circleY;
  hyp = Math.hypot(x, y);
  return hyp <= radius;
}

function getCurrentConnection(event, isGate) {
  if (isGate) {
    //Gate Snapping
    if (currentInpGate.gate != null || currentInpBox.box != null) {
      for (let i = gates.length - 1; i >= 0; i--) {
        for (let j = 0; j < gates[i].inputs.length; j++) {
          if (gates[i].inputCon[j] != undefined) {
            continue;
          }
          let isIn = isInCircle(
            event,
            gates[i].inPoints[j].x,
            gates[i].inPoints[j].y,
            gates[i].inPoints[j].radius + 5
          ); //temp +5
          if (isIn) {
            return { gate: gates[i], index: j };
          }
        }
      }
    }
    //Gate Start Detect
    else {
      for (let i = gates.length - 1; i >= 0; i--) {
        let isIn = isInCircle(
          event,
          gates[i].outPoint.x,
          gates[i].outPoint.y,
          gates[i].outPoint.radius
        );
        if (isIn) {
          return gates[i];
        }
      }
    }
  } else {
    //Box Start Detect
    if (currentInpBox.box == null && currentInpGate.gate == null) {
      for (let i = inputBoxes.length - 1; i >= 0; i--) {
        let isIn = isInCircle(
          event,
          inputBoxes[i].conPoint.x,
          inputBoxes[i].conPoint.y,
          inputBoxes[i].conPoint.radius
        );
        if (isIn) return inputBoxes[i];
      }
    }
    //Box Snapping
    else {
      for (let i = outputBoxes.length - 1; i >= 0; i--) {
        if (outputBoxes[i].connection.length != 0) {
          continue;
        }
        let isIn = isInCircle(
          event,
          outputBoxes[i].conPoint.x,
          outputBoxes[i].conPoint.y,
          outputBoxes[i].conPoint.radius + 5
        ); //temp 5
        if (isIn) return { box: outputBoxes[i] };
      }
    }
  }
  return null;
}

function spawn(event) {
  let button = event.target;
  let fun = button.getAttribute("data-name");
  let index = gates.push(new Gate(event.pageX, event.pageY, fun));
  let gate = gates[index - 1];
  tempSelection = gate;
}

function getSelectedGate(event) {
  for (let i = gates.length - 1; i >= 0; i--) {
    if (
      event.clientX > gates[i].x &&
      event.clientX < gates[i].x + gates[i].width &&
      event.clientY > gates[i].y &&
      event.clientY < gates[i].y + gates[i].height
    )
      return gates[i];
  }
  return null;
}

function addBox(boxType, canvas) {
  let x;
  let y;

  if (boxType == "inputBox") x = 40;
  else if (boxType == "outputBox") x = canvas.width - 40;

  let box = new boolBox(boxType, x, 40);
  return box;
}

var gates = [];
var connections = [];
var inputBoxes = [];
var outputBoxes = [];
inputBoxes.push(addBox("inputBox", canvas));
inputBoxes.push(addBox("inputBox", canvas));
inputBoxes.push(addBox("inputBox", canvas));
outputBoxes.push(addBox("outputBox", canvas));
outputBoxes.push(addBox("outputBox", canvas));

main();

// 26/7/2022
// Aswin-Koroth
