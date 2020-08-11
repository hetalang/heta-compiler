const { Expression } = require('../core/expression');

Expression.prototype.toJuliaString = function(){
  let juliaStringHandler = (node, options) => {
    if(node.type==='ConstantNode' && Number.isInteger(node.value)){
      return node.value + '.0';
    }
    if(node.type==='FunctionNode' && node.fn.name==='plus'){
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `+(${args})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='substract'){
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `-(${args})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='multiply'){
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `*(${args})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='divide'){
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `/(${args})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='cube'){
      return `^(${node.args[0].toString(options)}, 3)`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='square'){
      return `^(${node.args[0].toString(options)}, 2)`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='pow'){
      return `^(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='ln'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `log(${args[0]})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='log' && node.args.length >= 2){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `log(${args[1]}, ${args[0]})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='factorial'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `factorial(ceil(Int, ${args[0]}))`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='ifg0'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `${args[0]} > 0 ? ${args[1]} : ${args[2]}`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='ife0'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `${args[0]} == 0 ? ${args[1]} : ${args[2]}`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='ifge0'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `${args[0]} >= 0 ? ${args[1]} : ${args[2]}`;
    }
    if (node.type === 'ConstantNode' && node.value === Infinity) {
      return 'Inf';
    }
    if (node.type === 'ConstantNode' && Number.isNaN(node.value)) {
      return 'NaN';
    }
    if (node.type === 'OperatorNode' && node.fn === 'and') {
      return node.args
        .map((arg) => arg.toString(options))
        .join(' && ');
    }
    if (node.type === 'OperatorNode' && node.fn === 'or') {
      return node.args
        .map((arg) => arg.toString(options))
        .join(' || ');
    }
    if (node.type === 'OperatorNode' && node.fn === 'xor') {
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `xor(${args})`;
    }
    if (node.type === 'OperatorNode' && node.fn === 'not') {
      let arg0 = node.args[0].toString(options, true);
      return `!${arg0}`;
    }
    if (node.type === 'SymbolNode' && node.name === 'e') {
      return 'exp(1.0)';
    }
  };

  return this.exprParsed
    .toString({
      parenthesis: 'keep',
      implicit: 'show',
      handler: juliaStringHandler
    });
};

module.exports = Expression;
