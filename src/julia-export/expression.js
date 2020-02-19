const { Expression } = require('../core/expression');

Expression.prototype.toJuliaString = function(){ // TODO: this is still the copy of Matlab structure
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
};

module.exports = Expression;
