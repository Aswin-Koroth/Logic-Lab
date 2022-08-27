class Gate {
  constructor(x, y, fn) {
    //Draw Properties
    this.x = x;
    this.y = y;
    if (fn == "NOT") {
      this.height = 40;
      this.width = 100;
    } else {
      this.height = 70; //temp
      this.width = 110; //temp
    }
    this.offset = { x: this.width / 2, y: this.height / 2 };
    this.color = "#613dc1"; //temp
    this.inPoints = {};
    this.outPoint = { x: null, y: null, radius: 7 }; //temp radius

    this.inputCon = {};
    this.outputCon = [];
    //Logic Properties
    this.fn = fn;
    this.inputs = fn == "NOT" ? [false] : [false, false];
    this.output = fn == "NOT" ? true : false;
  }

  logic() {
    let bool;
    if (this.fn == "NOT") {
      bool = !this.inputs[0];
    } else if (this.fn == "AND" || this.fn == "NAND") {
      bool = this.inputs[0] && this.inputs[1];
      for (let i = 2; i < this.inputs.length; i++) {
        bool = bool && this.inputs[i];
      }
      bool = this.fn == "NAND" ? !bool : bool;
    } else if (this.fn == "OR" || this.fn == "NOR" || this.fn == "XOR") {
      bool = this.inputs[0] || this.inputs[1];
      for (let i = 2; i < this.inputs.length; i++) {
        bool = bool || this.inputs[i];
      }
      bool = this.fn == "NOR" ? !bool : bool;
      if (this.fn == "XOR") {
        let count = 0;
        for (let i = 0; i < this.inputs.length; i++) {
          if (this.inputs[i]) {
            count++;
          }
        }
        if (count == this.inputs.length) {
          bool = false;
        }
      }
    }

    this.output = bool;
  }

  draw(context) {
    //Body
    ctx.beginPath();
    ctx.lineWidth = 1; //temp
    context.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    context.fill();
    context.strokeStyle = "Black";
    context.stroke();
    //Text
    context.fillStyle = "white"; //temp
    context.font = "2em Poppins"; //temp
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    context.fillText(
      this.fn,
      this.x + this.width / 2,
      this.y + this.height / 2 + 3
    ); //temp +3
    //Connection Points
    this.#drawInputs(context);
    this.#drawOutput(context);
  }

  #drawInputs(context) {
    let inputCount = this.inputs.length;
    for (let i = 0; i < inputCount; i++) {
      let x = this.x;
      let y = lerp(this.y, this.y + this.height, (i + 1) / (inputCount + 1));
      this.inPoints[i] = { x: x, y: y, radius: 7 }; //temp radius

      context.beginPath();
      context.arc(x, y, this.inPoints[i].radius, 0, 2 * Math.PI, false);
      context.fillStyle = getColor(this.inputs[i]);
      context.fill();
      context.stroke();
    }
  }

  #drawOutput(context) {
    this.outPoint.x = this.x + this.width;
    this.outPoint.y = lerp(this.y, this.y + this.height, 0.5);
    context.beginPath();
    context.arc(
      this.outPoint.x,
      this.outPoint.y,
      this.outPoint.radius,
      0,
      2 * Math.PI,
      false
    );
    context.fillStyle = getColor(this.output);
    context.fill();
    context.stroke();
  }

  #updateInputs() {
    for (let i = 0; i < this.inputs.length; i++) {
      if (this.inputCon[i] != undefined) {
        this.inputs[i] = this.inputCon[i].value;
      } else {
        this.inputs[i] = false;
      }
    }
  }
  update(context) {
    this.#updateInputs();
    this.logic();
    this.draw(context);
  }
}
/////////////////////////////////////////////////////
class Connection {
  constructor(gate, isGate) {
    if (isGate) {
      this.start = { x: gate.outPoint.x, y: gate.outPoint.y };
    } else {
      this.start = { x: gate.conPoint.x, y: gate.conPoint.y };
    }
    this.end = {};

    this.isGate = { start: isGate, end: null };
    this.value = null;
    this.startGate = gate;
    this.endGate = null;
    this.endIndex = null;
  }

  draw(context) {
    ctx.beginPath();
    context.strokeStyle = getColor(this.value);
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  update(context) {
    if (this.isGate.start) {
      this.start = {
        x: this.startGate.outPoint.x,
        y: this.startGate.outPoint.y,
      };
    }
    if (this.isGate.end) {
      this.end = {
        x: this.endGate.inPoints[this.endIndex].x,
        y: this.endGate.inPoints[this.endIndex].y,
      };
      this.endGate.inPoints[this.endIndex]["isConnected"] = true;
    }
    this.value = this.startGate.output;
    this.draw(context);
  }
}
/////////////////////////////////////////////////////
class boolBox {
  constructor(boxType, x, y) {
    this.boxType = boxType;
    this.output = false;
    this.connection = [];

    this.radius = 20;
    this.x = x;
    this.y = y;
    //connection properties
    this.conPoint = { radius: 7 }; //temp
    if (this.boxType == "inputBox") {
      this.conPoint["x"] = this.x + this.radius;
      this.conPoint["y"] = this.y;
    } else if (this.boxType == "outputBox") {
      this.conPoint["x"] = this.x - this.radius;
      this.conPoint["y"] = this.y;
    }
  }

  update(context, y) {
    this.#updateX(context);
    this.#updateY(y);
    if (this.boxType == "outputBox" && this.connection.length != 0) {
      this.output = this.connection[0].value;
    } else if (this.boxType == "outputBox") {
      this.output = false;
    }
    this.#draw(context);
  }

  #updateX(context) {
    if (this.boxType == "inputBox") {
      this.x = 40;
      this.conPoint["x"] = this.x + this.radius;
    } else if (this.boxType == "outputBox") {
      this.x = context.canvas.width - 40;
      this.conPoint["x"] = this.x - this.radius;
      if (this.connection[0] != undefined) {
        this.output = this.connection[0].startGate.output;
      }
    }
  }

  #updateY(y) {
    this.y = y;
    this.conPoint["y"] = y;
  }

  #draw(context) {
    //body
    context.beginPath();
    context.strokeStyle = "black";
    ctx.lineWidth = 1;
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    context.fillStyle = getColor(this.output);
    context.fill();
    context.stroke();
    //connection point
    context.beginPath();
    context.arc(
      this.conPoint.x,
      this.conPoint.y,
      this.conPoint.radius,
      0,
      2 * Math.PI,
      false
    );
    context.fillStyle = getColor(this.output);
    context.fill();
    context.stroke();
    //value
    let value = this.output ? 1 : 0;
    context.fillStyle = this.output ? "black" : "white"; //temp
    context.font = "2em Poppins"; //temp
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    context.fillText(value, this.x, this.y + 3); //+3 align correction
  }
}
