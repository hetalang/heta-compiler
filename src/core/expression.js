const math = require('mathjs');
const mathjsTranslate = require('mathjs-translate');
math.import(mathjsTranslate);
const mathCalcUnits = require('./math-calc-unit');
math.import(mathCalcUnits);
let { OperatorNode, SymbolNode } = math.expression.node;
const _ = require('lodash');

/* remove parenthesis from top */
function _removeParenthesis(node) {
  if (node.type === 'ParenthesisNode') {
    return _removeParenthesis(node.content);
  } else {
    return node;
  }
}

/*
  To check if mathjs.Node instance has boolean or numeric result
*/
math.import({
  name: 'hasBooleanResult',
  path: 'expression.node.Node.prototype',
  factory: function(){
    let operators = [
      'smaller', 'smallerEq',
      'larger', 'largerEq',
      'equal', 'unequal',
      'and', 'or', 'xor', 'not'
    ];

    return function(){
      let expr = _removeParenthesis(this);
  
      let isBooleanOperator = expr.type === 'OperatorNode'
        && operators.indexOf(expr.fn) !== -1;
      let isBooleanValue = expr.type === 'ConstantNode'
        && [true, false].indexOf(expr.value) !== -1;
  
      return isBooleanOperator || isBooleanValue;
    };
  }
});

/*
  To store mathematical expressions with additional methods
*/
class Expression {
  /*
    exprParsed: <mathjs.Node>

    XXX: currently Expression instances have _logger property
    which is set after expression creation
    in future versions it should be resolved by automatic addition of __platform__ property 
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

    // additional check of expressions
    exprParsed.traverse((node) => { // recursive forEach
      if (node.type === 'ConditionalNode') { // check that ternary has boolean expression
        let cond = node.condition;
        if (!cond.hasBooleanResult()) {
          let msg = `Ternary operator must have a boolean condition, got "${cond.toString()}"`;
          throw new TypeError(msg);
        }
      } else if (node.type === 'AssignmentNode') { // check = sign
        let msg = `Assign (=) symbol must not be in expression, got "${exprParsed.toString()}"`;
        throw new TypeError(msg);
      }
    });

    return new Expression(exprParsed);
  }
  clone(){
    let clonedMath = this.exprParsed.cloneDeep();
    let expr = new Expression(clonedMath);
    expr._logger = this._logger;

    return expr;
  }
  updateReferences(q = {}){
    this.exprParsed.traverse((node /*, path, parent*/) => {
      if (node.type === 'SymbolNode') { // transform only SymbolNode
        let oldRef = _.get(node, 'name');
        let newRef = _.get(
          q.rename, 
          oldRef, 
          [q.prefix, oldRef, q.suffix].join('') // default behaviour
        );

        _.set(node, 'name', newRef);
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
  lianerizeFor(target){
    // estimate a, b from 'a * target + b'
    // b = a*0+b
    let bTree = math.simplify(this.exprParsed, {[target]: 0});
    // a = (a*y+b - b)/y
    let aTree = new OperatorNode('/', 'divide', [
      new OperatorNode('-', 'subtract', [
        this.exprParsed,
        bTree
      ]),
      new SymbolNode(target)
    ]);

    let aTreeSimplified = math.simplify(aTree);
    return [aTreeSimplified, bTree];
  }
  translate(translator = {}){
    //console.log(this.toString())
    let exprParsed = this.exprParsed.translate(translator);
    let expr = new Expression(exprParsed); 
    //console.log(expr.toString())
    //console.log('')
    expr._logger = this._logger; // set the same logger

    return expr;
  }
  // return new expression which is the multiplication
  // of this and expression from argument
  multiply(multiplier = '1'){
    let multiplierParsed = math.parse(multiplier);
    let node = new OperatorNode('*', 'multiply', [
      this.exprParsed,
      multiplierParsed
    ]);

    let expr = new Expression(node);
    expr._logger = this._logger; // set the same logger

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
    return _.uniq(res);
  }
  /*
  Get array of all internal elements
  Approximately the same ad dependsOn() but return Array of objects
  */
  dependOnNodes(){
    return this.exprParsed
      .filter((node, path/*, parent*/) => node.type === 'SymbolNode' && path !== 'fn')
      .filter((node) => ['t', 'e', 'pi'].indexOf(node.name) === -1);
  }
}

module.exports = {
  Expression
};
