const { Expression } = require('../core/expression');

Expression.prototype.toCString = function(){

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
};