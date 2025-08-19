const { Expression } = require('../core/expression');

Expression.prototype.toMatlabString = function(substituteByDefinitions = true) {
  let tree = substituteByDefinitions ? this.substituteByDefinitions().exprParsed : this.exprParsed;

  let matlabStringHandler = (node, options) => {
    if (node.type==='FunctionNode' && node.fn.name==='pow') {
      return `power(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='max') {
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      if (node.args.length <= 2) {
        return `max(${args})`;
      } else {
        return `max([${args}])`;
      }
    }
    if (node.type==='FunctionNode' && node.fn.name==='min') {
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      if (node.args.length <= 2) {
        return `min(${args})`;
      } else {
        return `min([${args}])`;
      }
    }
    if (node.type==='FunctionNode' && node.fn.name==='log') {
      return `log(${node.args[0].toString(options)})`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='logbase') {
      return `(log(${node.args[0].toString(options)})/log(${node.args[1].toString(options)}))`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='log2') {
      return `(log(${node.args[0].toString(options)})/log(2))`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='ln') {
      return `log(${node.args[0].toString(options)})`;
    }
    if (node.type==='SymbolNode' && node.name === 't') {
      return 'time';
    }
    if (node.type==='FunctionNode' && node.fn.name==='ifgt') {
      let args = node.args
        .map((arg) => arg.toString(options));
      return `tern__(${args[0]}>${args[1]}, ${args[2]}, ${args[3]})`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='ifge') {
      let args = node.args
        .map((arg) => arg.toString(options));
      return `tern__(${args[0]}>=${args[1]}, ${args[2]}, ${args[3]})`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='iflt') {
      let args = node.args
        .map((arg) => arg.toString(options));
      return `tern__(${args[0]}<${args[1]}, ${args[2]}, ${args[3]})`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='ifle') {
      let args = node.args
        .map((arg) => arg.toString(options));
      return `tern__(${args[0]}<=${args[1]}, ${args[2]}, ${args[3]})`;
    }
    if (node.type==='FunctionNode' && node.fn.name==='ifeq') {
      let args = node.args
        .map((arg) => arg.toString(options));
      return `tern__(${args[0]}==${args[1]}, ${args[2]}, ${args[3]})`;
    }
    // operators
    if (node.type === 'OperatorNode' && node.fn === 'pow') {
      return `(${node.args[0].toString(options)} ^ ${node.args[1].toString(options)})`;
    }
    if (node.type === 'OperatorNode' && node.fn === 'and') {
      return node.args
        .map((arg) => arg.toString(options))
        .join(' & ');
    }
    if (node.type === 'OperatorNode' && node.fn === 'or') {
      return node.args
        .map((arg) => arg.toString(options))
        .join(' | ');
    }
    if (node.type === 'OperatorNode' && node.fn === 'xor') {
      let args = node.args
        .map((arg) => arg.toString(options))
        .join(', ');
      return `xor(${args})`;
    }
    if (node.type === 'OperatorNode' && node.fn === 'not') {
      let arg0 = node.args[0].toString(options, true);
      return `~${arg0}`;
    }
    // ternary operator
    if (node.type === 'ConditionalNode') {
      //console.log(node);
      
      let condition = node.condition.toString(options);
      let trueExpr = node.trueExpr.toString(options);
      let falseExpr = node.falseExpr.toString(options);

      return `tern__(${condition}, ${trueExpr}, ${falseExpr})`;
    }
  };

  return tree.toString({
    parenthesis: 'keep',
    implicit: 'show',   
    handler: matlabStringHandler
  });
};

module.exports = Expression;
