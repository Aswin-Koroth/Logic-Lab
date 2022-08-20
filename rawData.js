function loadGates() {
  GATELIST.forEach((gate) =>
    localStorage.setItem(gate.name, JSON.stringify(gate))
  );
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
  },

  {
    name: "4BIT ADDER",
    gates: ["ADDER", "ADDER", "ADDER", "ADDER"],
    connections: [
      { input: [0, 4, null], output: [[[0]], [[4]]] },
      { input: [1, 5, null], output: [[[1]], [[0, 2]]] },
      { input: [2, 6, null], output: [[[2]], [[1, 2]]] },
      { input: [3, 7, 8], output: [[[3]], [[2, 2]]] },
    ],
  },

  {
    name: "ALU",
    gates: [
      "XOR",
      "XOR",
      "XOR",
      "XOR",
      "4BIT ADDER",
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
  },

  {
    name: "SR LATCH",
    gates: ["AND", "OR", "NOT"],
    connections: [
      { input: [null, null], output: [[[0], [1, 0]]] },
      { input: [null, 0], output: [[[0, 0]]] },
      { input: [1], output: [[[0, 1]]] },
    ],
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
  },

  {
    name: "D FLIP-FLOP",
    gates: ["D LATCH", "D LATCH", "NOT"],
    connections: [
      { input: [0, null], output: [[[1, 0]]] },
      { input: [null, 1], output: [[[0]]] },
      { input: [1], output: [[[0, 1]]] },
    ],
  },

  {
    name: "1BIT REGISTER",
    gates: ["D FLIP-FLOP", "AND", "AND", "NOT", "OR"],
    connections: [
      { input: [null, 2], output: [[[0], [2, 0]]] },
      { input: [1, 0], output: [[[4, 1]]] },
      { input: [null, null], output: [[[4, 0]]] },
      { input: [1], output: [[[2, 1]]] },
      { input: [null, null], output: [[[0, 0]]] },
    ],
  },
  {
    name: "4BIT REGISTER",
    gates: ["1BIT REGISTER", "1BIT REGISTER", "1BIT REGISTER", "1BIT REGISTER"],
    connections: [
      { input: [0, 4, 5], output: [[[0]]] },
      { input: [1, 4, 5], output: [[[1]]] },
      { input: [2, 4, 5], output: [[[2]]] },
      { input: [3, 4, 5], output: [[[3]]] },
    ],
  },
];
