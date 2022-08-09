
//XOR
Inp1 = [[0,0],[1,1]]
Inp2 = [[0,1],[1,0]]
XOR = [{
        "start":true,
        "fun":"OR",
        "input":[false,false],
        "outCon":[{"id":2, "ind":0}],
        "output":false
    },{
        "start":true,
        "fun":"NAND",
        "input":[false, false],
        "outCon":[{"id":2, "ind":1}],
        "output":false
    },{
        "start":false,
        "fun":"AND",
        "input":[false, false],
        "outCon":[{"id":null, "ind":"out1"}],
        "output":false
    }]


//BIT ADDER
DATA = [{"name":"BIT1", "data":[[0,0],[1,1]]},
        {"name":"BIT2", "data":[[0,1],[1,0]]},
        {"name":"CARRY", "data":[[2,1],[3,1]]}]
ADDER = [{
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


//SR_LATCH
Set = [[0,1]]
Reset = [[1,0]]
SR_LATCH = [{
        "start":true,
        "fun":"OR",
        "input":[false,false],
        "outCon":[{"id":2, "ind":0}],
        "output":false
    },{
        "start":true,
        "fun":"NOT",
        "input":[false],
        "outCon":[{"id":2, "ind":1}],
        "output":false
    },{
        "start":false,
        "fun":"AND",
        "input":[false, false],
        "outCon":[{"id":0, "ind":0},{"id":null, "ind":"out0"}],
        "output":false
    }]


//SR_LATCH with NOR
Set = [[0,0]]
Reset = [[1,1]]
SR_LATCH2 = [{
        "start":true,
        "fun":"NOR",
        "input":[false,false],
        "outCon":[{"id":1, "ind":0}],
        "output":false
    },{
        "start":true,
        "fun":"NOR",
        "input":[false,false],
        "outCon":[{"id":0, "ind":1},{"id":null, "ind":"out0"}],
        "output":false
    }]


//D_LATCH
Data = [[0,0],[1,0]]
Store = [[0,1],[2,0]]
D_LATCH = [{
        "start":true,
        "fun":"AND",
        "input":[false,false],
        "outCon":[{"id":3, "ind":0}],
        "output":false
    },{
        "start":true,
        "fun":"NOT",
        "input":[false],
        "outCon":[{"id":2, "ind":1}],
        "output":false
    },{
        "start":true,
        "fun":"AND",
        "input":[false,false],
        "outCon":[{"id":4, "ind":1}],
        "output":false
    },{
        "start":false,
        "fun":"NOR",
        "input":[false,false],
        "outCon":[{"id":4, "ind":0}],
        "output":false
    },{
        "start":false,
        "fun":"NOR",
        "input":[false, false],
        "outCon":[{"id":3, "ind":1},{"id":null, "ind":"out0"}],
        "output":false
    }]


//D_LATCH with NAND
Data = [[0,0],[0,1],[1,0]]
Store = [[1,1],[2,0]]
D_LATCH2 = [{
        "start":true,
        "fun":"NAND",
        "input":[false,false],
        "outCon":[{"id":2, "ind":1}],
        "output":false
    },{
        "start":true,
        "fun":"NAND",
        "input":[false,false],
        "outCon":[{"id":4, "ind":0}],
        "output":false
    },{
        "start":false,
        "fun":"NAND",
        "input":[false,false],
        "outCon":[{"id":3, "ind":1}],
        "output":false
    },{
        "start":false,
        "fun":"NAND",
        "input":[false,false],
        "outCon":[{"id":4, "ind":1}],
        "output":false
    },{
        "start":false,
        "fun":"NAND",
        "input":[false,false],
        "outCon":[{"id":3, "ind":0},{"id":null, "ind":"out0"}],
        "output":false
    }]




<div class="g1">
                <span>DATA</span>
                <button class="btn hover disable" id="00" onclick="setBtnInput(this,[[0,0],[0,1],[1,0]])">0</button>
            </div>
            <div class="g1">
                <span>STORE</span>
                <button class="btn hover disable"  onclick="setBtnInput(this,[[1,1],[2,0]])">0</button>
            </div>

