const math = require('mathjs');
const mathjsTranslate = require('mathjs-translate');
math.import(mathjsTranslate);
const mathjsMathML = require('mathjs-mathml');
math.import(mathjsMathML);

class Expression {
  constructor(q = {}){ // string or object
    if(typeof q!=='string' && typeof q!=='number' && !('expr' in q))
      throw new TypeError('Expected <string> or <number> or {expr: <string>}, but get ' + JSON.stringify(q));

    if(typeof q==='string' || typeof q==='number'){
      this._exprInput = q.toString(); // to transform numbers to string
      this._inputLang = 'qs3p';
    }else{
      this._exprInput = q.expr;
      this._langInput = q.lang ? q.lang : 'qs3p';
    }
    try{
      this.exprParsed = math.parse(this._exprInput);
    }catch(e){
      throw new TypeError('Cannot parse .expr property. ' + e.message);
    }
    if(q.units) this.units = q.units;
  }
  get expr(){
    return this.exprParsed.toString();
  }
  get num(){ // if it is constant than return number
    let tree = this.exprParsed;
    if(tree.isConstantNode){
      return tree.value;
    }else if(tree.isOperatorNode && tree.fn==='unaryMinus' && tree.args[0].isConstantNode){
      return -tree.args[0].value;
    }else{
      return undefined;
    }
  }
  toCMathML(){
    return this.exprParsed
      .toCMathML();
  }
  toMrgString(powTransform = 'keep'){
    if(['keep', 'operator', 'function'].indexOf(powTransform) === -1){
      throw new TypeError('powTransform must be one of values: "keep", "operator", "function".');
    }

    let SLVStringHandler = (node, options) => {
      if(node.type==='OperatorNode' && node.fn==='pow' && powTransform==='function'){
        return `pow(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
      }
      if(node.type==='FunctionNode' && node.fn.name==='pow' && powTransform==='operator'){
        if(node.args[0].type==='OperatorNode'){
          var arg0 = `(${node.args[0].toString(options)})`;
        }else{
          arg0 = node.args[0].toString(options);
        }
        if(node.args[1].type==='OperatorNode'){
          var arg1 = `(${node.args[1].toString(options)})`;
        }else{
          arg1 = node.args[1].toString(options);
        }
        return `${arg0} ^ ${arg1}`;
      }
      if(node.type==='FunctionNode' && node.fn.name==='abs'){ // TODO: wrong
        return `fabs(${node.args[0].toString(options)})`;
      }
      if(node.type==='FunctionNode' && node.fn.name==='max'){ // TODO: wrong
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `std::max(${args})`;
      }
      if(node.type==='FunctionNode' && node.fn.name==='min'){ // TODO: wrong
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `std::min(${args})`;
      }
    };

    return this.exprParsed
      //.translate(math.expression.translator.to['dbsolve'])
      .toString({
        parenthesis: 'keep',
        implicit: 'show',   
        handler: SLVStringHandler
      });
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
  toQ(){
    let res = {expr: this.expr};
    if(this.units) res.units = this.units;
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
}

module.exports = {
  Expression
};
