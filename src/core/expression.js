const math = require('mathjs');
const mathjsTranslate = require('mathjs-translate');
math.import(mathjsTranslate);
let { OperatorNode, SymbolNode } = math.expression.node;

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
    let clonedMath = math.clone(this.exprParsed);
    return new Expression(clonedMath);
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
  toMatlabString(){
    let CStringHandler = (node, options) => {
      if(node.type==='FunctionNode' && node.fn.name==='pow'){
        return `power(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
      }
      if(node.type==='FunctionNode' && node.fn.name==='max'){
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `max([${args}])`;
      }
      if(node.type==='FunctionNode' && node.fn.name==='min'){
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `min([${args}])`;
      }
      if(node.type==='FunctionNode' && node.fn.name==='log'){
        if(node.args.length===1){
          return `log(${node.args[0].toString(options)})`;
        }else if(node.args.length===2){ // converts log(a, b) => log(a)/log(b)
          let args = node.args
            .map((arg) => `log(${arg.toString(options)})`)
            .join('/');
          return `(${args})`;
        }
      }
      if(node.type==='FunctionNode' && node.fn.name==='log2'){
        return `(log(${node.args[0].toString(options)})/log(2))`;
      }
      if(node.type==='SymbolNode' && node.name === 't'){
        return 'time';
      }
      if(node.type==='FunctionNode' && node.fn.name==='ifg0'){
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `fun.ifg0(${args})`;
      }
      if(node.type==='FunctionNode' && node.fn.name==='ife0'){
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `fun.ife0(${args})`;
      }
      if(node.type==='FunctionNode' && node.fn.name==='ifge0'){
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `fun.ifge0(${args})`;
      }
    };

    return this.exprParsed
      //.translate(math.expression.translator.to['dbsolve'])
      .toString({
        parenthesis: 'keep',
        implicit: 'show',   
        handler: CStringHandler
      });
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
}

module.exports = {
  Expression
};
