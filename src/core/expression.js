// const math = require('mathjs');
const { create, all } = require('mathjs');
const math = create(all);
const _calcUnit = require('./math-calc-unit');
const { uniqBy } = require('../utils');

/**
 * Wrapper around a mathjs expression tree used by Heta model elements.
 *
 * @class Expression
 *
 * @param {math.Node} exprParsed Parsed mathjs expression node.
 *
 * @property {math.Node} exprParsed Parsed mathjs expression node.
 * @property {number|undefined} num Numeric value for constant expressions.
 * @property {boolean} isComparison `true` for comparison expressions.
 */
class Expression {
  /*
    exprParsed: <mathjs.Node>
  */
  constructor(exprParsed){ 
    this.exprParsed = exprParsed;
  }
  /**
   * Parses a string or number into an `Expression`.
   *
   * @param {string|number} exprStringOrNumber Expression source.
   *
   * @returns {Expression} Parsed expression.
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
  /**
   * Creates a deep clone of this expression.
   *
   * @returns {Expression} Cloned expression.
   */
  clone(){
    let clonedMath = this.exprParsed.cloneDeep();
    let expr = new Expression(clonedMath);
    return expr;
  }
  /**
   * Expands non-core user-defined function calls.
   *
   * @returns {Expression} Expression with function bodies substituted.
   */
  substituteByDefinitions() {
    let transformed = this.exprParsed.transform((node) => {
      if (node.type === 'FunctionNode' && node.fnObj && !node.fnObj.isCore) {
        return _substituteFunctionDef(node.fnObj, node.args);
      } else {
        return node;
      }
    });

    let expr = new Expression(transformed);

    return expr;
  }
  /**
   * Rewrites symbol references using `prefix`, `suffix`, and `rename`.
   *
   * @param {object} q Import options.
   *
   * @returns {void}
   */
  updateReferences(q = {}) {
    this.exprParsed.traverse((node , path/*, parent*/) => {
      if (node.type === 'SymbolNode' && path !== 'fn') { // transform only SymbolNode
        let oldRef = node.name;
        let newRef = q.rename[oldRef] || [q.prefix, oldRef, q.suffix].join('');

        node.name = newRef;
      }
    });
  }
  /**
   * Serializes the expression with mathjs formatting options.
   *
   * @param {object} options mathjs `toString` options.
   *
   * @returns {string} Expression string.
   */
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
  /**
   * Linearizes the expression by a target symbol.
   *
   * @param {string} target Symbol name.
   *
   * @returns {math.Node[]} Pair `[slope, intercept]` as mathjs nodes.
   */
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
  /**
   * Creates a translated copy with renamed symbols.
   *
   * Function names are not renamed. Existing user-defined function nodes are
   * kept as-is so their `fnObj` metadata remains attached.
   *
   * @param {object<string,string>} translator Map from old symbol names to new names.
   *
   * @returns {Expression} Translated expression.
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
  /**
   * Creates an expression equal to this expression multiplied by `multiplier`.
   *
   * @param {string|number} multiplier Multiplier expression.
   *
   * @returns {Expression} Product expression.
   */
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
  /**
   * Lists unique symbols used by the expression.
   *
   * @returns {string[]} Symbol names excluding function names and constants `e`, `pi`.
   */
  dependOn(){
    let res = this.dependOnNodes().map((node) => node.name);
    return uniqBy(res);
  }
  /**
   * Lists symbol nodes used by the expression.
   *
   * @returns {math.SymbolNode[]} Symbol nodes excluding function names and constants `e`, `pi`.
   */
  dependOnNodes(){
    return this.exprParsed
      .filter((node, path/*, parent*/) => node.type === 'SymbolNode' && path !== 'fn')
      .filter((node) => ['e', 'pi'].indexOf(node.name) === -1);
  }
  /**
   * Lists function calls used by the expression.
   *
   * @returns {math.FunctionNode[]} Unique function nodes.
   */
  functionList() {
    let list = this.exprParsed
      .filter((node, path/*, parent*/) => node.type === 'FunctionNode');

    return uniqBy(list, (x) => x.name);
  }
  /**
   * Checks whether the expression has a boolean result.
   *
   * @returns {boolean} `true` for boolean operators or boolean constants.
   */
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
  /**
   * Calculates expression units in the context of a model component.
   *
   * @param {Component} component Component used for reference lookup and logging.
   *
   * @returns {Unit|undefined} Calculated unit, if it can be inferred.
   */
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

// Return mathjs Node with substituted arguments.
// User-defined functions in this body are expanded recursively.
function _substituteFunctionDef(fnDef, argNodes = []) {
  // check arguments
  if (fnDef.arguments.length > argNodes.length) {
    throw new TypeError(`Function "${fnDef.id}" requires minimum ${fnDef.arguments.length} arguments, got ${argNodes.length}`);
  }

  // substitute arguments by nodes
  let transformed = fnDef.math.exprParsed.transform((node) => {
    let argIndex = fnDef.arguments.indexOf(node.name);
    if (node.type === 'SymbolNode' && argIndex !== -1) {
      return argNodes[argIndex];
    } else if (node.type === 'FunctionNode' && node.fnObj && !node.fnObj.isCore) {
      return _substituteFunctionDef(node.fnObj, node.args);
    } else {
      return node;
    }
  });

  return transformed;
}

module.exports = {
  Expression,
  math
};
