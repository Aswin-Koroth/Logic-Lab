const DATA = [
  {
    name: "BIT1",
    data: [
      [0, 0],
      [1, 1],
    ],
  },
  {
    name: "BIT2",
    data: [
      [0, 1],
      [1, 0],
    ],
  },
  {
    name: "CARRY",
    data: [
      [2, 1],
      [3, 1],
    ],
  },
];

const clockInputCon = [
  [1, 1],
  [2, 0],
];
const clockUpdateTime = 1000;
var output = { clock: false };
var currentindex = {};
var clickedList = [];
var input = [];
var clockInterval;

function setBtnInput(event) {
  btn = event.srcElement;
  if (btn.classList.contains("disable")) {
    return;
  }
  let index = btn.getAttribute("data-index");
  let data = DATA[index].data;
  isClicked = toggleButton(btn);
  let bool = isClicked ? false : true;
  createInputObject(data, bool);
  updateInput(btn, bool);
}

function updateInput(button, bool) {
  if (bool) {
    button.innerText = 1;
    button.classList.add("on");
  } else {
    button.innerText = 0;
    button.classList.remove("on");
  }
}

function updateOutput(gate_id, outId) {
  let result = document.getElementById(outId);
  if (result === null) {
    return;
  }
  if (output[gate_id]) {
    result.parentElement.classList.add("on");
    result.innerText = 1;
  } else {
    result.parentElement.classList.remove("on");
    result.innerText = 0;
  }
}

function createInputObject(data, bool) {
  data.forEach((item) => {
    let id = item[0];
    let index = item[1];
    let isUsed = id in currentindex;
    if (!isUsed) {
      currentindex[id] =
        input.push({ id: id, input: new Array(false, false) }) - 1;
    }
    input[currentindex[id]].input[index] = bool;
    main();
  });
}

function startClock(button) {
  let isClicked = toggleButton(button);
  if (isClicked) {
    clearInterval(clockInterval);
  } else {
    function clock() {
      output["clock"] = !output["clock"];
      updateInput(button, output["clock"]);
      createInputObject(clockInputCon, output["clock"]);
      updateOutput("clock", "out1");
    }
    clockInterval = setInterval(clock, clockUpdateTime);
  }
}

function toggleButton(button) {
  let isClicked = clickedList.includes(button.id);
  isClicked ? remove(button.id, clickedList) : clickedList.push(button.id);
  return isClicked;
}

function createButton(i) {
  button = document.createElement("button");
  button.id = i;
  button.classList.add("btn", "hover");
  button.innerText = 0;
  button.setAttribute("data-index", i);
  button.addEventListener("click", setBtnInput);
  return button;
}

function setupUI() {
  let count = DATA.length;
  let groups = document.querySelectorAll(".group1");
  let group = groups[0];
  for (let i = 0; i < count; i++) {
    button = createButton(i);

    span = document.createElement("span");
    span.innerText = DATA[i].name;

    div = document.createElement("div");
    div.classList.add("g1");

    div.appendChild(span);
    div.appendChild(button);
    group.appendChild(div);
  }
}

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
