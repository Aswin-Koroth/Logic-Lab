


var circuit = [{
        "start":true,
        "fun":"XOR",
        "input":[false,false],
        "outCon":[{"id":3, "ind":0},{"id":2, "ind":0}],
        "output":false
    },{
        "start":true,
        "fun":"AND",
        "input":[false, false],
        "outCon":[{"id":4, "ind":1}],
        "output":false
    },{
        "start":false,
        "fun":"AND",
        "input":[false, false],
        "outCon":[{"id":4, "ind":0}],
        "output":false
    },{
        "start":false,
        "fun":"XOR",
        "input":[false, false],
        "outCon":[{"id":null, "ind":"out0"}],
        "output":false
    },{
        "start":false,
        "fun":"OR",
        "input":[false, false],
        "outCon":[{"id":null, "ind":"out1"}],
        "output":false
    }]


function main(){
    setCircuitStart();
    circuit.forEach((gate, index) =>{
        var out = logic(gate.fun, gate.input);
        gate.output = out;
        setOutCon(gate);
        console.log(index, out);
    });
    console.log(input)
}


function setCircuitStart(){
    input.forEach(inp =>{
        circuit[inp.id].input = inp.input
    })
}


function logic(fun, input){
    if (fun == "AND"){
        return input[0] && input[1];
    }
    else if (fun == "OR"){
        return input[0] || input[1];
    }
    else if (fun == "NOT"){
        return !input[0];
    }
    else if (fun == "NOR"){
        return !(input[0] || input[1]);
    }
    else if (fun == "NAND"){
        return !(input[0] && input[1]);
    }
    else if (fun == "XOR"){
        return (input[0] == input[1])?false:true;
    }
    return null;
}


function setOutCon(gate){
    gate.outCon.forEach(con => {
        if (con.id === null){
            let gate_id = circuit.indexOf(gate);
            output[gate_id] = gate.output;
            updateOutput(gate_id, con.ind);
            return;
        }
        else{
            circuit[con.id].input[con.ind] = gate.output;
        }
    })
}



setupUI();
main()
// 16/7/2022
// Aswin-Koroth



