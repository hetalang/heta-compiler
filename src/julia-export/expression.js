const { Expression } = require('../core/expression');

Expression.prototype.toJuliaString = function(substituteByDefinitions) {
  let tree = substituteByDefinitions ? this.substituteByDefinitions().exprParsed : this.exprParsed;

  let juliaStringHandler = (node, options) => {
    if(node.type==='ConstantNode' && Number.isInteger(node.value)){
      return node.value.toExponential(); // to display 6 => 6e0; 6e23 => 6e+23
    }
    if(node.type==='FunctionNode' && node.fn.name==='add'){
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `+(${args})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='subtract'){
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
      return `NaNMath.pow(${node.args[0].toString(options)}, 3)`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='square'){
      return `NaNMath.pow(${node.args[0].toString(options)}, 2)`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='pow'){
      return `NaNMath.pow(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='sqrt'){
      return `NaNMath.sqrt(${node.args[0].toString(options)})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='nthRoot'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `NaNMath.pow(${args[0]}, 1/(${args[1]}))`; // TODO: check here
    }
    if(node.type==='FunctionNode' && node.fn.name==='log10'){
      return `NaNMath.log10(${node.args[0].toString(options)})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='log2'){
      return `NaNMath.log2(${node.args[0].toString(options)})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='ln'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `NaNMath.log(${args[0]})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='log'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `NaNMath.log(${args[0]})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='logbase'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `NaNMath.log(${args[1]}, ${args[0]})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='factorial'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `fact(${args[0]})`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='ifgt'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `${args[0]} > ${args[1]} ? ${args[2]} : ${args[3]}`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='ifge'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `${args[0]} >= ${args[1]} ? ${args[2]} : ${args[3]}`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='iflt'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `${args[0]} < ${args[1]} ? ${args[2]} : ${args[3]}`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='ifle'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `${args[0]} <= ${args[1]} ? ${args[2]} : ${args[3]}`;
    }
    if(node.type==='FunctionNode' && node.fn.name==='ifeq'){
      let args = node.args
        .map((arg) => arg.toString(options));
      return `${args[0]} == ${args[1]} ? ${args[2]} : ${args[3]}`;
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
    
    if (node.type === 'OperatorNode' && node.fn === 'pow') { // to support NaNMath.pow
      return `NaNMath.pow(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
    }

    if (node.type === 'SymbolNode' && node.name === 'e') {
      return 'exp(1.0)';
    }
  };

  return tree.toString({
    parenthesis: 'keep',
    implicit: 'show',
    handler: juliaStringHandler
  });
};

module.exports = Expression;
