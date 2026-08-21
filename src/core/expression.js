// const math = require('mathjs');
const { create, all } = require('mathjs');
const math = create(all);
const _calcUnit = require('./math-calc-unit');
const { uniqBy } = require('../utils');

const MAX_FUNCTION_SUBSTITUTIONS = 10000;

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
   * @param {object} options Parsing options.
   * @param {boolean} options.booleanContext Treat the whole expression as a
   * boolean position, accepting literal `0` and `1` as `false` and `true`.
   *
   * @returns {Expression} Parsed expression.
   */
  static fromString(exprStringOrNumber, { booleanContext = false } = {}){
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

    exprParsed = _normalizeBooleanLiterals(exprParsed, booleanContext);

    // additional check of expressions
    exprParsed.traverse((node) => { // recursive forEach
      /*if (node.type === 'ConditionalNode') { // check that ternary has boolean expression
        let cond = node.condition;
        if (!cond.hasBooleanResult()) {
          let msg = `Ternary operator must have a boolean condition, got "${cond.toString()}"`;
          throw new TypeError(msg);
        }
      } else */
      if (node.type === 'FunctionNode' && node.fn.name === 'piecewise') {
        _validatePiecewise(node);
      } else if (node.type === 'AssignmentNode') { // check = sign
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
    let transformed = this.exprParsed;
    let substituted = true;
    let substitutionCount = 0;
    const definitions = new Map();

    // Transformed nodes are clones and can lose fnObj. Collect definitions
    // reachable from the original expression and function bodies so each
    // subsequent pass can still resolve a newly introduced function call.
    const collectDefinitions = (node) => {
      node.filter((candidate) => {
        if (candidate.type !== 'FunctionNode' || !candidate.fnObj || candidate.fnObj.isCore) return false;
        const definition = candidate.fnObj;
        if (!definitions.has(definition.id)) {
          definitions.set(definition.id, definition);
          collectDefinitions(definition.math.exprParsed);
        }
        return false;
      });
    };
    collectDefinitions(this.exprParsed);

    // mathjs does not traverse nodes returned by transform(). Repeat until
    // every non-core function call introduced by a previous substitution has
    // also been expanded.
    while (substituted) {
      substituted = false;
      transformed = transformed.transform((node) => {
        const definition = node.type === 'FunctionNode'
          && (node.fnObj || definitions.get(node.fn.name));
        if (definition && !definition.isCore) {
          substitutionCount += 1;
          if (substitutionCount > MAX_FUNCTION_SUBSTITUTIONS) {
            throw new TypeError('Too many user-defined function substitutions; recursive function definitions are not supported');
          }
          substituted = true;
          return _substituteFunctionDef(definition, node.args);
        }
        return node;
      });
    }

    return new Expression(transformed);
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
  * @returns {string[]} Symbol names excluding function names and constants `exponentiale`, `pi`.
   */
  dependOn(){
    let res = this.dependOnNodes().map((node) => node.name);
    return uniqBy(res);
  }
  /**
   * Lists symbol nodes used by the expression.
   *
  * @returns {math.SymbolNode[]} Symbol nodes excluding function names and constants `exponentiale`, `pi`.
   */
  dependOnNodes(){
    return this.exprParsed
      .filter((node, path/*, parent*/) => node.type === 'SymbolNode' && path !== 'fn')
      .filter((node) => ['exponentiale', 'pi'].indexOf(node.name) === -1);
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
   * @returns {boolean} `true` for boolean operators, constants, or bound function definitions.
   */
  hasBooleanResult(visitedFunctionDefs = new Set()){
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
    let isBooleanFunction = node.type === 'FunctionNode'
      && node.fnObj
      && !node.fnObj.isCore
      && !visitedFunctionDefs.has(node.fnObj)
      && node.fnObj.math;

    if (isBooleanFunction) {
      // Function references are attached during binding.
      visitedFunctionDefs.add(node.fnObj);
      return node.fnObj.math.hasBooleanResult(visitedFunctionDefs);
    }

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

// Normalize only literal 0 and 1 where the language requires a Boolean value.
// Other numeric literals are errors there: Heta deliberately does not use
// general numeric truthiness.
function _normalizeBooleanLiterals(node, booleanContext = false) {
  if (node.type === 'ConstantNode' && booleanContext && typeof node.value === 'number') {
    if (node.value === 0 || node.value === 1) {
      return new math.ConstantNode(node.value === 1);
    }
    throw new TypeError(`Expected boolean literal true, false, 0 or 1, got ${node.toString()}`);
  }

  if (node.type === 'ParenthesisNode') {
    node.content = _normalizeBooleanLiterals(node.content, booleanContext);
  } else if (node.type === 'OperatorNode') {
    const isLogicalOperator = ['and', 'or', 'xor', 'not'].indexOf(node.fn) !== -1;
    node.args = node.args.map((arg) => _normalizeBooleanLiterals(arg, isLogicalOperator));
  } else if (node.type === 'ConditionalNode') {
    node.condition = _normalizeBooleanLiterals(node.condition, true);
    node.trueExpr = _normalizeBooleanLiterals(node.trueExpr, false);
    node.falseExpr = _normalizeBooleanLiterals(node.falseExpr, false);
  } else if (node.type === 'FunctionNode') {
    const isPiecewise = node.fn.name === 'piecewise';
    const hasOtherwise = node.args.length % 2 === 1;
    node.args = node.args.map((arg, index) => {
      let isPiecewiseCondition = isPiecewise
        && (!hasOtherwise || index < node.args.length - 1)
        && index % 2 === 1;
      return _normalizeBooleanLiterals(arg, isPiecewiseCondition);
    });
  }

  return node;
}

function _hasBooleanSyntax(node) {
  node = _removeParenthesis(node);
  return (node.type === 'ConstantNode' && typeof node.value === 'boolean')
    || (node.type === 'OperatorNode' && [
      'smaller', 'smallerEq', 'larger', 'largerEq', 'equal', 'unequal',
      'and', 'or', 'xor', 'not'
    ].indexOf(node.fn) !== -1);
}

function _validatePiecewise(node) {
  if (node.args.length < 2) {
    throw new TypeError(`piecewise() requires at least one value/condition pair, got ${node.args.length} arguments`);
  }

  const hasOtherwise = node.args.length % 2 === 1;
  const pairCount = hasOtherwise ? node.args.length - 1 : node.args.length;

  for (let index = 0; index < pairCount; index += 2) {
    const value = node.args[index];
    const condition = node.args[index + 1];
    if (_hasBooleanSyntax(value)) {
      throw new TypeError(`piecewise() value at argument ${index + 1} must be numeric, got boolean expression "${value}"`);
    }
    if (!_hasBooleanSyntax(condition) && condition.type !== 'SymbolNode') {
      throw new TypeError(`piecewise() condition at argument ${index + 2} must be boolean, got "${condition}"`);
    }
  }

  if (hasOtherwise && _hasBooleanSyntax(node.args[node.args.length - 1])) {
    throw new TypeError(`piecewise() otherwise value must be numeric, got boolean expression "${node.args[node.args.length - 1]}"`);
  }
}

// Return mathjs Node with substituted arguments.
// User-defined functions in this body are expanded recursively.
function _substituteFunctionDef(fnDef, argNodes = []) {
  // check arguments
  if (fnDef.arguments.length > argNodes.length) {
    throw new TypeError(`Function "${fnDef.id}" requires minimum ${fnDef.arguments.length} arguments, got ${argNodes.length}`);
  }

  // Expand calls in arguments first: nodes returned from `transform` are not
  // traversed again by mathjs.
  let expandedArgs = argNodes.map(_substituteUserDefinedFunctions);

  // Expand nested calls in the function body before binding the arguments.
  // The final binding pass then also traverses the expressions produced by
  // those nested calls (for example, fun2(x) -> fun1(x^2, x^3)).
  let expandedBody = _substituteUserDefinedFunctions(fnDef.math.exprParsed);

  return expandedBody.transform((node, path) => {
    let argIndex = fnDef.arguments.indexOf(node.name);
    if (node.type === 'SymbolNode' && path !== 'fn' && argIndex !== -1) {
      return expandedArgs[argIndex];
    }

    return node;
  });
}

function _substituteUserDefinedFunctions(node) {
  return node.transform((node) => {
    if (node.type === 'FunctionNode' && node.fnObj && !node.fnObj.isCore) {
      return _substituteFunctionDef(node.fnObj, node.args);
    }

    return node;
  });
}

module.exports = {
  Expression,
  math
};
