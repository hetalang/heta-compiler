const { Expression } = require('../core/expression');

Expression.prototype.toCString = function(logger, _mathOptions = {}, substituteByDefinitions = true){
  // set defaults
  let mathOptions = Object.assign({
    timeVariable: 'SOLVERTIME'
  }, _mathOptions);

  let tree = substituteByDefinitions ? this.substituteByDefinitions().exprParsed : this.exprParsed;

  let CStringHandler = (node, options) => {
    // ConstantNode
    if (node.type === 'ConstantNode' && Number.isInteger(node.value)) {
      return node.value + '.0';
    }

    // OperatorNode
    if (node.type === 'OperatorNode') {
      if (node.fn === 'pow') {
        return `pow(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
      }
      if (node.fn === 'unaryPlus') {
        return node.args[0].toString(options);
      }
    }

    // FunctionNode
    if (node.type === 'FunctionNode') {
      if (node.fn.name === 'abs') {
        return `fabs(${node.args[0].toString(options)})`;
      }
      if (node.fn.name === 'max') {
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `std::max(${args})`;
      }
      if (node.fn.name === 'min') {
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `std::min(${args})`;
      }
      if (node.fn.name === 'piecewise') {
        let msg = `mrgsolve format does not support "piecewise" function, got "${node.toString()}"`;
        logger && logger.error(msg);
        let args = node.args
          .map((arg) => arg.toString(options));
        return `piecewise(${args.join(',')})`;
      }
    }

    // SymbolNode
    if (node.type === 'SymbolNode' && node.name === 't') {
      return mathOptions.timeVariable;
    }
  };

  return tree.toString({
    parenthesis: 'keep',
    implicit: 'show',   
    handler: CStringHandler
  });
};
