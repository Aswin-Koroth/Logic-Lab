let connectionPoints = { input: [], output: [] };

function getColor(bool) {
  return bool ? "#8edf34" : "#47555E"; //true:false
}

class gate {
  constructor(x, y, inpCount, outCount = 1) {
    this.position = { x: x, y: y };
    this.height = 70; //temp
    this.width = 110; //temp
    this.offset = { x: this.width / 2, y: this.height / 2 };
    this.color = "#613dc1"; //temp
    this.isSelected = false;

    //Logic Properties
    this.input = [];
    this.output = [];
    this.inputCount = inpCount;
    this.outputCount = outCount;
    for (let i = 0; i < this.inputCount; i++) {
      let loc = this.#getConPointLoc(0, i); //0 - ID for input
      this.input.push(new inputPoint(loc.x, loc.y, { isGate: this, index: i }));
    }
    for (let i = 0; i < this.outputCount; i++) {
      let loc = this.#getConPointLoc(1, i); //1 - ID for output
      this.output.push(
        new outputPoint(loc.x, loc.y, { isGate: this, index: i })
      );
    }
  }

  #getConPointLoc(id, i) {
    let loc = { x: null, y: null };
    let count;
    if (id == 0) {
      loc.x = this.position.x;
      count = this.inputCount;
    } else {
      loc.x = this.position.x + this.width;
      count = this.outputCount;
    }
    loc.y = lerp(
      this.position.y,
      this.position.y + this.height,
      (i + 1) / (count + 1)
    );
    return loc;
  }

  #draw(context) {
    //Body
    context.beginPath();
    context.lineWidth = 1; //temp
    context.rect(this.position.x, this.position.y, this.width, this.height);
    context.fillStyle = this.color;
    context.fill();
    context.strokeStyle = this.isSelected ? "white" : "Black";
    context.stroke();
    //Text
    context.fillStyle = "white"; //temp
    context.font = "1.3em Poppins"; //temp
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      this.name,
      this.position.x + this.width / 2,
      this.position.y + this.height / 2 + 3
    ); //temp 3 for alignment
  }

  update(context = null, isSelected = false) {
    this.isSelected = isSelected;
    //updating inputPoint position
    this.input.forEach((point, index) => {
      let loc = this.#getConPointLoc(0, index);
      point.position.x = loc.x;
      point.position.y = loc.y;
    });
    //updating outputPoint position
    this.output.forEach((point, index) => {
      let loc = this.#getConPointLoc(1, index);
      point.position.x = loc.x;
      point.position.y = loc.y;
    });

    this.logic();
    //connection Points
    if (context) this.#draw(context);
    [...this.input, ...this.output].forEach((point) => point.update(context));
  }
}

class customGate extends gate {
  constructor(x, y, inpCount, outCount, circuit, name, points) {
    super(x, y, inpCount, outCount);
    this.circuit = circuit;
    this.name = name;
    this.width = name.length * 10 + 40;

    this.groupInput = points.input;
    this.groupOutput = points.output;
  }

  logic() {
    this.input.forEach((inp, index) => {
      this.groupInput[index].forEach((i) => {
        i.value = inp.value;
      });
    });

    this.circuit.forEach((gate) => {
      gate.update();
    });

    this.output.forEach((out, index) => {
      out.value = this.groupOutput[index].value;
    });
  }
}

class NOT extends gate {
  constructor(x, y) {
    super(x, y, 1); //1 = inputCount of NOT
    this.name = "NOT";
    this.height = 40; //temp
    this.width = 100; //temp
    this.offset = { x: this.width / 2, y: this.height / 2 };
  }
  logic() {
    this.output[0].value = !this.input[0].value;
  }
}

class OR extends gate {
  constructor(x, y, inpCount = 2) {
    super(x, y, inpCount);
    this.name = "OR";
  }
  logic() {
    let value = this.input[0].value || this.input[1].value;
    for (let i = 2; i < this.inputCount; i++)
      value = value || this.input[i].value;
    this.output[0].value = value;
  }
}

class AND extends gate {
  constructor(x, y, inpCount = 2) {
    super(x, y, inpCount);
    this.name = "AND";
  }
  logic() {
    let value = this.input[0].value && this.input[1].value;
    for (let i = 2; i < this.inputCount; i++)
      value = value && this.input[i].value;
    this.output[0].value = value;
  }
}

class NOR extends OR {
  constructor(x, y, inpCount = 2) {
    super(x, y, inpCount);
    this.name = "NOR";
  }
  logic() {
    super.logic();
    this.output[0].value = !this.output[0].value;
  }
}
class NAND extends AND {
  constructor(x, y, inpCount = 2) {
    super(x, y, inpCount);
    this.name = "NAND";
  }
  logic() {
    super.logic();
    this.output[0].value = !this.output[0].value;
  }
}
class XOR extends OR {
  constructor(x, y, inpCount = 2) {
    super(x, y, inpCount);
    this.name = "XOR";
  }
  logic() {
    super.logic();
    let count = 0;
    for (let i = 0; i < this.inputCount; i++) if (this.input[i].value) count++;
    if (count == this.inputCount) this.output[0].value = false;
  }
}

//Connection Points
class connectionPoint {
  constructor(x, y, parent) {
    this.position = { x: x, y: y };
    this.radius = 7; //temp
    this.value = false;
    this.parent = { isGate: parent.isGate, index: parent.index };
  }

  draw(context) {
    if (!context) return;
    context.beginPath();
    context.strokeStyle = "black";
    context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = getColor(this.value);
    context.fill();
    context.stroke();
    this.drawConLine(context);
  }
}

class inputPoint extends connectionPoint {
  static snapDistance = 12;
  constructor(x, y, parent) {
    super(x, y, parent);
    this.connection = null;
    connectionPoints.input.push(this);
  }

  update(context) {
    if (this.connection) this.value = this.connection.start.value;
    else this.value = false;
    this.draw(context);
  }

  drawConLine(context) {
    if (this.connection) this.connection.update(context);
  }

  connect(connection) {
    this.connection = connection;
    connection.end = this;
  }

  disconnect() {
    if (this.connection)
      remove(this.connection, this.connection.start.connections);
    this.connection = null;
  }
}

class outputPoint extends connectionPoint {
  constructor(x, y, parent) {
    super(x, y, parent);
    this.connections = [];
    connectionPoints.output.push(this);
  }
  update(context) {
    this.draw(context);
  }

  drawConLine(context) {
    this.connections.forEach((con) => con.update(context));
  }

  disconnect(index = -1) {
    if (index == -1) {
      for (let i = 0; i < this.connections.length; i++)
        this.connections[i].end.connection = null;
      this.connections = [];
    } else this.connections.splice(index, 1);
  }
}

//Connection line
class connectionLine {
  constructor(point) {
    this.start = point;
    this.end = { position: { x: point.position.x, y: point.position.y } };
  }
  #draw(context) {
    ctx.save();
    ctx.beginPath();
    context.strokeStyle = getColor(this.start.value);
    ctx.moveTo(this.start.position.x, this.start.position.y);
    ctx.lineTo(this.end.position.x, this.end.position.y);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  }
  update(context) {
    this.#draw(context);
  }
}

//Value Box
class boolBox {
  constructor(x, y) {
    this.position = { x: x, y: y };
    this.radius = 20;
  }

  draw(context) {
    //body
    context.beginPath();
    context.strokeStyle = "black";
    ctx.lineWidth = 1;
    context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = getColor(this.connection.value);
    context.fill();
    context.stroke();
    //value
    let value = this.connection.value ? 1 : 0;
    context.fillStyle = this.connection.value ? "black" : "white"; //temp
    context.font = "2em Poppins"; //temp
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    context.fillText(value, this.position.x, this.position.y + 3); //+3 align correction
    //connection point
    this.connection.update(context);
  }
}

class inputBox extends boolBox {
  constructor(x, y, index) {
    super(x, y);
    this.connection = new outputPoint(
      this.position.x + this.radius,
      this.position.y,
      { isGate: false, index: index }
    );
  }
  update(context) {
    // updating connection point position
    this.connection.position.x = this.position.x + this.radius;
    this.connection.position.y = this.position.y;
    this.draw(context);
  }
}

class outputBox extends boolBox {
  constructor(x, y, index) {
    super(x, y);
    this.connection = new inputPoint(
      this.position.x - this.radius,
      this.position.y,
      { isGate: false, index: index }
    );
  }
  update(context) {
    this.position.x = context.canvas.width - 40; //temp
    this.connection.position.x = this.position.x - this.radius;
    this.connection.position.y = this.position.y;
    this.draw(context);
  }
}
