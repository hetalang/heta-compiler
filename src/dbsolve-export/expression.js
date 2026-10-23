const { Expression } = require('../core/expression');
const { ConstantNode, FunctionNode, OperatorNode } = require('mathjs');

const infixOperators = {
  add: '+',
  subtract: '-',
  multiply: '*',
  divide: '/'
};

function convertInfixFunctions(node, powTransform) {
  let converted = node.map((child) => convertInfixFunctions(child, powTransform));
  if (converted.type !== 'FunctionNode') return converted;

  let { name } = converted.fn;
  let args = converted.args;
  if (Object.prototype.hasOwnProperty.call(infixOperators, name)) {
    return new OperatorNode(infixOperators[name], name, args);
  }
  if (name === 'pow' && powTransform === 'operator') {
    return new OperatorNode('^', 'pow', args);
  }
  if ((name === 'square' || name === 'cube') && powTransform !== 'function') {
    return new OperatorNode('^', 'pow', [args[0], new ConstantNode(name === 'square' ? 2 : 3)]);
  }
  if (name === 'nthRoot' && powTransform === 'operator') {
    return new OperatorNode('^', 'pow', [args[0], new OperatorNode('/', 'divide', [new ConstantNode(1), args[1]])]);
  }
  if (name === 'logbase' || name === 'log2') {
    let base = name === 'logbase' ? args[1] : new ConstantNode(2);
    return new OperatorNode('/', 'divide', [new FunctionNode('log', [args[0]]), new FunctionNode('log', [base])]);
  }
  return converted;
}

Expression.prototype.toSLVString = function(logger, powTransform = 'keep', substituteByDefinitions = true) {
  let tree = substituteByDefinitions ? this.substituteByDefinitions().exprParsed : this.exprParsed;

  if (['keep', 'operator', 'function'].indexOf(powTransform) === -1) {
    throw new TypeError('powTransform must be one of values: "keep", "operator", "function".');
  }

  // Let mathjs print converted operators with precedence-aware parentheses.
  tree = convertInfixFunctions(tree, powTransform);

  let SLVStringHandler = (node, options) => {
    // OperatorNode
    if (node.type === 'OperatorNode') {
      if (node.fn==='pow' && powTransform==='function') {
        return `pow(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
      }
      if (node.fn==='unaryPlus') {
        return `${node.args[0].toString(options)}`;
      }
    }

    // FunctionNode
    if (node.type === 'FunctionNode') {
      if (node.fn.name==='max' && node.args.length===2) {
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `max2(${args})`;
      }
      if (node.fn.name==='max' && node.args.length===3) {
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `max3(${args})`;
      }
      if (node.fn.name==='min' && node.args.length===2) {
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `min2(${args})`;
      }
      if (node.fn.name==='min' && node.args.length===3) {
        let args = node.args
          .map((arg) => arg.toString(options))
          .join(', ');
        return `min3(${args})`;
      }
      if (node.fn.name==='square' && powTransform==='function') {
        return `pow(${node.args[0].toString(options)}, 2)`;
      }
      if (node.fn.name==='cube' && powTransform==='function') {
        return `pow(${node.args[0].toString(options)}, 3)`;
      }
      if (node.fn.name === 'nthRoot' && powTransform !== 'operator') {
        let args = node.args
          .map((arg, i) => {
            if (arg.type === 'OperatorNode' && i > 0) {
              return `(${arg.toString(options)})`;
            } else {
              return arg.toString(options);
            }
          });
        return `pow(${args[0]}, 1 / ${args[1]})`;
      }
      if (node.fn.name === 'piecewise') {
        let msg = `DBS and SLV formats do not support "piecewise" function, got "${node.toString()}"`;
        logger && logger.error(msg);
        let args = node.args
          .map((arg) => arg.toString(options));
        return `piecewise(${args.join(',')})`;
      }
    }
    
    // ConditionalNode: ternary operator
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
        logger && logger.error(msg);
        return `ifgt([error], [error], ${trueExpr}, ${falseExpr})`;
      }
    }

    // SymbolNode
    if (node.type === 'SymbolNode') {
      if (node.name === 'e') {
        return 'exp(1)';
      }
      if (node.name === 'pi') {
        return 'acos(-1)';
      }
    }
  };

  return tree.toString({
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
