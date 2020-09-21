const math = require('mathjs');
const mathjsTranslate = require('mathjs-translate');
math.import(mathjsTranslate);
let { OperatorNode, SymbolNode } = math.expression.node;
const _ = require('lodash');

class Expression {
  constructor(exprParsed){ // string or object
    this.exprParsed = exprParsed;
  }
  static fromString(q){ // string or object
    if (typeof q!=='string' && typeof q!=='number')
      throw new TypeError('Expected <string> or <number>, but get ' + JSON.stringify(q));

    let exprString = q.toString();

    try {
      var exprParsed = math.parse(exprString);
    } catch(e) {
      throw new TypeError('Cannot parse MathExpr properly. ' + e.message);
    }

    return new Expression(exprParsed);
  }
  clone(){
    let clonedMath = this.exprParsed.cloneDeep();
    return new Expression(clonedMath);
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
  get num(){ // if it is constant than return number or undefined otherwice
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
    let exprParsed = this.exprParsed
      .translate(translator);
    return new Expression(exprParsed);
  }
  // return new expression which is the multiplication
  // of this and expression from argument
  multiply(multiplier = '1'){
    let multiplierParsed = math.parse(multiplier);
    let node = new OperatorNode('*', 'multiply', [
      this.exprParsed,
      multiplierParsed
    ]);

    return new Expression(node);
  }
  hasBooleanResult(){
    let operators = [
      'smaller', 'smallerEq',
      'larger', 'largerEq',
      'equal', 'unequal',
      'and', 'or', 'xor', 'not'
    ];
    let expr = _removeParenthesis(this.exprParsed);

    let isBoolean = expr.type === 'OperatorNode'
      && operators.indexOf(expr.fn) !== -1; 

    return isBoolean;
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
