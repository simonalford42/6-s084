// JavaScript source code
'use strict';

var NUM = "NUM";
var FALSE = "FALSE";
var VR = "VAR";
var PLUS = "PLUS";
var TIMES = "TIMES";
var LT = "LT";
var AND = "AND";
var NOT = "NOT";
var ITE = "ITE";

var ALLOPS = [NUM, FALSE, VR, PLUS, TIMES, LT, AND, NOT, ITE];

function str(obj) { return JSON.stringify(obj); }

//Constructor definitions for the different AST nodes.


/**************************************************
 ***********  AST node definitions *****************
 ****************************************************/

class Node {
    toString() {
        throw new Error("Unimplemented method: toString()");
    }

    interpret() {
        throw new Error("Unimplemented method: interpret()");
    }

    type() {
        throw new Error("Unimplemented method: type()");
    }
}

class False extends Node {
    toString() {
        return "false";
    }

    interpret(envt) {
        return false;
    }

    type() {
        return "bool";
    }
}

class Var {
    constructor(name) {
        this.name = name;
    }
    
    toString() {
        return this.name;
    }

    interpret(envt) {
        return envt[this.name];
    }

    type() {
        return "var";
    }
}

class Num {
    constructor(val) {
        this.val = val;
    }
    
    toString() {
        return this.val.toString();
    }

    interpret(envt) {
        return this.val;
    }

    type() {
        return "const";
    }
}

class Plus {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
    
    toString() {
        return "("+ this.left.toString() + "+" + this.right.toString()+")";
    }

    interpret(envt) {
        return this.left.interpret(envt) + this.right.interpret(envt);
    }

    type() {
        return "int";
    }
}

class Times {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    toString() {
        return "(" + this.left.toString() + "*" + this.right.toString() + ")";
    }

    interpret(envt) {
        return this.left.interpret(envt) * this.right.interpret(envt);
    }

    type() {
        return "int";
    }
}
    
class Lt {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    toString() {
        return "(" + this.left.toString() + "<" + this.right.toString() + ")";
    }

    interpret(envt) {
        return this.left.interpret(envt) < this.right.interpret(envt);
    }

    type() {
        return "bool";
    }
}

class And {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    toString() {
        return "(" + this.left.toString() + "&&" + this.right.toString() + ")";
    }    

    interpret(envt) {
        return this.left.interpret(envt) && this.right.interpret(envt);
    }

    type() {
        return "bool";
    }
}



class Not {
    constructor(left) {
        this.left = left;
    }
    
    toString() {
        return "(!" + this.left.toString()+ ")";
    }

    interpret(envt) {
        return !this.left.interpret(envt);
    }

    type() {
        return "bool";
    }
}


class Ite {

    constructor(c, t, f) {
        this.cond = c;
        this.tcase = t;
        this.fcase = f;
    }
    
    toString() {
        return "(if " + this.cond.toString() + " then " + this.tcase.toString() + " else " + this.fcase.toString() + ")";
    }

    interpret(envt) {
        if (this.cond.interpret(envt)) {
            return this.tcase.interpret(envt);
        } else {
            return this.fcase.interpret(envt);
        }
    }

    type() {
        return "int";
    }
}
//Some functions you may find useful:

function randInt(lb, ub) {
    var rf = Math.random();
    rf = rf * (ub - lb) + lb;
    return Math.floor(rf);
}

function writeToConsole(text) {
    var csl = document.getElementById("console");
    if (typeof text == "string") {
        csl.value += text + "\n";
    } else {
        csl.value += text.toString() + "\n";
    }
}

function bottomUp(globalBnd, intOps, boolOps, vars, consts, inputoutputs) {
    var depth = 0;
    var plist = make_plist(intOps, boolOps, vars, consts);

    while (depth < globalBnd) {
        console.log("Plist: " + plist.length);
        plist = grow(plist, intOps, boolOps);
        console.log("Grown plist: " + plist.length);
        plist = eliminateEquivalents(plist, inputoutputs);
        console.log("Filtered plist: " + plist.length);
        //console.log("Filtered plist: " + plist.toString());
        for (let p of plist) {
            if (isCorrect(p, inputoutputs)) {
                console.log('Correct program found: ' + p);
                console.log(runProgram(p, inputoutputs));
                return p;
            }
        }
        console.log("done with round " + depth);
        depth += 1;
    }
    
    console.log("No program found");
    return "FAIL";
}

function make_plist(intOps, boolOps, vars, consts) {
    var plist = [];
    var i = 0;
    for (let v of vars) {
        plist[i] = new Var(v);
        i = i + 1;
    }

    for (let c of consts) {
        plist[i] = new Num(c);
        i = i + 1;
    }

    plist[i] = new False();

    console.log("Starting plist: " + plist.toString());
    return plist;
}

function makeTerminalMap(plist) {
    // changes list of programs into map from output type to list of programs
    // with that output type.
    var map = new Map();
    for (let p of plist) {
        let type = p.type();
        if (map.has(type)) {
            map.get(type).push(p);
        } else {
            map.set(type, [p]);
        }
    }

    console.log("pmap: ");
    for (let type of map.keys()) {
        console.log(type.toString() + ": " + map.get(type).toString())
    }

    return map;
}

function generateArgs2(pMap, argTypes) {
    // updated version which does it when there are multiple possible argtypes
    // allowed. just calls the old one for each possible.
    var args = [];
    for (let argType of argTypes) {
        let args2 = generateArgs(pMap, argType);
        console.log("argType: " + argType + ", args: " + args2);
        args = args.concat(generateArgs(pMap, argType));
    }

    return args;
}

function generateArgs(pMap, argTypes) {
    // calculates for a single set of arg types.

    if (argTypes.length === 0 || !pMap.has(argTypes[0])) {
        // we don't want it to generate new falses
        // also don't want to generate for ops which ask for 
        // string constants and similar things.
        return [];
    }

    if (argTypes.length === 1) {
        var args = [];
        console.log('at: ' + argTypes[0])
        console.log('pmap: ' + pMap.get(argTypes[0]));

        for (let term of pMap.get(argTypes[0])) {
            args.push([term]);
        }

        return args;
    }

    // console.log("argTypes: " + argTypes + "// " + argTypes.slice(1));
    var recursive = generateArgs(pMap, argTypes.slice(1));

    var out = [];
    for (let arg of pMap.get(argTypes[0])) {
        for (let rest of recursive) {
            let a = [arg].concat(rest);
            // console.log("new: " + a);
            out.push(a);
        }
    }

    return out;
}

function createNode(opName, opArgs) {

    if (opName === NUM) {
        return new Num(opArgs[0], opArgs[1]);
    } else if (opName === FALSE) {
        return new False();
    } else if (opName === VR) {
        throw new Error("Shouldn't make vars here");
        // return new Var(opArgs[0]);
    } else if (opName === PLUS) {
        return new Plus(opArgs[0], opArgs[1]);
    } else if (opName === TIMES) {
        return new Times(opArgs[0], opArgs[1]);
    } else if (opName === LT) {
        return new Lt(opArgs[0], opArgs[1]);
    } else if (opName === AND) {
        return new And(opArgs[0], opArgs[1]);
    } else if (opName === NOT) {
        return new Not(opArgs[0]);
    } else if (opName === ITE) {
        return new Ite(opArgs[0], opArgs[1], opArgs[2]);
    } else {
        throw new Error("No op found");
    }
}

function getClass(opName) {
    if (opName === NUM) {
        return Num;
    } else if (opName === FALSE) {
        return False;
    } else if (opName === VR) {
        return Var;
        // return new Var(opArgs[0]);
    } else if (opName === PLUS) {
        return Plus;
    } else if (opName === TIMES) {
        return Times;
    } else if (opName === LT) {
        return Lt;
    } else if (opName === AND) {
        return And;
    } else if (opName === NOT) {
        return Not;
    } else if (opName === LTE) {
        return new Lte(opArgs[1], opArgs[2]);
    } else {
        throw new Error("No op found");
    }
}

function getArgTypes(opName) {
    // returns list of possible valid arg types for the op.
    // see for example what multiplication returns, in order to accept
    // multiplies between variables and constants or two variables.
    if (opName === NUM) {
        return [["intConst"]];
    } else if (opName === FALSE) {
        return [[]];
    } else if (opName === VR) {
        return [["stringConst"]];
    } else if (opName === PLUS) {
        return [["int", "int"],
                ["int", "var"],
                ["int", "const"], // don't need to do symmetrical ones
                ["var", "var"],
                ["var", "const"],
                ["const", "const"]];
    } else if (opName === TIMES) {
        return [["var", "var"], 
                ["var", "const"]];
    } else if (opName === LT) {
        return [["var", "var"],
                ["var", "const"],
                ["const", "var"]];
            // don't need, since will be equivalent to false or true.
                //["const", "const"]];
    } else if (opName === AND) {
        return [["bool", "bool"]];
    } else if (opName === NOT) {
        return [["bool"]];
    } else if (opName === ITE) {
        return [["bool", "int", "int"],
                ["bool", "int", "var"],
                ["bool", "int", "const"], // now we do need to do symmetrical ones
                ["bool", "var", "int"],
                ["bool", "var", "var"],
                ["bool", "var", "const"],
                ["bool", "const", "int"],
                ["bool", "const", "var"],
                ["bool", "const", "const"]];
    } else {
        throw new Error("No op found");
    }
}

function grow(plist, intOps, boolOps) {
    console.log("Growing");
    let newPlist = [];
    var i = 0;

    var pmap = makeTerminalMap(plist);

    for (let op of intOps.concat(boolOps)) {
        console.log('op: ' + op);
        var argTypes = getArgTypes(op);
        // console.log('arg types: ' + argTypes);
        var possibleArgs = generateArgs2(pmap, argTypes);
        console.log('possible args : ' + possibleArgs);
        for (let args of possibleArgs) {
            // console.log("op: " + op + ", args: " + args);
            newPlist[i] = createNode(op, args);
            // console.log(newPlist[i]);
            i = i + 1;
        }
    }

    return plist.concat(newPlist);
}

function eliminateEquivalents(plist, inputoutputs) {
    var newPlist = [];
    var outputs = new Set();
    
    for (let p of plist) {
        let out = runProgram(p, inputoutputs);
        if (!outputs.has(out.toString())) {
            //console.log("new p: " + p + ", out: " + out);
            outputs.add(out.toString());
            newPlist.push(p);
        } else {
            //console.log("repeat p: " + p + ", out: " + out);
        }
    }
    return newPlist;
}

function runProgram(program, inputoutputs) {
    var out = [];
    for (let inputoutput of inputoutputs) {
        out.push(program.interpret(inputoutput));
    }
    return out;
}

function isCorrect(program, inputoutputs) {
    for (let inputoutput of inputoutputs) {
        var out = program.interpret(inputoutput);
        if (out !== inputoutput["_out"]) {
            return false;
        }
    }
    return true;
}


function bottomUpFaster(globalBnd, intOps, boolOps, vars, consts, inputoutput){
    // Note: I didn't want to have to copy all of my code, so the current
    // version only works for the version with constraints.
    return bottomUp(globalBnd, intOps, boolOps, vars, consts, inputoutput);
}


function run1a1(){
    writeToConsole("Running 1a1");
    
    var rv = bottomUp(3, [VR, NUM, PLUS, TIMES, ITE], [AND, NOT, LT, FALSE], ["x", "y"], [4, 5], [{x:5,y:10, _out:5},{x:8,y:3, _out:3}]);
    writeToConsole("RESULT: " + rv.toString());
    
}

function run1a2(){
    
    var rv = bottomUp(3, [VR, NUM, PLUS, TIMES, ITE], [AND, NOT, LT, FALSE], ["x", "y"], [-1, 5], [
        {x:10, y:7, _out:17},
        {x:4, y:7, _out:-7},
        {x:10, y:3, _out:13},
        {x:1, y:-7, _out:-6},
        {x:1, y:8, _out:-8}     
        ]);
    writeToConsole("RESULT: " + rv.toString());
    
}


function run1b(){
    
    var rv = bottomUpFaster(3, [VR, NUM, PLUS, TIMES, ITE], [AND, NOT, LT, FALSE], ["x", "y"], [-1, 5], [
        {x:10, y:7, _out:17},
        {x:4, y:7, _out:-7},
        {x:10, y:3, _out:13},
        {x:1, y:-7, _out:-6},
        {x:1, y:8, _out:-8}     
        ]);
    writeToConsole("RESULT: " + rv.toString());
    
}

    /* 
     * Given which functions go in which 'term' slots, we can solve for the
     * functions' constants as well as the pivots in linear time, in the manner
     * described below. 

     * Using this, a simple (if not most efficient) way to proceed then is
     * to try all possible assignments of functions to slots, and see if
     * calculating a solution works. With k functions and d slots, we'll have
     * k^d choices, but this still runs linear with respect to the size of the
     * input list.
     *
     * Given an assignment of functions to slots, we can solve for constants and
     * pivots in linear time with the following procedure:
     *
     * 1. Calculate the smallest input. We know this input will be included in
     *    the true-clause of the first ITE statement. 
     * 2. Solve for c1.
     * 3. Test f1 on all inputs, and find the minimum input which doesn't work.
     *    doesn't work--this will be p1.
     * 4. Now we know p1 will be included in the true-clause of the second ITE statement.
     * 5. Repeat steps 2 and 3 for the next function, and so on. 
     * 6. If after solving for the last function, we don't correctly classify
     *    the whole array, this assignment must not work.
     *
     * Finding the min is linear, as is testing a function on the inputs, and
     * each are done only a constant number of times (i.e. once per slot),so the
     * algorithm is linear.
     */
function structured(inputoutputs){
    var functions = [1,2,3];
    var numSlots = 4;
    // [1, 1, 1, 1], [1, 1, 1, 2], ... [3, 2, 1, 3], etc.
    var slotAssignments = generateAllPossibleAssignments([1,2,3], 4);

    // O(# slots)
    for (let slotAssignment of slotAssignments) {
        // returns "FAIL" if this assignment doesn't work.
        // otherwise returns [c1, p1, c2, p2, c3, p3, c4]
        // runs linear to size of inputoutput
        var constants = calculateConstants(slotAssignment, inputoutputs);

        if (constants !== "FAIL") {
            console.log('found good for ' + slotAssignment + ', constants: ' +  constants);
            let ast = makeFullAST(slotAssignment, constants); 
            console.log(ast);
            assertCorrectness(ast, inputoutputs);
            return ast;
        }
    }

    return "FAIL";
}

function assertCorrectness(program, inputoutputs) {
    // the inputoutputs aren't in the right format.
    let format_io = []
    for (let i = 0; i < inputoutputs.length; i = i+1) {
        let io_pair = inputoutputs[i];
        format_io[i] = {'x': io_pair[0], '_out': io_pair[1]};
    }

    let isCorrect = true;
    for (let inputoutput of format_io) {
        var out = program.interpret(inputoutput);
        if (out !== inputoutput["_out"]) {
            console.log('For input: ' + inputoutput['x']);
            console.log('Program is not correct: wanted ' + inputoutput["_out"] + ", got " + out);
            isCorrect = false;
        }
    }
    if (isCorrect) {
        console.log('Correctness confirmed'); 
    } else {
        throw new Error("not correct");
    }
}

function generateAllPossibleAssignments(functions, numSlots) {
    if (numSlots === 1) {
        var out = [];
        for (let f of functions) {
            out.push([f]);
        }
        return out;
    } else {
        var recursive = generateAllPossibleAssignments(functions, numSlots-1);
        var out = [];
        for (let a of recursive) {
            for (let f of functions) {
                out.push([f].concat(a));
            }
        }
        return out;
    }
}

function f(i, x, c) {
    if (i === 1) {
        return 2*x + c;
    } else if (i === 2) {
        return x*x + c;
    } else if (i === 3) {
        return 3*x + c;
    } else {
        throw new Error("invalid i");
    }
}

function fInv(i, x, o) {
    if (i === 1) {
        return o - 2*x;
    } else if (i === 2) {
        return o - x*x;
    } else if (i === 3) {
        return o - 3*x;
    } else {
        throw new Error("invalid i");
    }
}

function makeFunctionAST(i, c) {
    if (i === 1) {
        return new Plus(new Times(new Num(2), new Var("x")), new Num(c));
    } else if (i === 2) {
        return new Plus(new Times(new Var("x"), new Var("x")), new Num(c));
    } else if (i === 3) {
        return new Plus(new Times(new Num(3), new Var("x")), new Num(c));
    } else {
        throw new Error("invalid i");
    }
}

function calculateConstants(slotAssignment, inputoutputs) {
    console.log('calculating for ' + slotAssignment + ' , io: ' + inputoutputs);

    let minIo = findMin(inputoutputs);
    console.log("min: " + minIo);
    let c1 = fInv(slotAssignment[0], minIo[0], minIo[1]);
    console.log("c: " + c1);
    let smallestIncorrect = findSmallestIncorrect(slotAssignment[0], c1, inputoutputs);

    if (slotAssignment.length === 1) {
        console.log('length 1, smallestIncorrect = ' + smallestIncorrect);
        if (smallestIncorrect === undefined) {
            return c1;
        } else {
            return "FAIL";
        }   
    }

    console.log("smallest incorrect: " + smallestIncorrect);

    // only look at input/outputs above this smallest incorrect. linear time.
    let newIO = inputoutputs.filter(io => io[0] >= smallestIncorrect[0]);

    // recurses for the rest of the slots.
    let restOfConstants = calculateConstants(slotAssignment.slice(1), newIO);

    if (restOfConstants === "FAIL") {
        return "FAIL"
    } else {
        console.log('success: ' + c1 + ', ' + smallestIncorrect + ':: ' + restOfConstants);
        return [c1, smallestIncorrect[0]].concat(restOfConstants);
    }
}

function findSmallestIncorrect(fNum, fConst, inputoutputs) {
    var minExists = false;
    var min
    for (let io of inputoutputs) {
        if (f(fNum, io[0], fConst) !== io[1]) {
            if (!minExists || io[0] < min[0]) {
                minExists = true;
                min = io;
            }
        }
    }
    return min;
}

function findMin(inputoutputs) {
    var min = inputoutputs[0];
    for (let io of inputoutputs) {
        if (io[0] < min[0]) {
            min = io;
        }
    }
    return min;
}

function makeFullAST(slotAssignment, constants) {
    let c1 = constants[0]
    let p1 = constants[1]
    let c2 = constants[2]
    let p2 = constants[3]
    let c3 = constants[4]
    let p3 = constants[5]
    let c4 = constants[6]
    constants = [c1, c2, c3, c4];

    let slotAST = [];
    for (let i = 0; i < slotAssignment.length; i++) {
        slotAST[i] = makeFunctionAST(slotAssignment[i], constants[i]);
    }

    let x = new Var("x");

    return new Ite(new Lt(x, new Num(p1)), slotAST[0],
        new Ite(new Lt(x, new Num(p2)), slotAST[1],
        new Ite(new Lt(x, new Num(p3)), slotAST[2], slotAST[3])));
}


function run2() {
    var input = JSON.parse(document.getElementById("input2").value);
    //This is the data from which you will synthesize.
    console.log(input);
    structured(input);
}


function genData() {
    //If you write a block of code in program1 that writes its output to a variable out,
    //and reads from variable x, this function will feed random inputs to that block of code
    //and write the input/output pairs to input2.
    var program = document.getElementById("program1").value
    function gd(x) {
        var out;
        eval(program);
        return out;
    }
    var textToIn = document.getElementById("input2");
    const BOUND = 80;
    const N = 50;
    textToIn.value = "[";
    for(var i=0; i<N; ++i){
        if(i!=0){ textToIn.textContent += ", "; }
        var inpt = randInt(0, BOUND);
        textToIn.value += "[" + inpt + ", " + gd(inpt) + "]";
        if(i!=(N-1)){
            textToIn.value += ",";
        }
    }
    textToIn.value += "]";
}
