const { Expression } = require('../core/expression');

const NUM_NAN = { num: 'NaN' };
const NUM_POSITIVE_INFINITY = { num: '+Infinity' };
const NUM_NEGATIVE_INFINITY = { num: '-Infinity' };

const OPERATOR_MAP = {
  larger: 'Greater',
  largerEq: 'GreaterEqual',
  smaller: 'Less',
  smallerEq: 'LessEqual',
  equal: 'Equal',
  unequal: 'NotEqual',
  and: 'And',
  or: 'Or',
  xor: 'Xor',
};

const FUNCTION_MAP = {
  abs: 'Abs',
  ceil: 'Ceil',
  cos: 'Cos',
  csc: 'Csc',
  cot: 'Cot',
  exp: 'Exp',
  factorial: 'Factorial',
  floor: 'Floor',
  log2: 'Lb',
  log10: 'Lg',
  max: 'Max',
  min: 'Min',
  sec: 'Sec',
  sign: 'Sign',
  sin: 'Sin',
  sqrt: 'Sqrt',
  tan: 'Tan',
  acos: 'Arccos',
  acot: 'Arccot',
  acsc: 'Arccsc',
  asec: 'Arcsec',
  asin: 'Arcsin',
  atan: 'Arctan',
};

function flattenAssociative(operator, operands) {
  const flat = [];

  for (const operand of operands) {
    const converted = _toMathJSON(operand);
    if (Array.isArray(converted) && converted[0] === operator) {
      flat.push(...converted.slice(1));
    } else {
      flat.push(converted);
    }
  }

  return [operator, ...flat];
}

function makeComparison(operator, args) {
  return [operator, ...args.map(_toMathJSON)];
}

function makeIf(operator, args) {
  const [left, right, whenTrue, whenFalse] = args;
  return ['If', [operator, _toMathJSON(left), _toMathJSON(right)], _toMathJSON(whenTrue), _toMathJSON(whenFalse)];
}

function piecewiseToMathJSON(args) {
  const hasOtherwise = args.length % 2 === 1;
  const otherwise = hasOtherwise ? _toMathJSON(args[args.length - 1]) : NUM_NAN;
  const pairs = hasOtherwise ? args.slice(0, -1) : args;

  if (pairs.length === 2) {
    return ['If', _toMathJSON(pairs[1]), _toMathJSON(pairs[0]), otherwise];
  }

  const items = ['Which'];
  for (let index = 0; index < pairs.length; index += 2) {
    items.push(_toMathJSON(pairs[index + 1]));
    items.push(_toMathJSON(pairs[index]));
  }
  items.push('True');
  items.push(otherwise);

  return items;
}

function functionToMathJSON(node) {
  const functionName = node.fn.name;
  const args = node.args;

  if (functionName === 'add') {
    return flattenAssociative('Add', args);
  }
  if (functionName === 'subtract') {
    return ['Add', _toMathJSON(args[0]), ['Negate', _toMathJSON(args[1])]];
  }
  if (functionName === 'multiply') {
    return flattenAssociative('Multiply', args);
  }
  if (functionName === 'divide') {
    return ['Divide', _toMathJSON(args[0]), _toMathJSON(args[1])];
  }
  if (functionName === 'pow') {
    return ['Power', _toMathJSON(args[0]), _toMathJSON(args[1])];
  }
  if (functionName === 'square') {
    return ['Square', _toMathJSON(args[0])];
  }
  if (functionName === 'cube') {
    return ['Power', _toMathJSON(args[0]), 3];
  }
  if (functionName === 'nthRoot') {
    return ['Root', _toMathJSON(args[0]), _toMathJSON(args[1])];
  }
  if (functionName === 'ln' || functionName === 'log') {
    return ['Ln', _toMathJSON(args[0])];
  }
  if (functionName === 'logbase') {
    return ['Log', _toMathJSON(args[0]), _toMathJSON(args[1])];
  }
  if (functionName === 'ifgt') {
    return makeIf('Greater', args);
  }
  if (functionName === 'ifge') {
    return makeIf('GreaterEqual', args);
  }
  if (functionName === 'iflt') {
    return makeIf('Less', args);
  }
  if (functionName === 'ifle') {
    return makeIf('LessEqual', args);
  }
  if (functionName === 'ifeq') {
    return makeIf('Equal', args);
  }
  if (functionName === 'piecewise') {
    return piecewiseToMathJSON(args);
  }
  if (FUNCTION_MAP[functionName]) {
    return [FUNCTION_MAP[functionName], ...args.map(_toMathJSON)];
  }

  return [functionName, ...args.map(_toMathJSON)];
}

function _toMathJSON(node) {
  if (node.type === 'ParenthesisNode') {
    return _toMathJSON(node.content);
  }

  if (node.type === 'ConditionalNode') {
    return ['If', _toMathJSON(node.condition), _toMathJSON(node.trueExpr), _toMathJSON(node.falseExpr)];
  }

  if (node.type === 'ConstantNode') {
    if (typeof node.value === 'boolean') {
      return node.value ? 'True' : 'False';
    }
    if (Number.isNaN(node.value)) {
      return NUM_NAN;
    }
    if (node.value === Infinity) {
      return NUM_POSITIVE_INFINITY;
    }
    if (node.value === -Infinity) {
      return NUM_NEGATIVE_INFINITY;
    }

    return node.value;
  }

  if (node.type === 'SymbolNode') {
    if (node.name === 'pi') {
      return 'Pi';
    }
    if (node.name === 'e') {
      return 'ExponentialE';
    }

    return node.name;
  }

  if (node.type === 'OperatorNode') {
    if (node.fn === 'unaryPlus') {
      return _toMathJSON(node.args[0]);
    }
    if (node.fn === 'unaryMinus') {
      const operand = _toMathJSON(node.args[0]);
      if (typeof operand === 'number') {
        return -operand;
      }
      if (operand && operand.num === '+Infinity') {
        return NUM_NEGATIVE_INFINITY;
      }
      if (operand && operand.num === 'NaN') {
        return NUM_NAN;
      }
      return ['Negate', operand];
    }
    if (node.fn === 'add') {
      return flattenAssociative('Add', node.args);
    }
    if (node.fn === 'subtract') {
      return ['Add', _toMathJSON(node.args[0]), ['Negate', _toMathJSON(node.args[1])]];
    }
    if (node.fn === 'multiply') {
      return flattenAssociative('Multiply', node.args);
    }
    if (node.fn === 'divide') {
      return ['Divide', _toMathJSON(node.args[0]), _toMathJSON(node.args[1])];
    }
    if (node.fn === 'pow') {
      return ['Power', _toMathJSON(node.args[0]), _toMathJSON(node.args[1])];
    }
    if (node.fn === 'not') {
      return ['Not', _toMathJSON(node.args[0])];
    }
    if (OPERATOR_MAP[node.fn]) {
      const mathJsonOperator = OPERATOR_MAP[node.fn];
      if (mathJsonOperator === 'And' || mathJsonOperator === 'Or' || mathJsonOperator === 'Xor') {
        return flattenAssociative(mathJsonOperator, node.args);
      }
      return makeComparison(mathJsonOperator, node.args);
    }
  }

  if (node.type === 'FunctionNode') {
    return functionToMathJSON(node);
  }

  throw new TypeError(`Unsupported MathExpr node for MathJSON export: ${node.type}`);
}

Expression.prototype.toMathJSON = function() {
  return _toMathJSON(this.exprParsed);
};
