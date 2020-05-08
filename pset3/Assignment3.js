// JavaScript source code


var NUM = "NUM";
var FALSE = "FALSE";
var VR = "VAR";
var PLUS = "PLUS";
var TIMES = "TIMES";
var LT = "LT";
var AND = "AND";
var NOT = "NOT";
var ITE = "ITE";
var ROOT = "ROOT";

var ALLOPS = [NUM, FALSE, VR, PLUS, TIMES, LT, AND, NOT, ITE];

function str(obj) { return JSON.stringify(obj); }

//Constructor definitions for the different AST nodes.

function flse() {
        return { generalType: "bool", type: FALSE, toString: function () { return "false"; } };
}

function vr(name) {
        return { generalType: "var", type: VR, name: name, toString: function () { return this.name; } };
}
function num(n) {
        return { generalType: "const", type: NUM, val: n, toString: function () { return this.val; } };
}
function plus(x, y) {
        return { generalType: "int", type: PLUS, left: x, right: y, toString: function () { return "("+ this.left.toString() + "+" + this.right.toString()+")"; } };
}
function times(x, y) {
        return { generalType: "int", type: TIMES, left: x, right: y, toString: function () { return "(" + this.left.toString() + "*" + this.right.toString() + ")"; } };
}
function lt(x, y) {
        return { generalType: "bool", type: LT, left: x, right: y, toString: function () { return "(" + this.left.toString() + "<" + this.right.toString() + ")"; } };
}
function and(x, y) {
        return { generalType: "bool", type: AND, left: x, right: y, toString: function () { return "(" + this.left.toString() + "&&" + this.right.toString() + ")"; } };
}
function not(x) {
        return { generalType: "bool", type: NOT, left: x, toString: function () { return "(!" + this.left.toString()+ ")"; } };
}
function ite(c, t, f) {
        return { generalType: "int", type: ITE, cond: c, tcase: t, fcase: f, toString: function () { return "(if " + this.cond.toString() + " then " + this.tcase.toString() + " else " + this.fcase.toString() + ")"; } };
}

//Interpreter for the AST.
function interpret(exp, envt) {
        switch (exp.type) {
                case FALSE: return false;
                case NUM: return exp.val;
                case VR: return envt[exp.name];
                case PLUS: return interpret(exp.left, envt) + interpret(exp.right, envt);
                case TIMES: return interpret(exp.left, envt) * interpret(exp.right, envt);
                case LT: return interpret(exp.left, envt) < interpret(exp.right, envt);
                case AND: return interpret(exp.left, envt) && interpret(exp.right, envt);
                case NOT: return !interpret(exp.left, envt);
                case ITE: if (interpret(exp.cond, envt)) { return interpret(exp.tcase, envt); } else { return interpret(exp.fcase, envt); }
        }
}

function writeToConsole(text) {
        var csl = document.getElementById("console");
        if (typeof text == "string") {
                csl.value += text + "\n";
        } else {
                csl.value += text.toString() + "\n";
        }
}

function removeProbabilitiesLessThanSolution(plist, correctProgAndProb) {
    if (correctProgAndProb[1] == 0) {
        return plist
    }
    var newPList = []
    for (let progAndProb of plist) {
        if (progAndProb[1] > correctProgAndProb[1]) {
            newPList.push(progAndProb)
        }
    }
    console.log((plist.length - newPList.length) + " unlikely progs removed")
    return newPList
}




function bottomUp(globalBnd, intOps, boolOps, vars, consts, inputoutputs, prob) {
    var depth = 0;
    var plist = makePList(intOps, boolOps, vars, consts, prob);
    var correctProgAndProb = [0, 0];

    while (depth < globalBnd && plist.length > 0) {
        console.log("Plist: " + plist.length);
        // console.log("Plist: " + plist.toString());
        plist = grow(plist, intOps, boolOps, prob);
        console.log("Grown plist: " + plist.length);
        // console.log("Grown plist: " + plist.toString());
        plist = removeProbabilitiesLessThanSolution(plist, correctProgAndProb)
        console.log("removed low prob plist: " + plist.length);
        plist = eliminateEquivalents(plist, inputoutputs);
        console.log("Filtered plist: " + plist.length);
        // console.log("Filtered plist: " + plist.toString());
        for (let pAndProb of plist) {
            if (isCorrect(pAndProb[0], inputoutputs)) {
                console.log('Correct program found: ' + pAndProb[0]);
                console.log('Probability: ' + pAndProb[1])
                console.log(runProgram(pAndProb[0], inputoutputs));
                if (correctProgAndProb[1] < pAndProb[1]) {
                    correctProgAndProb = pAndProb
                }
            }
        }
        console.log("done with round " + depth);
        depth += 1;
    }
    
    if (correctProgAndProb[1] > 0) {
        return correctProgAndProb[0]
    } else {
        return "FAIL";
    }
}

function makePList(intOps, boolOps, vars, consts, prob) {
    var plist = [];
    var i = 0;
    for (let v of vars) {
        plist[i] = [vr(v), prob(VR, 0, ROOT)]
        i = i + 1;
    }

    for (let c of consts) {
        plist[i] = [num(c), prob(NUM, 0, ROOT)]
        i = i + 1;
    }

    plist[i] = [flse(), prob(FALSE, 0, ROOT)];

    return plist;
}

function makeTerminalMap(plist) {
    // changes list of programs into map from output type to list of programs
    // with that output type.
    var map = new Map();
    for (let pAndProb of plist) {
        // console.log(pAndProb[0] + ", " + pAndProb[1])
        let p = pAndProb[0]
        // let prob = pAndProb[1]
        let type = p.generalType;
        if (map.has(type)) {
            map.get(type).push(pAndProb);
        } else {
            map.set(type, [pAndProb]);
        }
    }

    // console.log("pmap: ");
    // for (let type of map.keys()) {
        // console.log(type + ": " + map.get(type));
    // }

    return map;
}

function generateArgs2(pMap, argTypes) {
    // updated version which does it when there are multiple possible argtypes
    // allowed. just calls the old one for each possible.
    var args = [];
    for (let argType of argTypes) {
        let args2 = generateArgs(pMap, argType);
        if (args2.length > 0) {
            // console.log("argType: " + argType + ", args: " + args2);
        }
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
        // console.log('at: ' + argTypes[0])
        // console.log('pmap: ' + pMap.get(argTypes[0]));

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
        return num(opArgs[0]);
    } else if (opName === FALSE) {
        return flse();
    } else if (opName === VR) {
        throw new Error("Shouldn't make vars here");
        // return new Var(opArgs[0]);
    } else if (opName === PLUS) {
        return plus(opArgs[0], opArgs[1]);
    } else if (opName === TIMES) {
        return times(opArgs[0], opArgs[1]);
    } else if (opName === LT) {
        return lt(opArgs[0], opArgs[1]);
    } else if (opName === AND) {
        return and(opArgs[0], opArgs[1]);
    } else if (opName === NOT) {
        return not(opArgs[0]);
    } else if (opName === ITE) {
        return ite(opArgs[0], opArgs[1], opArgs[2]);
    } else {
        throw new Error("No op found");
    }
}

function getArgTypes(opName) {
    // returns list of possible valid arg types for the op.
    // see for example what multiplication returns, in order to accept
    // multiplies between variables and constants or two variables.

    // I assume for sake of problem 3-2 that we only need to look at programs
    // with these types. Should make it run a bit faster, than if we were to
    // blindly test the probability function for all types for each op.

    // I also keep the assumptions from problem 1-1(b):
    // -- Multiplications can only occur between variables and constants or between two variables
    // -- Comparisons cannot include any arithmetic, only variables and constants

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

function grow(plist, intOps, boolOps, prob) {
    console.log("Growing");
    let newPlist = [];
    var i = 0;

    // gives a map from type to list of programs in plist with that type
    var pmap = makeTerminalMap(plist);

    for (let op of intOps.concat(boolOps)) {
        // console.log('op: ' + op);
        var argTypes = getArgTypes(op);
        // console.log('arg types: ' + argTypes);
        // returns a list of argument lists for the program.
        var possibleArgs = generateArgs2(pmap, argTypes);
        // console.log('possible args : ' + possibleArgs);
        for (let args of possibleArgs) {
            // console.log("op: " + op + ", args: " + args);
            let argNodes = []
            let argProbs = []
            for (let arg of args) {
                argNodes.push(arg[0])
                argProbs.push(arg[1])
            }

            var newNode = createNode(op, argNodes);
            var newProb = calcProb(op, argNodes, argProbs, prob);
            newPlist[i] = [newNode, newProb]
            // console.log(newPlist[i]);
            i = i + 1;
        }
    }

    return plist.concat(newPlist);
}

function calcProb(op, argNodes, argProbs, prob) {
    // console.log(op + ", " + argNodes)
    var p = 1;
    for (let argProb of argProbs) {
        p = p * argProb
    }
    // console.log("old argprob:" + p.toString())
    var i = 0;
    for (let argNode of argNodes) {
        p = p * prob(argNode.type, i, op)
        // console.log("new arg prob: " + prob(argNode.type, i, op).toString())
        i = i + 1
    }
    // console.log("calc: " + op.toString() + ": " + argNodes.toString() + ": " + p.toString())
    return p
}

function eliminateEquivalents(plist, inputoutputs) {
    // keep the program with the higher probability
    var outputs = new Map();
    
    for (let pAndProb of plist) {
        let p = pAndProb[0]
        // console.log("prog: " + p.toString());
        // console.log("prob: " + pAndProb[1].toString());
        let out = runProgram(p, inputoutputs);
        if (!outputs.has(out.toString())) {
            //console.log("new p: " + p + ", out: " + out);
            outputs.set(out.toString(), pAndProb)
        } else {
            let existingPAndProb = outputs.get(out.toString())
            if (existingPAndProb[1] < pAndProb[1]) {
                outputs.set(out.toString(), pAndProb)
            }
            //console.log("repeat p: " + p + ", out: " + out);
        }
    }

    var newPlist = [];
    for (let pAndProb of outputs.values()) {
        newPlist.push(pAndProb)
    }
    return newPlist;
}

function runProgram(program, inputoutputs) {
    var out = [];
    for (let inputoutput of inputoutputs) {
        out.push(interpret(program, inputoutput));
    }
    return out;
}

function isCorrect(program, inputoutputs) {
    for (let inputoutput of inputoutputs) {
        var out = interpret(program, inputoutput);
        if (out !== inputoutput["_out"]) {
            return false;
        }
    }
    return true;
}


function run2(){
    testLongerButHigherProbability(); 
}

function givenTest() {
    function prob(child, id, parent) {
        // console.log("child: " + child, ", id: " + id, + ", parent: " + parent)
        //Example of a probability function. In this case, the function
        //has uniform distributions for most things except for cases that would
        //cause either type errors or excessive symmetries.
        //You want to make sure your solution works for arbitrary probability distributions.
        
        function unif(possibilities, kind){
            if (possibilities.indexOf(kind) >= 0) {
                return 1.0/possibilities.length;
            } 
            return 0;
        }
        
        switch(parent) {
            case PLUS: 
                if(id == 0)
                    return unif([NUM, VR, PLUS, TIMES, ITE], child);
                else
                    return unif([NUM, VR, TIMES, ITE], child);
                break;
            case TIMES: 
                if(id == 0)
                    return unif([NUM, VR, PLUS, TIMES, ITE], child);
                else
                    return unif([NUM, VR, ITE], child);
                break;                      
            case LT: 
                return unif([NUM, VR, PLUS, TIMES, ITE], child);
                break;
            case AND:
                return unif([LT, AND, NOT], child);
                break;
            case NOT:
                return unif([LT, AND], child);
                break;
            case ITE:
                if(id == 0)
                    return unif([LT, AND], child);                  
                else
                    return unif([NUM, VR, PLUS, TIMES, ITE], child);
                break;
            case ROOT:
                return unif([NUM, VR, FALSE], child);
        }
    }
    
    
    var rv = bottomUp(3, [VR, NUM, PLUS, TIMES, ITE], 
                                     [AND, NOT, LT, FALSE], ["x", "y"], [4, 5], 
                                     [{x:5,y:10, _out:5},{x:8,y:3, _out:3}], 
                                     prob
    );
    writeToConsole("RESULT: " + rv.toString());
    
}

function testLongerButHigherProbability() {
    function prob(child, id, parent) {
        function unif(possibilities, kind){
            if (possibilities.indexOf(kind) >= 0) {
                return 1.0/possibilities.length;
            } 
            return 0;
        }
        
        switch(parent) {
            case PLUS: 
                return 3;
                break;

                // if(id == 0)
                //     return unif([NUM, VR, PLUS, TIMES, ITE], child);
                // else
                //     return unif([NUM, VR, TIMES, ITE], child);
                // break;
            case TIMES: 
                if(id == 0)
                    return unif([NUM, VR, PLUS, TIMES, ITE], child);
                else
                    return unif([NUM, VR, ITE], child);
                break;                      
            case LT: 
                return unif([NUM, VR, PLUS, TIMES, ITE], child);
                break;
            case AND:
                return unif([LT, AND, NOT], child);
                break;
            case NOT:
                return unif([LT, AND], child);
                break;
            case ITE:
                if(id == 0)
                    return unif([LT, AND], child);                  
                else
                    return unif([NUM, VR, PLUS, TIMES, ITE], child);
                break;
            case ROOT:
                return unif([NUM, VR, FALSE], child);
        }
    }
    
    
    var rv = bottomUp(4, [VR, NUM, PLUS, TIMES, ITE], 
                                     [AND, NOT, LT, FALSE], ["x", "y"], [1, 2], 
                                     [{x:5,y:10, _out:9},{x:8,y:3, _out:12},
                                         {x:-1, y:-100, _out:3}], 
                                     prob
    );
    writeToConsole("RESULT: " + rv.toString());
}

