const { Expression } = require('../core/expression');

Expression.prototype.toJuliaString = function(substituteByDefinitions = true, translator = {}) {
  //substitute user defined functions by their content
  let tree = substituteByDefinitions 
    ? this.substituteByDefinitions().exprParsed 
    : this.exprParsed.cloneDeep();

  // if translator is not empty, then change variable names
  if (!!Object.keys(translator).length) {
    tree.traverse((node, path) => {
      let newName = translator[node.name];
      if (node.type === 'SymbolNode' && path !== 'fn' && newName) {
        node.name = newName;
      }
    });
  }

  // to modify syntax as required for Julia
  let juliaStringHandler = (node, options) => {
    // ConstantNode
    if (node.type==='ConstantNode') {
      if (Number.isInteger(node.value)){
        return node.value.toExponential(); // to display 6 => 6e0; 6e23 => 6e+23
      }
      if (node.value === Infinity) {
        return 'Inf';
      }
      if (Number.isNaN(node.value)) {
        return 'NaN';
      }
    }
    
    // FunctionNode
    if (node.type==='FunctionNode') {
      if (node.fn.name==='add'){
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `+(${args})`;
      }
      if (node.fn.name==='subtract'){
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `-(${args})`;
      }
      if (node.fn.name==='multiply'){
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `*(${args})`;
      }
      if (node.fn.name==='divide'){
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `/(${args})`;
      }
      if (node.fn.name==='cube'){
        return `NaNMath.pow(${node.args[0].toString(options)}, 3)`;
      }
      if (node.fn.name==='square'){
        return `NaNMath.pow(${node.args[0].toString(options)}, 2)`;
      }
      if (node.fn.name==='pow'){
        return `NaNMath.pow(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
      }
      if (node.fn.name==='sqrt'){
        return `NaNMath.sqrt(${node.args[0].toString(options)})`;
      }
      if (node.fn.name==='nthRoot'){
        let args = node.args
          .map((arg) => arg.toString(options));
        return `NaNMath.pow(${args[0]}, 1/(${args[1]}))`; // TODO: check here
      }
      if(node.fn.name==='log10'){
        return `NaNMath.log10(${node.args[0].toString(options)})`;
      }
      if(node.fn.name==='log2'){
        return `NaNMath.log2(${node.args[0].toString(options)})`;
      }
      if(node.fn.name==='ln'){
        let args = node.args
          .map((arg) => arg.toString(options));
        return `NaNMath.log(${args[0]})`;
      }
      if(node.fn.name==='log'){
        let args = node.args
          .map((arg) => arg.toString(options));
        return `NaNMath.log(${args[0]})`;
      }
      if(node.fn.name==='logbase'){
        let args = node.args
          .map((arg) => arg.toString(options));
        return `NaNMath.log(${args[1]}, ${args[0]})`;
      }
      if(node.fn.name==='factorial'){
        let args = node.args
          .map((arg) => arg.toString(options));
        return `fact(${args[0]})`;
      }
      if(node.fn.name==='ifgt'){
        let args = node.args
          .map((arg) => arg.toString(options));
        return `${args[0]} > ${args[1]} ? ${args[2]} : ${args[3]}`;
      }
      if(node.fn.name==='ifge'){
        let args = node.args
          .map((arg) => arg.toString(options));
        return `${args[0]} >= ${args[1]} ? ${args[2]} : ${args[3]}`;
      }
      if(node.fn.name==='iflt'){
        let args = node.args
          .map((arg) => arg.toString(options));
        return `${args[0]} < ${args[1]} ? ${args[2]} : ${args[3]}`;
      }
      if(node.fn.name==='ifle'){
        let args = node.args
          .map((arg) => arg.toString(options));
        return `${args[0]} <= ${args[1]} ? ${args[2]} : ${args[3]}`;
      }
      if(node.fn.name==='ifeq'){
        let args = node.args
          .map((arg) => arg.toString(options));
        return `${args[0]} == ${args[1]} ? ${args[2]} : ${args[3]}`;
      }
    }

    // OperatorNode
    if (node.type === 'OperatorNode') {
      if (node.fn === 'and') {
        return node.args
          .map((arg) => arg.toString(options))
          .join(' && ');
      }
      if (node.fn === 'or') {
        return node.args
          .map((arg) => arg.toString(options))
          .join(' || ');
      }
      if (node.fn === 'xor') {
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `xor(${args})`;
      }
      if (node.fn === 'not') {
        let arg0 = node.args[0].toString(options, true);
        return `!${arg0}`;
      }
      if (node.fn === 'pow') { // to support NaNMath.pow
        return `NaNMath.pow(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
      }
      if (node.fn === 'unaryPlus') {
        return `${node.args[0].toString(options)}`;
      }
    }

    // SymbolNode
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
