function addToStorage(name, rawData) {
  let storedGates = localStorage.gates ? JSON.parse(localStorage.gates) : {};
  storedGates[name] = rawData;
  localStorage.setItem("gates", JSON.stringify(storedGates));
}

function loadGates() {
  GATELIST.forEach((gate) => addToStorage(gate.name, gate));
}

const GATELIST = [
  {
    name: "ADDER",
    gates: ["XOR", "XOR", "AND", "OR", "AND"],
    connections: [
      {
        input: [0, 1],
        output: [
          [
            [1, 0],
            [2, 0],
          ],
        ],
      },
      { input: [null, 2], output: [[[0]]] },
      { input: [null, 2], output: [[[3, 0]]] },
      { input: [null, null], output: [[[1]]] },
      { input: [1, 0], output: [[[3, 1]]] },
    ],
    label: { input: ["INPUT 1", "INPUT 2", "CARRY"], output: ["SUM", "CARRY"] },
  },

  {
    name: "4-BIT ADDER",
    gates: ["ADDER", "ADDER", "ADDER", "ADDER"],
    connections: [
      { input: [0, 4, null], output: [[[0]], [[4]]] },
      { input: [1, 5, null], output: [[[1]], [[0, 2]]] },
      { input: [2, 6, null], output: [[[2]], [[1, 2]]] },
      { input: [3, 7, 8], output: [[[3]], [[2, 2]]] },
    ],
    label: {
      input: [
        "BIT 3",
        "BIT 2",
        "BIT 1",
        "BIT 0",
        "BIT 3",
        "BIT 2",
        "BIT 1",
        "BIT 0",
        "CARRY",
      ],
      output: ["BIT 3", "BIT 2", "BIT 1", "BIT 0", "CARRY"],
    },
  },

  {
    name: "ALU",
    gates: [
      "XOR",
      "XOR",
      "XOR",
      "XOR",
      "4-BIT ADDER",
      "NOT",
      "NOT",
      "NOT",
      "NOT",
      "AND",
      "AND",
      "AND",
    ],
    connections: [
      { input: [4, 8], output: [[[4, 4]]] },
      { input: [5, 8], output: [[[4, 5]]] },
      { input: [6, 8], output: [[[4, 6]]] },
      { input: [7, 8], output: [[[4, 7]]] },
      {
        input: [0, 1, 2, 3, null, null, null, null, 8],
        output: [
          [[0], [7, 0], [5]],
          [[1], [8, 0]],
          [[2], [5, 0]],
          [[3], [6, 0]],
          [[4]],
        ],
      },
      { input: [null], output: [[[9, 1]]] },
      { input: [null], output: [[[10, 1]]] },
      { input: [null], output: [[[11, 0]]] },
      { input: [null], output: [[[11, 1]]] },
      { input: [null, null], output: [[[10, 0]]] },
      { input: [null, null], output: [[[6]]] },
      { input: [null, null], output: [[[9, 0]]] },
    ],
    label: {
      input: [
        "BIT 3",
        "BIT 2",
        "BIT 1",
        "BIT 0",
        "BIT 3",
        "BIT 2",
        "BIT 1",
        "BIT 0",
        "SUBTRACT",
      ],
      output: ["BIT 3", "BIT 2", "BIT 1", "BIT 0", "CARRY", "NEGATIVE", "ZERO"],
    },
  },

  {
    name: "SR LATCH",
    gates: ["AND", "OR", "NOT"],
    connections: [
      { input: [null, null], output: [[[0], [1, 0]]] },
      { input: [null, 0], output: [[[0, 0]]] },
      { input: [1], output: [[[0, 1]]] },
    ],
    label: { input: ["SET", "RESET"], output: ["DATA"] },
  },

  {
    name: "D LATCH",
    gates: ["NOR", "NOR", "AND", "AND", "NOT"],
    connections: [
      { input: [null, null], output: [[[1, 0]]] },
      { input: [null, null], output: [[[0, 1], [0]]] },
      { input: [0, 1], output: [[[0, 0]]] },
      { input: [1, null], output: [[[1, 1]]] },
      { input: [0], output: [[[3, 1]]] },
    ],
    label: { input: ["DATA", "STORE"], output: ["DATA"] },
  },

  {
    name: "REGISTER",
    gates: ["D LATCH", "D LATCH", "D LATCH", "D LATCH"],
    connections: [
      { input: [1, 4], output: [[[1]]] },
      { input: [0, 4], output: [[[0]]] },
      { input: [2, 4], output: [[[2]]] },
      { input: [3, 4], output: [[[3]]] },
    ],
    label: {
      input: ["DATA 3", "DATA 2", "DATA 1", "DATA 0", "STORE"],
      output: ["DATA 3", "DATA 2", "DATA 1", "DATA 0"],
    },
  },

  {
    name: "D FLIP-FLOP",
    gates: ["D LATCH", "D LATCH", "NOT"],
    connections: [
      { input: [0, null], output: [[[1, 0]]] },
      { input: [null, 1], output: [[[0]]] },
      { input: [1], output: [[[0, 1]]] },
    ],
    label: { input: ["DATA", "CLOCK"], output: ["DATA"] },
  },

  {
    name: "1-BIT REGISTER",
    gates: ["D FLIP-FLOP", "AND", "AND", "NOT", "OR"],
    connections: [
      { input: [null, 2], output: [[[0], [2, 0]]] },
      { input: [1, 0], output: [[[4, 1]]] },
      { input: [null, null], output: [[[4, 0]]] },
      { input: [1], output: [[[2, 1]]] },
      { input: [null, null], output: [[[0, 0]]] },
    ],
    label: { input: ["DATA", "STORE", "CLOCK"], output: ["DATA"] },
  },
  {
    name: "4-BIT REGISTER",
    gates: [
      "1-BIT REGISTER",
      "1-BIT REGISTER",
      "1-BIT REGISTER",
      "1-BIT REGISTER",
    ],
    connections: [
      { input: [0, 4, 5], output: [[[0]]] },
      { input: [1, 4, 5], output: [[[1]]] },
      { input: [2, 4, 5], output: [[[2]]] },
      { input: [3, 4, 5], output: [[[3]]] },
    ],
    label: {
      input: ["DATA 3", "DATA 2", "DATA 1", "DATA 0", "STORE", "CLOCK"],
      output: ["DATA 3", "DATA 2", "DATA 1", "DATA 0"],
    },
  },
];

let a =
  '{"OR_4INP":{"gates":["OR","OR","OR"],"connections":[{"input":[2,3],"output":[[[2,1]]]},{"input":[0,1],"output":[[[2,0]]]},{"input":[null,null],"output":[[[0]]]}],"label":{"input":["OUT 0","OUT 1","OUT 2","OUT 3"],"output":["INP 0"]}},"AND_4INP":{"gates":["AND","AND","AND"],"connections":[{"input":[0,1],"output":[[[2,0]]]},{"input":[2,2],"output":[[[2,1]]]},{"input":[null,null],"output":[[[0]]]}],"label":{"input":["OUT 0","OUT 1","OUT 2"],"output":["INP 0"]}},"OR_5INP":{"gates":["OR","OR","OR","OR"],"connections":[{"input":[0,1],"output":[[[2,0]]]},{"input":[2,3],"output":[[[2,1]]]},{"input":[null,null],"output":[[[3,0]]]},{"input":[null,4],"output":[[[0]]]}],"label":{"input":["OUT 0","OUT 1","OUT 2","OUT 3","OUT 4"],"output":["INP 0"]}},"7-SEGMENT":{"gates":["NOT","NOT","NOT","AND","AND","AND","AND","AND","AND","OR_4INP","OR_4INP","OR_4INP","OR_5INP","OR","OR_4INP","OR_4INP","AND","AND","AND"],"connections":[{"input":[1],"output":[[[3,0],[8,0],[10,1]]]},{"input":[2],"output":[[[6,0],[18,1],[11,1]]]},{"input":[3],"output":[[[3,1],[6,1],[7,1],[16,1]]]},{"input":[null,null],"output":[[[9,1],[12,1],[13,1]]]},{"input":[2,3],"output":[[[10,0]]]},{"input":[1,3],"output":[[[9,0]]]},{"input":[null,null],"output":[[[10,2],[15,0]]]},{"input":[2,null],"output":[[[12,2],[13,0],[14,0]]]},{"input":[null,2],"output":[[[12,3],[14,3]]]},{"input":[null,null,0,2],"output":[[[0]]]},{"input":[null,null,null],"output":[[[1]]]},{"input":[1,null,3],"output":[[[2]]]},{"input":[0,null,null,null,null],"output":[[[3]]]},{"input":[null,null],"output":[[[4]]]},{"input":[null,null,0,null],"output":[[[6]]]},{"input":[null,null,null,0],"output":[[[5]]]},{"input":[1,null],"output":[[[15,1]]]},{"input":[3,null],"output":[[[12,4]]]},{"input":[1,null],"output":[[[17,1],[15,2],[14,1]]]}],"label":{"input":["OUT 0","OUT 1","OUT 2","OUT 3"],"output":["INP 0","INP 1","INP 2","INP 3","INP 4","INP 5","INP 6"]}}}';
