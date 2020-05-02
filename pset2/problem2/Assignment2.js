// JavaScript source code



////////////////
// Problem 2
///////////////

var NUM = "NUM";
var FALSE = "FALSE";
var VR = "VAR";
var PLUS = "PLUS";
var TIMES = "TIMES";
var LT = "LT";
var AND = "AND";
var NOT = "NOT";

var SEQ = "SEQ";
var IFTE = "IFSTMT";
var WHLE = "WHILESTMT";
var ASSGN = "ASSGN";
var SKIP = "SKIP";
var ASSUME = "ASSUME";
var ASSERT = "ASSERT";
var IMPLIES = "IMPLIES";
var INV = "INV";

function str(obj) { return JSON.stringify(obj); }

//Constructor definitions for the different AST nodes.

function flse() {
    return { type: FALSE, toString: function () { return "false"; } };
}

function vr(name) {
    return { type: VR, name: name, toString: function () { return this.name; } };
}
function num(n) {
    return { type: NUM, val: n, toString: function () { return this.val; } };
}
function plus(x, y) {
    return { type: PLUS, left: x, right: y, toString: function () { return "(" + this.left.toString() + " + " + this.right.toString() + ")"; } };
}
function times(x, y) {
    return { type: TIMES, left: x, right: y, toString: function () { return "(" + this.left.toString() + " * " + this.right.toString() + ")"; } };
}
function lt(x, y) {
    return { type: LT, left: x, right: y, toString: function () { return "(" + this.left.toString() + " < " + this.right.toString() + ")"; } };
}
function and(x, y) {
    return { type: AND, left: x, right: y, toString: function () { return "(" + this.left.toString() + " && " + this.right.toString() + ")"; } };
}

function not(x) {
    return { type: NOT, left: x, toString: function () { return "(!" + this.left.toString() + ")"; } };
}


function seq(s1, s2) {
    return { type: SEQ, fst: s1, snd: s2, toString: function () { return "" + this.fst.toString() + ";\n" + this.snd.toString(); } };
}


function assume(e) {
    return { type: ASSUME, exp: e, toString: function () { return "assume " + this.exp.toString(); } };
}

function assert(e) {
    return { type: ASSERT, exp: e, toString: function () { return "assert " + this.exp.toString(); } };
}

function assgn(v, val) {
    // vr is a string of the name of the variable, not a var thing itself
    // however, val is an ast.
    return { type: ASSGN, vr: v, val: val, toString: function () { return "" + this.vr + ":=" + this.val.toString(); } };
}

function ifte(c, t, f) {
    return { type: IFTE, cond: c, tcase: t, fcase: f, toString: function () { return "if(" + this.cond.toString() + "){\n" + this.tcase.toString() + '\n}else{\n' + this.fcase.toString() + '\n}'; } };
}

function whle(c, b) {
    return { type: WHLE, cond: c, body: b, toString: function () { return "while (" + this.cond.toString() + "){\n" + this.body.toString() + '\n}'; } };
}

function skip() {
    return { type: SKIP, toString: function () { return "/*skip*/"; } };
}

//some useful helpers:

function eq(x, y) {
    return and(not(lt(x, y)), not(lt(y, x)));
}

function or(x, y) {
    return not(and(not(x), not(y)));
}

function tru() {
    return not(flse());
}

function block(slist) {
    if (slist.length == 0) {
        return skip();
    }
    if (slist.length == 1) {
        return slist[0];
    } else {
        return seq(slist[0], block(slist.slice(1)));
    }
}

function implies(p, q, u) {
    return {type: IMPLIES, left: p, right: q, universalVariables: u, toString: function() { 
        return p.toString() + " => " + q.toString(); } };
}

function inv(exps) {
    return { type: INV, exps: exps, toString: function() { return "inv(" + exps.toString() + ")"; } };
}

//The stuff you have to implement.

/**
 * Computes the verification condition, given the problem.
 */
function computeVC(prog) {
    let varsInScope = getVariables(prog);
    return vc(prog, tru(), varsInScope);
}

/*
 * Replaces all of the variables with new ones with the number at the end, for
 * loop verification conditions.
 *
 * This does it so that variables which have already been copied, are copied a
 * second time, by ignoring existing asterisks.
 */
function copyVariables(ast, varsToModify) {
    switch (ast.type) {
        case NUM:
            return ast;
        case FALSE:
            return ast;
        case VR:
            var ogName = ast.name;
            if (ast.name.indexOf("_") != -1) {
                ogName = ast.name.slice(0, ast.name.indexOf("_"));
            }
            if (varsToModify.includes(ogName)) {
                return vr(ast.name + "_");
            } else {
                return ast;
            }

        case PLUS:
            return plus(copyVariables(ast.left, varsToModify), copyVariables(ast.right, varsToModify));
        case TIMES:
            return times(copyVariables(ast.left, varsToModify), copyVariables(ast.right, varsToModify));
        case LT:
            return lt(copyVariables(ast.left, varsToModify), copyVariables(ast.right, varsToModify));
        case AND:
            return and(copyVariables(ast.left, varsToModify), copyVariables(ast.right, varsToModify));
        case NOT:
            return not(copyVariables(ast.left, varsToModify));
        case SEQ:
            return seq(copyVariables(ast.fst, varsToModify), copyVariables(ast.snd, varsToModify));
        case IFTE:
            return ifte(copyVariables(ast.cond, varsToModify), copyVariables(ast.tcase, varsToModify),
                copyVariables(ast.fcase, varsToModify));
        case WHLE:
            return whle(copyVariables(ast.cond, varsToModify), copyVariables(ast.body, varsToModify));
        case ASSGN:
            var ogName = ast.vr.slice(0, ast.vr.indexOf("_"));
            if (varsToModify.includes(ogName)) {
                return assgn(ast.vr + "_", copyVariables(ast.val, varsToModify));
            } else {
                return ast;
            }
        case SKIP:
            return ast;
        case ASSUME:
            return assume(copyVariables(ast.exp, varsToModify));
        case ASSERT:
            return assert(copyVariables(ast.exp, varsToModify));
        case IMPLIES:
            return implies(copyVariables(ast.left, varsToModify), 
                copyVariables(ast.right, varsToModify), ast.universalVariables);
            
        case INV:
            var newExps = [];
            var i = 0;
            for (let exp of ast.exps) {
                newExps[i] = copyVariables(exp, varsToModify);
                i = i + 1;
            }
            return inv(newExps);
        default:
            throw "unhandled type: " + (typeof ast).toString() + "; we " 
                + "shouldn't be getting to default, too dangerous";
    }
}

/*
 * Returns all of the variables in the ast. Used for finding universal
 * quantifiers by look at variables which are antecedents of an implies().
 *
 * Returns a list of var ast's.
 */
function varsModifiedIn(ast) {
    switch (ast.type) {
        case NUM:
            return [];
        case FALSE:
            return [];
        case VR:
            return [];
        case PLUS:
            return varsModifiedIn(ast.left).concat(varsModifiedIn(ast.right));
        case TIMES:
            return varsModifiedIn(ast.left).concat(varsModifiedIn(ast.right));
        case LT:
            return varsModifiedIn(ast.left).concat(varsModifiedIn(ast.right));
        case AND:
            return varsModifiedIn(ast.left).concat(varsModifiedIn(ast.right));
        case NOT:
            return varsModifiedIn(ast.left);
        case SEQ:
            return varsModifiedIn(ast.fst).concat(varsModifiedIn(ast.snd));
        case IFTE:
            return varsModifiedIn(ast.tcase).concat(varsModifiedIn(ast.fcase));
        case WHLE:
            return varsModifiedIn(ast.cond).concat(varsModifiedIn(ast.body));
        case ASSGN:
            return [vr(ast.vr)];
        case SKIP:
            return [];
        case ASSUME:
            return [];
        case ASSERT:
            return [];
        case IMPLIES:
            return [];
        case INV:
            throw "don't think invs will be looked at here";
        default:
            throw "unhandled type: " + (typeof ast).toString() + "; we " 
                + "shouldn't be getting to default, too dangerous";
    }
}

/*
 * Computes the verification condition, given an AST and the postcondition.
 * varsInScope is passed along to keep track of the variables in scope, for
 * making the invariant function. I'm just assuming that any variale mentioned
 * anywhere in the program is going to be in scope for any loop.
 *
 */
function vc(prog, postCondition, varsInScope) {
    // var st = prog.toString();
    // console.log(prog.type + ": " + st);
    // writeToConsole(prog.type + ": " + st);
    // console.log("postcondition: ");
    // console.log(postCondition);

    switch(prog.type) {
        case SEQ:
            return vc(prog.fst, vc(prog.snd, postCondition, varsInScope), varsInScope);
        case IFTE:
            return or(and(prog.cond, vc(prog.tcase, postCondition, varsInScope)),
                and(not(prog.cond), vc(prog.fcase, postCondition, varsInScope)));
        case WHLE:
            // console.log(prog.body.toString());
            var vars = varsInScope;
            // console.log("vars:");
            // console.log(vars);
            // console.log("end vars");
            var varsModifiedInBody = varsModifiedIn(prog.body);
            var varsModifiedNames = [];
            var i = 0;
            for (let vr of varsModifiedInBody) {
                varsModifiedNames[i] = vr.name;
                i = i + 1;
            }
            varsModifiedInBody = varsModifiedNames;

            // console.log(varsModifiedInBody);
            var copiedPostCondition = copyVariables(postCondition, varsModifiedInBody);
            // console.log("copied PC:");
            // console.log(copiedPostCondition);
            var copiedVarsModified = copyVariableList(varsModifiedInBody);
            var copiedVars = copyVariableList(vars);
            
            var loopContinue = implies(prog.cond, vc(prog.body, inv(copiedVars), varsInScope), []);
            var loopEnd = implies(not(prog.cond), copiedPostCondition, []);
            // - global track of copies made.
            // - copy both at the same time? 
            // make copies of the variables here, to effectively drag out the quantifiers.
            var copied = copyVariables(implies(inv(copiedVars), and(loopContinue, loopEnd),
                    copiedVarsModified), varsModifiedInBody);
            var out = and(inv(vars), copied);
            return out;
        case ASSGN: 
            newGoal = replaceAssignment(postCondition, prog.vr, prog.val);
            return newGoal;
        case SKIP:
            return postCondition;
        case ASSUME:
            return implies(prog.exp, postCondition, [getVariables(prog.exp)]);
        case ASSERT:
            return and(prog.exp, postCondition)
        default:
            throw "unhandled type: " + (typeof ast).toString() + "; we " 
                + "shouldn't be getting to default, too dangerous";
    }
}

function copyVariableList(vars) {
    var copiedVars = [];
    var i = 0;
    for (let variable of vars) {
        copiedVars[i] = vr(variable.name + "_");
        i = i + 1;
    }

    return copiedVars;
    
}

/*
 * Returns a list of ast's
 */
function universalQuantifiers(ast) {
    return getVariables(ast);
}

/*
 * Wrapper for the variables call which removes duplicates.
 */
function getVariables(ast) {
    var variables = getVariablesRecursive(ast);
    // remove duplicates;
    var variableNames = [];
    var i = 0;
    for (let variable of variables) {
        variableNames[i] = variable.name;
        i = i + 1;
    }
    var varSet = new Set(variableNames);
    variables = [];
    i = 0;
    for (let variable of varSet) {
        variables[i] = vr(variable);
        i = i + 1;
    }
    return variables;
}

/*
 * Returns all variables in the mst, as an array of the asts.
 */
function getVariablesRecursive(ast) {
    // console.log("gv");
    // console.log(ast);
    // console.log(ast.type);
    switch(ast.type) {
        case NUM:
            return [];
        case FALSE:
            return [];
        case VR:
            return [ast];
        case PLUS:
            return getVariablesRecursive(ast.left).concat(getVariablesRecursive(ast.right));
        case TIMES:
            return getVariablesRecursive(ast.left).concat(getVariablesRecursive(ast.right));
        case LT:
            return getVariablesRecursive(ast.left).concat(getVariablesRecursive(ast.right));
        case AND:
            return getVariablesRecursive(ast.left).concat(getVariablesRecursive(ast.right));
        case NOT:
            return getVariablesRecursive(ast.left);
        case SEQ:
            return getVariablesRecursive(ast.fst).concat(getVariablesRecursive(ast.snd));
        case IFTE:
            return getVariablesRecursive(ast.cond).concat(getVariablesRecursive(ast.tcase))
                .concat(getVariablesRecursive(ast.fcase));
        case WHLE:
            return getVariablesRecursive(ast.cond).concat(getVariablesRecursive(ast.body));
        case ASSGN:
            return [vr(ast.vr)].concat(getVariablesRecursive(ast.val));
        case ASSUME:
            return getVariablesRecursive(ast.exp);
        case ASSERT:
            return getVariablesRecursive(ast.exp);
        case IMPLIES:
            return getVariablesRecursive(ast.left).concat(getVariablesRecursive(ast.right));
        case SKIP:
            return [];
        case INV:
            var vars = [];
            for (let exp of ast.exps) {
                vars = vars.concat(getVariablesRecursive(exp));
            }
            return vars;
            
        default:
            throw "unhandled type: " + ast.type + "; we " 
                + "shouldn't be getting to default, too dangerous";
    }
}

function replaceAssignment(ast, variableName, value) {
    switch (ast.type) {
        case NUM:
            return ast;
        case FALSE:
            return ast;
        case VR:
            if (ast.name === variableName) {
                return value;
            } else {
                return ast;
            }
        case PLUS:
            return plus(replaceAssignment(ast.left, variableName, value),
                replaceAssignment(ast.right, variableName, value));
        case TIMES:
            return times(replaceAssignment(ast.left, variableName, value),
                replaceAssignment(ast.right, variableName, value));
        case LT:
            return lt(replaceAssignment(ast.left, variableName, value),
                replaceAssignment(ast.right, variableName, value));
        case AND:
            return and(replaceAssignment(ast.left, variableName, value),
                replaceAssignment(ast.right, variableName, value));
        case NOT:
            return not(replaceAssignment(ast.left, variableName, value));
        case SEQ:
            throw "we shouldn't be replacing a seq, I think";
        case IFTE:
            throw "we shouldn't be replacing an IFTE, I think";
        case WHLE:
            throw "we shouldn't be replacing a while, I think";
        case ASSGN:
            throw "we shouldn't be replacing an ASSGN, I think";
        case SKIP:
            throw "we shouldn't be replacing an ASSGN, I think";
        case ASSUME:
            throw "we shouldn't be repacing an ASSUME, I think";
        case ASSERT:
            throw "we shouldn't be replacing an ASSRT, I think";
        case IMPLIES:
            return implies(replaceAssignment(ast.left, variableName, value),
                replaceAssignment(ast.right, variableName, value), ast.universalVariables);
            
        case INV:
            var newExps = [];
            var i = 0;
            for (let exp of ast.exps) {
                newExps[i] = replaceAssignment(exp, variableName, value);
                i = i + 1;
            }
            return inv(newExps);
        default:
            throw "unhandled type: " + (typeof ast).toString() + "; we " 
                + "shouldn't be getting to default, too dangerous";
    }
}

function testReplace() {
    ast = eq(vr('x'), vr('y'));
    console.log(ast);
    ast2 = replaceAssignment(ast, 'x', 'z');
    console.log(ast2);
}

function genSketch(vc) {
    var universalVariables = universalQuantifiers(vc);
    var argumentString = "";
    for (let variable of universalVariables) {
        argumentString += "int " + variable.name + ", ";
    }
    argumentString = argumentString.substring(0, argumentString.length - 2);
    var programString = "harness main(" + argumentString + ") {\n" 
            + harnessBody(vc) + "}";

    return programString;
     
}

function harnessBody(vc) {
    switch (vc.type) {
        case NUM:
            return vc.val;
        case FALSE:
            return "false";
        case VR:
            return vc.name;
        case PLUS:
            return "(" + harnessBody(vc.left) + " + " + harnessBody(vc.right) + ")";
        case TIMES:
            return "(" + harnessBody(vc.left) + " * " + harnessBody(vc.right) + ")";
        case LT:
            return "(" + harnessBody(vc.left) + " < " + harnessBody(vc.right) + ")";
        case AND:
            return "(" + harnessBody(vc.left) + " && "+  harnessBody(vc.right)+  ")";
        case NOT:
            return "!(" + harnessBody(vc.left);
        case SEQ:
            return harnessBody(vc.fst) + ";\n" + harnessBody(vc.snd);
        case IFTE:
            throw "shouldn't have ifte's here";
        case WHLE:
            throw "shouldn't have while's here";
        case ASSGN:
            throw "shouldn't have these here";
        case SKIP:
            return "";
        case ASSUME:
            throw "shouldn't have these here";
        case ASSERT:
            return "assert " + harnessBody(vc.exp);
        case IMPLIES:
            return "if ( " + harnessBody(vc.left) + ") {\n"
                    + "\t" + harnessBody(vc.right) + ";\n}";
        case INV:
            // TODO: need to have different inv function names, when there are
            // multiple in one vc.
            var argString = "";
            for (let exp of vc.exps) {
                argString += harnessBody(exp) + ", ";
            }
            argString = argString.substring(0, argString.length - 2);
            return "inv(" + argString + ")";
        default:
            throw "unhandled type: " + (typeof ast).toString() + "; we " 
                + "shouldn't be getting to default, too dangerous";
    }
}

/*
 * Given test case: increment x and y the same amount of times, or increment t
 * if t > 5.
 */
function testCase1() {
    prog = block([
        assume(tru()),
        assgn('x', num(0)),
        assgn('y', num(0)),
        assgn('t', num(0)),
        whle(lt(vr('x'), num(10)),
            block([
                ifte(lt(num(5), vr('t')), 
                block([
                assgn('x', plus(vr('x'),num(1))),
                assgn('y', plus(vr('y'),num(1))),
                ]), skip()),
                assgn('t', plus(vr('t'), num(1))),
            ])
        ),
        assert(eq(vr('x'), vr('y')))
    ]);
    return prog;
}

/*
 * increment x 10 times, assert it equals 10 at the end.
 */
function testCase2() {
    prog = block([
        assume(tru()),
        assgn('x', num(0)),
        whle(lt(vr('x'), num(10)),
            assgn('x', plus(vr('x'), num(1))),
        ),
        assert(eq(vr('x'), num(10)))
    ]);
    return prog;
}

/*
 * swaps x and y ten times, assert they keep their starting values.
 */
function testCase3() {
    prog = block([
        assume(and(eq(vr('y'), vr('y_0')), eq(vr('x'), vr('x_0')))),
        assgn('x', num(0)),
        whle(lt(vr('x'), num(10)),
            block([
                assgn('t', vr('x')),
                assgn('x', vr('y')),
                assgn('y', vr('t'))
            ])
        ),
        assert(and(eq(vr('y'), vr('y_0')), eq(vr('x'), vr('x_0'))))
    ]);
    return prog;
}

/*
 * swaps x and y an even number of times, assert they keep their starting
 * values.
 */
function testCase4() {
    prog = block([
        assume(eq(vr('s'), times(num(2), vr('s_0')))),
        assume(and(eq(vr('y'), vr('y_0')), eq(vr('x'), vr('x_0')))),
        assgn('x', num(0)),
        whle(lt(vr('x'), vr('s')),
            block([
                assgn('t', vr('x')),
                assgn('x', vr('y')),
                assgn('y', vr('t'))
            ])
        ),
        assert(and(eq(vr('y'), vr('y_0')), eq(vr('x'), vr('x_0'))))
    ]);
    return prog;
}

/*
 * add x to itself s times. assert result equals x times s, will that work?
 */
function testCase5() {
    prog = block([
        assume(eq(vr('s'), times(num(2), vr('s_0')))),
        assume(eq(vr('x'), times(num(2), vr('x_0')))),
        assgn('x2', vr('x')),
        assgn('t', num(0)),
        whle(lt(vr('t'), vr('s')),
            assgn('x2', plus(vr('x2'), vr('x'))),
        ),
        assert(eq(vr('x2'), times(vr('x'), vr('s'))))
    ]);
    return prog;
}


function printVC(prog) {
    writeToConsole("program:\n");
    writeToConsole(prog.toString());
    var vc = computeVC(prog);
    writeToConsole("\nverification condition:\n");
    writeToConsole(vc.toString());
    var uvs = universalQuantifiers(vc);
    writeToConsole("\ngenerated sketch function:\n");
    writeToConsole(genSketch(vc));
    writeToConsole("");
}

function P2a() {
    writeToConsole("test case 1");
    printVC(testCase1());
    writeToConsole("test case 2");
    printVC(testCase2());
    writeToConsole("test case 3");
    printVC(testCase3());
    writeToConsole("test case 4");
    printVC(testCase4());
    writeToConsole("test case 5");
    printVC(testCase5());
}

function P2b() {
    var prog = eval(document.getElementById("p2input").value);
    clearConsole();
    writeToConsole("Just pretty printing for now");
    writeToConsole(prog.toString());
}


//Some functions you may find useful:
function randInt(lb, ub) {
    var rf = Math.random();
    rf = rf * (ub - lb) + lb;
    return Math.floor(rf);
}

function randElem(from) {
    return from[randInt(0, from.length)];
}

function writeToConsole(text) {
    var csl = document.getElementById("console");
    if (typeof text == "string") {
        csl.textContent += text + "\n";
    } else {
        csl.textContent += text.toString() + "\n";
    }
}

function clearConsole() {
    var csl = document.getElementById("console");
    csl.textContent = "";
}
