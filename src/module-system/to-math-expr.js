const _ = require('lodash');

function _toMathExpr(element, useParentheses = false){
  let first = _.get(element, 'elements.0');
  if (element.name === 'math') {
    return _toMathExpr(element.elements[0]);
  } else if(element.name === 'apply' && (first.name === 'gt' || first.name === 'geq' || first.name === 'eq')) {
    let one = _toMathExpr(element.elements[1], true);
    let two = _toMathExpr(element.elements[2], true);
    return `${one}-${two}`;
  } else if(element.name === 'apply' && (first.name === 'lt' || first.name === 'leq' || first.name === 'neq')) {
    let one = _toMathExpr(element.elements[1], true);
    let two = _toMathExpr(element.elements[2], true);
    return `${two}-${one}`;
  } else if(element.name === 'apply' && first.name === 'and') {
    let args = _.drop(element.elements)
      .map((x) => _toMathExpr(x, true)).join(', ');
    return `min(${args})`;
  } else if(element.name === 'apply' && first.name === 'or') {
    let args = _.drop(element.elements)
      .map((x) => _toMathExpr(x, true)).join(', ');
    return `max(${args})`;
  } else if(element.name === 'apply' && first.name === 'xor' && element.elements.length === 3) {
    let one = _toMathExpr(element.elements[1]);
    let two = _toMathExpr(element.elements[2]);
    return `max(min(${one}, -(${two})), min(-(${one}), ${two}))`;
  } else if(element.name === 'apply' && first.name === 'not') {
    let one = _toMathExpr(element.elements[1]);
    return `- (${one})`;
  } else if(element.name === 'apply' && first.name === 'times') {
    return _.drop(element.elements) // without first element
      .map((x) => _toMathExpr(x, true)).join(' * ');
  } else if(element.name === 'apply' && first.name === 'divide') {
    // A / B, <divide> for two arguments
    let args = _.drop(element.elements)
      .map((x) => _toMathExpr(x, true));
    return args[0] + ' / ' + args[1];
  } else if(element.name === 'apply' && first.name === 'minus' && element.elements.length === 2) {
    // -A, <minus> for one argement
    let arg1 = element.elements[1];
    let expr = '-' + _toMathExpr(arg1, true);
    return useParentheses ? `(${expr})` : expr;
  } else if(element.name === 'apply' && first.name === 'minus') {
    // A - B, <minus> for two argumets
    let args = _.drop(element.elements)
      .map((x) => _toMathExpr(x, true));
    let expr = args[0] + ' - ' + args[1];
    return useParentheses ? `(${expr})` : expr;
  } else if(element.name === 'apply' && first.name === 'plus') {
    let expr = _.drop(element.elements)
      .map((x) => _toMathExpr(x, true)).join(' + ');
    return useParentheses ? `(${expr})` : expr;
  } else if(element.name === 'apply' && first.name === 'power') {
    let expr = _.drop(element.elements)
      .map((x) => _toMathExpr(x, true)).join(', ');
    return `pow(${expr})`;
  } else if(element.name === 'apply' && first.name === 'ceiling') {
    let args = _.drop(element.elements)
      .map((x) => _toMathExpr(x, true));
    return `ceil(${args[0]})`;
  } else if(element.name === 'apply' && first.name === 'root') {
    let degree = element.elements
      .find(y => y.name === 'degree');
    let args = _.drop(element.elements)
      .filter((x) => x.name !== 'degree')
      .map((x) => _toMathExpr(x, true));
    if (degree) {
      let n_element = _.get(degree, 'elements.0');
      let n = _toMathExpr(n_element);
      return `nthRoot(${args[0]}, ${n})`;
    } else {
      return `sqrt(${args[0]})`;
    }
  } else if(element.name === 'apply' && first.name === 'ln') {
    let expr = _.drop(element.elements)
      .map((x) => _toMathExpr(x));
    return `ln(${expr[0]})`;
  } else if(element.name === 'apply' && first.name === 'log') {
    let logbase = element.elements
      .find(y => y.name === 'logbase');
    let expr = _.drop(element.elements)
      .filter((x) => x.name !== 'logbase')
      .map((x) => _toMathExpr(x));
    if (logbase === undefined) {
      return `log10(${expr[0]})`;
    } else if (_.get(logbase, 'elements.0.elements.0.text') === '2') {
      return `log2(${expr[0]})`;
    } else {
      let base = _toMathExpr(logbase.elements[0]);
      return `log(${expr[0]}, ${base})`;
    }
  // === trigonometry ===
  } else if (element.name === 'apply' && first.name === 'arcsin') {
    let arg = _toMathExpr(element.elements[1]);
    return `asin(${arg})`;
  } else if (element.name === 'apply' && first.name === 'arccos') {
    let arg = _toMathExpr(element.elements[1]);
    return `acos(${arg})`;
  } else if (element.name === 'apply' && first.name === 'arctan') {
    let arg = _toMathExpr(element.elements[1]);
    return `atan(${arg})`;
  } else if (element.name === 'apply' && first.name === 'arccot') {
    let arg = _toMathExpr(element.elements[1]);
    return `acot(${arg})`;
  } else if (element.name === 'apply' && first.name === 'arccsc') {
    let arg = _toMathExpr(element.elements[1]);
    return `acsc(${arg})`;
  } else if (element.name === 'apply' && first.name === 'arcsec') {
    let arg = _toMathExpr(element.elements[1]);
    return `asec(${arg})`;
  // hyperbolic arccsch(x)
  } else if (element.name === 'apply' && first.name === 'arcsinh') {
    let arg = _toMathExpr(element.elements[1]);
    return `asinh(${arg})`;
  } else if (element.name === 'apply' && first.name === 'arccosh') {
    let arg = _toMathExpr(element.elements[1]);
    return `acosh(${arg})`;
  } else if (element.name === 'apply' && first.name === 'arctanh') {
    let arg = _toMathExpr(element.elements[1]);
    return `atanh(${arg})`;
  } else if (element.name === 'apply' && first.name === 'arccoth') {
    let arg = _toMathExpr(element.elements[1]);
    return `acoth(${arg})`;
  } else if (element.name === 'apply' && first.name === 'arcsech') {
    let arg = _toMathExpr(element.elements[1]);
    return `asech(${arg})`;
  } else if (element.name === 'apply' && first.name === 'arccsch') {
    let arg = _toMathExpr(element.elements[1]);
    return `acsch(${arg})`;
  // === piecewise ===
  } else if (element.name === 'piecewise' && element.elements.length === 2) {
    let arg1 = _toMathExpr(_.get(element, 'elements.0.elements.0'));
    let arg2 = _toMathExpr(_.get(element, 'elements.1.elements.0'));
    let condName = _.get(first, 'elements.1.elements.0.name');
    let condElements = _.get(first, 'elements.1.elements');
    let condArgs = _.drop(condElements)
      .map((x) => _toMathExpr(x));
    if (condName === 'lt') {
      let cond = `${condArgs[1]} - ${condArgs[0]}`;
      return `ifg0(${cond}, ${arg1}, ${arg2})`;
    } else if (condName === 'gt') {
      let cond = `${condArgs[0]} - ${condArgs[1]}`;
      return `ifg0(${cond}, ${arg1}, ${arg2})`;
    } else if (condName === 'leq') {
      let cond = `${condArgs[1]} - ${condArgs[0]}`;
      return `ifge0(${cond}, ${arg1}, ${arg2})`;
    } else if (condName === 'geq') {
      let cond = `${condArgs[0]} - ${condArgs[1]}`;
      return `ifge0(${cond}, ${arg1}, ${arg2})`;
    } else if (condName === 'eq') {
      let cond = `${condArgs[0]} - ${condArgs[1]}`;
      return `ife0(${cond}, ${arg1}, ${arg2})`;
    } else if (condName === 'neq') {
      let cond = `${condArgs[0]} - ${condArgs[1]}`;
      return `ife0(${cond}, ${arg2}, ${arg1})`;
    } else {
      throw new Error('Error in translation MathML piecewise');
    }
  } else if (element.name === 'piecewise') {
    throw new Error('only one piece is supported in MathML peicewise.');
  } else if (element.name === 'apply' && (first.name === 'ci' || first.name === 'csymbol')) { // some user defined functions
    let funcName = _toMathExpr(first); // _.get(first, 'elements.0.text');
    let args = _.drop(element.elements)
      .map((x) => _toMathExpr(x)).join(', ');
    return `${funcName}(${args})`;
  } else if (element.name === 'apply') { // all other internal mathml functions
    let args = _.drop(element.elements)
      .map((x) => _toMathExpr(x)).join(', ');
    return `${first.name}(${args})`;
  } else if (element.name === 'ci') {
    return _.get(element, 'elements.0.text');
  } else if (element.name === 'csymbol' && _.get(element, 'attributes.definitionURL') === 'http://www.sbml.org/sbml/symbols/time') {
    return 't';
  } else if (element.name === 'csymbol' && _.get(element, 'attributes.definitionURL') === 'http://www.sbml.org/sbml/symbols/delay') {
    return 'delay';
  } else if (element.name === 'csymbol') {
    return _.get(element, 'elements.0.text');
  } else if (element.name === 'cn' && _.get(element, 'attributes.type') === 'rational' && _.get(element, 'elements.1.name') === 'sep') { // rational numbers: 1/1000
    let numerator = _.get(element, 'elements.0.text');
    let denominator = _.get(element, 'elements.2.text');
    let sign = (numerator >= 0 && denominator > 0) || (numerator <= 0 && denominator < 0)
      ? ''
      : '-';
    return `(${sign}${Math.abs(numerator)}/${Math.abs(denominator)})`;
  } else if (element.name === 'cn' && _.get(element, 'attributes.type') === 'e-notation' && _.get(element, 'elements.1.name') === 'sep') { // rational numbers: 1.1*10^-3
    let mantissa = _.get(element, 'elements.0.text').trim();
    let power = _.get(element, 'elements.2.text').trim();
    return `(${mantissa}e${power})`;
  } else if (element.name === 'cn' && _.get(element, 'elements.0.text') < 0) { // negative number requires (-2)
    return `(${_.get(element, 'elements.0.text')})`;
  } else if (element.name === 'cn') { // regular positive numbers
    return _.get(element, 'elements.0.text');
  } else if (element.name === 'true') {
    return '1';
  } else if (element.name === 'false') {
    return '-1';
  } else if (element.name === 'exponentiale') {
    return 'e';
  } else if (element.name === 'pi') {
    return 'pi';
  } else if (element.name === 'infinity') {
    return 'Infinity';
  } else if (element.name === 'notanumber') {
    return 'NaN';
  } else {
    throw new Error('Cannot parse MathML:' + element);
  }
}

module.exports = _toMathExpr;