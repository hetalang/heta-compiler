const { Expression } = require('../core/expression');

Expression.prototype.toSLVString = function(powTransform = 'keep'){
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
    if(node.type==='FunctionNode' && node.fn.name==='add'){
      let args = node.args
        .map((arg) => {
          if(arg.type==='OperatorNode'){
            return `(${arg.toString(options)})`;
          }else{
            return arg.toString(options);
          }
        }).join(' + ');
      return args;
    }
    if(node.type==='FunctionNode' && node.fn.name==='divide'){
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(' / ');
      return args;
    }
    if(node.type==='FunctionNode' && node.fn.name==='multiply'){
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(' * ');
      return args;
    }
    if(node.type==='FunctionNode' && node.fn.name==='subtract'){
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(' - ');
      return args;
    }
    if(node.type==='FunctionNode' && node.fn.name==='max' && node.args.length===2){
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `max2(${args})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='max' && node.args.length===3){
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `max3(${args})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='min' && node.args.length===2){
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `min2(${args})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='min' && node.args.length===3){
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `min3(${args})`;
    }
    if(node.type==='FunctionNode' && node.fn==='square' && powTransform==='function'){
      return `pow(${node.args[0].toString(options)}, 2)`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='square' && powTransform!=='function'){
      let arg0;
      if(node.args[0].type==='OperatorNode'){
        arg0 = `(${node.args[0].toString(options)})`;
      }else{
        arg0 = node.args[0].toString(options);
      }
      return `${arg0} ^ 2`;
    }
    if(node.type==='FunctionNode' && node.fn==='cube' && powTransform==='function'){
      return `pow(${node.args[0].toString(options)}, 3)`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='cube' && powTransform!=='function'){
      let arg0;
      if(node.args[0].type==='OperatorNode'){
        arg0 = `(${node.args[0].toString(options)})`;
      }else{
        arg0 = node.args[0].toString(options);
      }
      return `${arg0} ^ 3`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='log' && node.args.length===2){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `log(${args[0]}) / log(${args[1]})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='log2'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `log(${args[0]}) / log(2)`;
    }
  };

  return this.exprParsed
    .toString({
      parenthesis: 'keep',
      implicit: 'show',   
      handler: SLVStringHandler
    });
};
