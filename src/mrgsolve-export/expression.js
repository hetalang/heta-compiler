const { Expression } = require('../core/expression');

Expression.prototype.toCString = function(logger, _mathOptions = {}, substituteByDefinitions = true){
  // set defaults
  let mathOptions = Object.assign({
    timeVariable: 'SOLVERTIME'
  }, _mathOptions);

  let tree = substituteByDefinitions ? this.substituteByDefinitions().exprParsed : this.exprParsed;

  let CStringHandler = (node, options) => {
    if (node.type === 'ConstantNode' && Number.isInteger(node.value)) {
      return node.value + '.0';
    }
    if (node.type === 'OperatorNode' && node.fn === 'pow') {
      return `pow(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
    }
    if (node.type === 'FunctionNode' && node.fn.name === 'abs') {
      return `fabs(${node.args[0].toString(options)})`;
    }
    if (node.type === 'FunctionNode' && node.fn.name === 'max') {
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `std::max(${args})`;
    }
    if (node.type === 'FunctionNode' && node.fn.name === 'min') {
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `std::min(${args})`;
    }
    if (node.type === 'SymbolNode' && node.name === 't') {
      return mathOptions.timeVariable;
    }
    // piecewise function
    if (node.type === 'FunctionNode' && node.fn.name === 'piecewise') {
      let msg = `mrgsolve format does not support "piecewise" function, got "${node.toString()}"`;
      logger && logger.error(msg);
      let args = node.args
        .map((arg) => arg.toString(options));
      return `piecewise(${args.join(',')})`;
    }
  };

  return tree.toString({
    parenthesis: 'keep',
    implicit: 'show',   
    handler: CStringHandler
  });
};