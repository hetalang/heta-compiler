const math = require('mathjs');
const mathjsTranslate = require('mathjs-translate');
math.import(mathjsTranslate);

class Expression {
  constructor(exprParsed){ // string or object
    this.exprParsed = exprParsed;
  }
  static fromQ(q = {}){ // string or object
    if (typeof q!=='string' && typeof q!=='number' && !('expr' in q))
      throw new TypeError('Expected <string> or <number> or {expr: <string>}, but get ' + JSON.stringify(q));

    if (typeof q==='string' || typeof q==='number') {
      var exprString = q.toString();
    } else {
      exprString = q.expr;
    }
    try {
      var exprParsed = math.parse(exprString);
    } catch(e) {
      throw new TypeError('Cannot parse .expr property. ' + e.message);
    }

    return new Expression(exprParsed);
  }
  /* string format */
  get expr(){
    return this.exprParsed.toString();
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
  toCString(){
    let CStringHandler = (node, options) => {
      if(node.type==='ConstantNode' && Number.isInteger(node.value)){
        return node.value + '.0';
      }
      if(node.type==='OperatorNode' && node.fn==='pow'){
        return `pow(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
      }
      if(node.type==='FunctionNode' && node.fn.name==='abs'){
        return `fabs(${node.args[0].toString(options)})`;
      }
      if(node.type==='FunctionNode' && node.fn.name==='max'){
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `std::max(${args})`;
      }
      if(node.type==='FunctionNode' && node.fn.name==='min'){
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `std::min(${args})`;
      }
      if(node.type==='SymbolNode' && node.name === 't'){
        return 'SOLVERTIME';
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
  toQ(options = {}){
    let res = options.simplifyExpressions
      ? this.expr
      : {expr: this.expr};
    return res;
  }
  linearizeFor(target){
    let { OperatorNode, SymbolNode } = math.expression.node;
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
  translate(){

  }
}

module.exports = {
  Expression
};
