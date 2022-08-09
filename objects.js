let connectionPoints = { input: [], output: [] };

class gate {
  constructor(x, y, inpCount) {
    this.position = { x: x, y: y };
    this.height = 70; //temp
    this.width = 110; //temp
    this.offset = { x: this.width / 2, y: this.height / 2 };
    this.color = "#613dc1"; //temp
    this.isSelected = false;

    //Logic Properties
    this.input = [];
    this.inputCount = inpCount;
    for (let i = 0; i < this.inputCount; i++) {
      let loc = this.#getInputLoc(i);
      this.input.push(new inputPoint(loc.x, loc.y));
    }
    this.output = new outputPoint(
      this.position.x + this.width,
      this.position.y + this.height / 2
    );
  }

  #getInputLoc(i) {
    let y = lerp(
      this.position.y,
      this.position.y + this.height,
      (i + 1) / (this.inputCount + 1)
    );
    return { x: this.position.x, y: y };
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
    context.font = "2em Poppins"; //temp
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      this.type,
      this.position.x + this.width / 2,
      this.position.y + this.height / 2 + 3
    ); //temp +3
    //connection Points
    [...this.input, this.output].forEach((point) => point.update(context));
  }

  update(context, isSelected) {
    // this.input.forEach((inp) => {
    //   // if(inp.start)
    // });

    this.isSelected = isSelected;
    this.input.forEach((point, index) => {
      let loc = this.#getInputLoc(index);
      point.position.x = loc.x;
      point.position.y = loc.y;
    });
    this.output.position.x = this.position.x + this.width;
    this.output.position.y = this.position.y + this.height / 2;

    this.logic();
    this.#draw(context);
  }
}

class NOT extends gate {
  constructor(x, y) {
    super(x, y, 1);
    this.type = "NOT";
    this.height = 40;
    this.width = 100;
    this.offset = { x: this.width / 2, y: this.height / 2 };
  }
  logic() {
    this.output.value = !this.input[0].value;
  }
}

class OR extends gate {
  constructor(x, y, inpCount = 2) {
    super(x, y, inpCount);
    this.type = "OR";
  }
  logic() {
    let value = this.input[0].value || this.input[1].value;
    for (let i = 2; i < this.inputCount; i++)
      value = value || this.input[i].value;
    this.output.value = value;
  }
}

class AND extends gate {
  constructor(x, y, inpCount = 2) {
    super(x, y, inpCount);
    this.type = "AND";
  }
  logic() {
    let value = this.input[0].value && this.input[1].value;
    for (let i = 2; i < this.inputCount; i++)
      value = value && this.input[i].value;
    this.output.value = value;
  }
}

class NOR extends OR {
  constructor(x, y, inpCount = 2) {
    super(x, y, inpCount);
    this.type = "NOR";
  }
  logic() {
    super.logic();
    this.output.value = !this.output.value;
  }
}
class NAND extends AND {
  constructor(x, y, inpCount = 2) {
    super(x, y, inpCount);
    this.type = "NAND";
  }
  logic() {
    super.logic();
    this.output.value = !this.output.value;
  }
}
class XOR extends OR {
  constructor(x, y, inpCount = 2) {
    super(x, y, inpCount);
    this.type = "XOR";
  }
  logic() {
    super.logic();
    let count = 0;
    for (let i = 0; i < this.inputCount; i++) if (this.input[i].value) count++;
    if (count == this.inputCount) this.output.value = false;
  }
}

//Connection Points

class connectionPoint {
  constructor(x, y) {
    this.position = { x: x, y: y };
    this.radius = 7;
    this.value = false;
  }

  draw(context) {
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
  constructor(x, y) {
    super(x, y);
    this.connection = null;
    connectionPoints.input.push(this);
  }

  update(context) {
    if (this.connection != null) this.value = this.connection.start.value;
    else this.value = false;
    this.draw(context);
  }

  drawConLine(context) {
    if (this.connection != null) this.connection.update(context);
  }

  connect(connection) {
    this.connection = connection;
  }

  disconnect() {
    //99999
    if (this.connection)
      remove(this.connection, this.connection.start.connections);
    //000000000
    this.connection = null;
  }
}

class outputPoint extends connectionPoint {
  constructor(x, y) {
    super(x, y);
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
      for (let i = 0; i < this.connections.length; i++) {
        this.connections[i].end.connection = null;
      }
      this.connections = [];
    } else this.connections.splice(index, 1);
  }
}

function getColor(bool) {
  return bool ? "#8edf34" : "#47555E"; //true:false
}

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
  constructor(x, y) {
    super(x, y);
    this.connection = new outputPoint(
      this.position.x + this.radius,
      this.position.y
    );
  }
  update(context) {
    this.connection.position.x = this.position.x + this.radius;
    this.connection.position.y = this.position.y;
    this.draw(context);
  }
}

class outputBox extends boolBox {
  constructor(x, y) {
    super(x, y);
    this.connection = new inputPoint(
      this.position.x - this.radius,
      this.position.y
    );
  }
  update(context) {
    this.position.x = context.canvas.width - 40; //temp
    this.connection.position.x = this.position.x - this.radius;
    this.connection.position.y = this.position.y;
    this.draw(context);
  }
}
