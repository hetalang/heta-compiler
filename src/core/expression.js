// const math = require('mathjs');
const { create, all } = require('mathjs');
const math = create(all);
const _calcUnit = require('./math-calc-unit');
const { uniqBy } = require('../utils');

/* 
  To store mathematical expressions with additional methods
*/
class Expression {
  /*
    exprParsed: <mathjs.Node>
  */
  constructor(exprParsed){ 
    this.exprParsed = exprParsed;
  }
  /*
    q: <String> || <Number>
  */
  static fromString(exprStringOrNumber){
    if (typeof exprStringOrNumber !== 'string' && typeof exprStringOrNumber !== 'number')
      throw new TypeError('Expected <string> or <number>, got ' + JSON.stringify(exprStringOrNumber));

    let exprString = exprStringOrNumber.toString();

    try {
      var exprParsed = math.parse(exprString);
    } catch(e) {
      throw new TypeError('Cannot parse MathExpr properly. ' + e.message);
    }

    // Check BlockNode and other unsupported syntax
    let supportedNodeTypes = [
      'SymbolNode', 'OperatorNode', 'FunctionNode', 'ConstantNode', 'ParenthesisNode',
      'ConditionalNode',
    ];
    let unsupportedNodes = exprParsed.filter((node) => {
      return supportedNodeTypes.indexOf(node.type) === -1;
    });
    if (unsupportedNodes.length > 0) {
      throw new TypeError('Unsupported MathExpr syntax');
    }

    // additional check of expressions
    exprParsed.traverse((node) => { // recursive forEach
      /*if (node.type === 'ConditionalNode') { // check that ternary has boolean expression
        let cond = node.condition;
        if (!cond.hasBooleanResult()) {
          let msg = `Ternary operator must have a boolean condition, got "${cond.toString()}"`;
          throw new TypeError(msg);
        }
      } else */
      if (node.type === 'AssignmentNode') { // check = sign
        let msg = `Assign (=) symbol must not be in expression, got "${exprParsed.toString()}"`;
        throw new TypeError(msg);
      } else if (node.type === 'AccessorNode') {
        let msg = 'Wrong syntax';
        throw new TypeError(msg);
      }
    });

    return new Expression(exprParsed);
  }
  clone(){
    let clonedMath = this.exprParsed.cloneDeep();
    let expr = new Expression(clonedMath);
    return expr;
  }
  // substitute user defined functions by their content, return Expression 
  substituteByDefinitions() {
    let transformed = this.exprParsed.transform((node) => {
      if (node.type === 'FunctionNode' && node.fnObj && !node.fnObj.isCore) {
        return node.fnObj.substitute(node.args);
      } else {
        return node;
      }
    });

    let expr = new Expression(transformed);

    return expr;
  }
  updateReferences(q = {}) {
    this.exprParsed.traverse((node , path/*, parent*/) => {
      if (node.type === 'SymbolNode' && path !== 'fn') { // transform only SymbolNode
        let oldRef = node.name;
        let newRef = q.rename[oldRef] || [q.prefix, oldRef, q.suffix].join('');

        node.name = newRef;
      }
    });
  }
  // the same options as in mathjs
  toString(options = {}){
    return this.exprParsed.toString(options);
  }
  /* number if expression can be directly transformed to number, undefined otherwice*/
  get num(){ // if it is constant than return number or undefined otherwise
    let tree = this.exprParsed;
    if(tree.isConstantNode){
      return tree.value;
    }else if(tree.isOperatorNode && tree.fn==='unaryMinus' && tree.args[0].isConstantNode){
      return -tree.args[0].value;
    }else{
      return undefined;
    }
  }
  linearizeFor(target){
    // estimate a, b from 'a * target + b'
    // b = a*0+b
    let bTree = math.simplify(this.exprParsed, {[target]: 0});
    // a = (a*y+b - b)/y
    let aTree = new math.OperatorNode('/', 'divide', [
      new math.OperatorNode('-', 'subtract', [
        this.exprParsed,
        bTree
      ]),
      new math.SymbolNode(target)
    ]);

    let aTreeSimplified = math.simplify(aTree);
    return [aTreeSimplified, bTree];
  }
  /*
    Renames all symbols except function names
    It works like a deep copy of expression with renaming
    translator: <Object> {oldName: newName}
    XXX: it must also save fnObj for user-defined functions to use "substitute" later BUT it doesn't
  */
  translateSymbol(translator = {}) {
    let tree = this.exprParsed.transform((node, path) => {
      let newName = translator[node.name];
      if (node.type === 'SymbolNode' && path !== 'fn' && newName) {
        return new math.SymbolNode(newName);
      } else if (node.type === 'FunctionNode' && node.fnObj && !node.fnObj.isCore) {
        return node;
      } else {
        return node;
      }
    });

    return new Expression(tree);
  }
  // return new expression which is the multiplication
  // of this and expression from argument
  multiply(multiplier = '1'){
    let multiplierParsed = math.parse(multiplier);
    let node = new math.OperatorNode('*', 'multiply', [
      this.exprParsed,
      multiplierParsed
    ]);

    let expr = new Expression(node);

    return expr;
  }
  // check if expression includes boolean operators: "and", "or", etc. 
  get isComparison(){
    let booleanOperators = [
      'smaller', 'smallerEq',
      'larger', 'largerEq',
      'equal', 'unequal'
    ];

    let res = this.exprParsed.type === 'OperatorNode'
      && booleanOperators.indexOf(this.exprParsed.fn) !== -1;

    return res;
  }
  /*
  Get array of unique ids from expression
  */
  dependOn(){
    let res = this.dependOnNodes().map((node) => node.name);
    return uniqBy(res);
  }
  /*
  Get array of all internal elements
  Approximately the same ad dependsOn() but return Array of objects
  */
  dependOnNodes(){
    return this.exprParsed
      .filter((node, path/*, parent*/) => node.type === 'SymbolNode' && path !== 'fn')
      .filter((node) => ['e', 'pi'].indexOf(node.name) === -1);
  }
  /*
  Get array of function names
  */
  functionList() {
    let list = this.exprParsed
      .filter((node, path/*, parent*/) => node.type === 'FunctionNode');

    return uniqBy(list, (x) => x.name);
  }
  hasBooleanResult(){
    const operators = [
      'smaller', 'smallerEq',
      'larger', 'largerEq',
      'equal', 'unequal',
      'and', 'or', 'xor', 'not'
    ];

    let node = _removeParenthesis(this.exprParsed);

    let isBooleanOperator = node.type === 'OperatorNode'
      && operators.indexOf(node.fn) !== -1;
    let isBooleanValue = node.type === 'ConstantNode'
      && [true, false].indexOf(node.value) !== -1;

    return isBooleanOperator || isBooleanValue;
  }
  calcUnit(component) { // component here is used for logger and index
    return _calcUnit(this.exprParsed, component);
  }
}

/* remove parenthesis from top */
function _removeParenthesis(node) {
  if (node.type === 'ParenthesisNode') {
    return _removeParenthesis(node.content);
  } else {
    return node;
  }
}

module.exports = {
  Expression
};
