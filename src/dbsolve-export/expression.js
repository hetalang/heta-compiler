const { Expression } = require('../core/expression');

Expression.prototype.toSLVString = function(powTransform = 'keep') {
  if (['keep', 'operator', 'function'].indexOf(powTransform) === -1) {
    throw new TypeError('powTransform must be one of values: "keep", "operator", "function".');
  }

  let SLVStringHandler = (node, options) => {
    if (node.type==='OperatorNode' && node.fn==='pow' && powTransform==='function') {
      return `pow(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='pow' && powTransform==='operator') {
      if (node.args[0].type==='OperatorNode') {
        var arg0 = `(${node.args[0].toString(options)})`;
      } else {
        arg0 = node.args[0].toString(options);
      }
      if (node.args[1].type==='OperatorNode') {
        var arg1 = `(${node.args[1].toString(options)})`;
      } else {
        arg1 = node.args[1].toString(options);
      }
      return `${arg0} ^ ${arg1}`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='add') {
      let args = node.args
        .map((arg) => {
          if (arg.type==='OperatorNode') {
            return `(${arg.toString(options)})`;
          } else {
            return arg.toString(options);
          }
        }).join(' + ');
      return args;
    }
    if (node.type==='FunctionNode' && node.fn.name==='divide') {
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(' / ');
      return args;
    }
    if (node.type==='FunctionNode' && node.fn.name==='multiply') {
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(' * ');
      return args;
    }
    if (node.type==='FunctionNode' && node.fn.name==='subtract') {
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(' - ');
      return args;
    }
    if (node.type==='FunctionNode' && node.fn.name==='max' && node.args.length===2) {
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `max2(${args})`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='max' && node.args.length===3) {
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `max3(${args})`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='min' && node.args.length===2) {
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `min2(${args})`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='min' && node.args.length===3) {
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `min3(${args})`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='square' && powTransform==='function') {
      return `pow(${node.args[0].toString(options)}, 2)`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='square' && powTransform!=='function') {
      let arg0;
      if (node.args[0].type==='OperatorNode') {
        arg0 = `(${node.args[0].toString(options)})`;
      } else {
        arg0 = node.args[0].toString(options);
      }
      return `${arg0} ^ 2`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='cube' && powTransform==='function') {
      return `pow(${node.args[0].toString(options)}, 3)`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='cube' && powTransform!=='function') {
      let arg0;
      if (node.args[0].type==='OperatorNode') {
        arg0 = `(${node.args[0].toString(options)})`;
      } else {
        arg0 = node.args[0].toString(options);
      }
      return `${arg0} ^ 3`;
    }
    if (node.type === 'FunctionNode' && node.fn.name === 'nthRoot' && powTransform !== 'operator') {
      let args = node.args
        .map((arg, i) => {
          if (arg.type === 'OperatorNode' && i > 0) {
            return `(${arg.toString(options)})`;
          } else {
            return arg.toString(options);
          }
        });
      if (node.args.length === 1) {
        return `pow(${args[0]}, 1 / 2)`;
      } else {
        return `pow(${args[0]}, 1 / ${args[1]})`;
      }
    }
    if (node.type === 'FunctionNode' && node.fn.name === 'nthRoot' && powTransform === 'operator') {
      let args = node.args
        .map((arg) => {
          if (arg.type === 'OperatorNode') {
            return `(${arg.toString(options)})`;
          } else {
            return arg.toString(options);
          }
        });

      if (node.args.length === 1) {
        return `${args[0]} ^ (1 / 2)`;
      } else {
        return `${args[0]} ^ (1 / ${args[1]})`;
      }
    }
    if (node.type === 'FunctionNode' && node.fn.name === 'logbase') {
      let args = node.args
        .map((arg) => arg.toString(options));
      return `log(${args[1]}) / log(${args[0]})`;
    }
    if (node.type === 'FunctionNode' && node.fn.name === 'log2') {
      let args = node.args
        .map((arg) => arg.toString(options));
      return `log(${args[0]}) / log(2)`;
    }
    // piecewise function
    if (node.type === 'FunctionNode' && node.fn.name === 'piecewise') {
      let msg = `DBS and SLV formats do not support "piecewise" function, got "${node.toString()}"`;
      this._logger.error(msg);
      let args = node.args
        .map((arg) => arg.toString(options));
      return `piecewise(${args.join(',')})`;
    }
    // ternary operator
    if (node.type === 'ConditionalNode') {
      let condition = _removeParenthesis(node.condition);
      let trueExpr = node.trueExpr.toString(options);
      let falseExpr = node.falseExpr.toString(options);
      let args = condition.args && condition.args
        .map((arg) => arg.toString(options));

      // it works only for simple comparison and constants
      if (condition.fn === 'larger') {
        return `ifgt(${args[0]}, ${args[1]}, ${trueExpr}, ${falseExpr})`;
      } else if (condition.fn === 'largerEq') {
        return `ifge(${args[0]}, ${args[1]}, ${trueExpr}, ${falseExpr})`;
      } else if (condition.fn === 'smaller') {
        return `iflt(${args[0]}, ${args[1]}, ${trueExpr}, ${falseExpr})`;
      } else if (condition.fn === 'smallerEq') {
        return `ifle(${args[0]}, ${args[1]}, ${trueExpr}, ${falseExpr})`;
      } else if (condition.fn === 'equal') {
        return `ifeq(${args[0]}, ${args[1]}, ${trueExpr}, ${falseExpr})`;
      } else if (condition.fn === 'unequal') {
        return `ifeq(${args[0]}, ${args[1]}, ${falseExpr}, ${trueExpr})`;
      } else if (condition.type === 'ConstantNode' && condition.value === true) {
        return `ifgt(1, 0, ${trueExpr}, ${falseExpr})`;
      } else if (condition.type === 'ConstantNode' && condition.value === false) {
        return `ifgt(0, 1, ${trueExpr}, ${falseExpr})`;
      } else if (condition.type === 'OperatorNode') {
        let msg = `SLV format does not support boolean operators, got "${node.toString()}"`;
        this._logger.error(msg);
        return `ifgt([error], [error], ${trueExpr}, ${falseExpr})`;
      }
    }

    // pre-defined constants
    if (node.type === 'SymbolNode' && node.name === 'e') {
      return 'exp(1)';
    }
    if (node.type === 'SymbolNode' && node.name === 'pi') {
      return 'acos(-1)';
    }
  };

  return this.exprParsed
    .toString({
      parenthesis: 'keep',
      implicit: 'show',   
      handler: SLVStringHandler
    });
};

/* remove parenthesis from top */
function _removeParenthesis(node) {
  if (node.type === 'ParenthesisNode') {
    return _removeParenthesis(node.content);
  } else {
    return node;
  }
}
