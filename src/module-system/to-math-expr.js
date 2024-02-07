
/*
  Transformation of json formatted <math> element to expression string.
  
  useParentheses = true is used when operators may require explicit parentheses (...)
*/
function _toMathExpr(element, useParentheses = false){
  let first = element.elements[0];
  if (element.name === 'math') {
    return _toMathExpr(element.elements[0]);
  } else if(element.name === 'apply' && first.name === 'gt') {
    let one = _toMathExpr(element.elements[1], true);
    let two = _toMathExpr(element.elements[2], true);
    return `${one} > ${two}`;
  } else if(element.name === 'apply' && first.name === 'geq') {
    let one = _toMathExpr(element.elements[1], true);
    let two = _toMathExpr(element.elements[2], true);
    return `${one} >= ${two}`;
  } else if(element.name === 'apply' && first.name === 'eq') {
    let one = _toMathExpr(element.elements[1], true);
    let two = _toMathExpr(element.elements[2], true);
    return `${one} == ${two}`;
  } else if(element.name === 'apply' && first.name === 'lt') {
    let one = _toMathExpr(element.elements[1], true);
    let two = _toMathExpr(element.elements[2], true);
    return `${one} < ${two}`;
  } else if(element.name === 'apply' && first.name === 'leq') {
    let one = _toMathExpr(element.elements[1], true);
    let two = _toMathExpr(element.elements[2], true);
    return `${one} <= ${two}`;
  } else if(element.name === 'apply' && first.name === 'neq') {
    let one = _toMathExpr(element.elements[1], true);
    let two = _toMathExpr(element.elements[2], true);
    return `${one} != ${two}`;
  } else if(element.name === 'apply' && first.name === 'and') {
    let args = element.elements.slice(1)
      .map((x) => _toMathExpr(x, true)).join(' and ');
    return args;
  } else if(element.name === 'apply' && first.name === 'or') {
    let args = element.elements.slice(1)
      .map((x) => _toMathExpr(x, true)).join(' or ');
    return args;
  } else if(element.name === 'apply' && first.name === 'xor') {
    let args = element.elements.slice(1)
      .map((x) => _toMathExpr(x, true)).join(' xor ');
    return args;
  } else if(element.name === 'apply' && first.name === 'not') {
    let one = _toMathExpr(element.elements[1], true);
    return `not ${one}`;
  } else if(element.name === 'apply' && first.name === 'times') {
    // A * B * C, <times>
    let expr = element.elements.slice(1) // without first element
      .map((x) => _toMathExpr(x, true)).join(' * '); 
    return useParentheses ? `(${expr})` : expr;
  } else if(element.name === 'apply' && first.name === 'divide') {
    // A / B, <divide> for two arguments
    let args = element.elements.slice(1)
      .map((x) => _toMathExpr(x, true));
    return args[0] + ' / ' + args[1]; 
  } else if(element.name === 'apply' && first.name === 'minus' && element.elements.length === 2) {
    // -A, <minus> for one argument
    let arg1 = element.elements[1];
    let expr = '-' + _toMathExpr(arg1, true);
    return `(${expr})`; // () cannot be skipped in 2d, 3d,... place of sum
  } else if(element.name === 'apply' && first.name === 'minus') {
    // A - B, <minus> for two argumets
    let arg0 = _toMathExpr(element.elements[1], false); // skip ()
    let arg1 = _toMathExpr(element.elements[2], true);
    let expr = arg0 + ' - ' + arg1;
    return useParentheses ? `(${expr})` : expr;
  } else if(element.name === 'apply' && first.name === 'plus') {
    // A + B + C, <plus>
    let expr = element.elements.slice(1)
      .map((x) => _toMathExpr(x, false)).join(' + '); // skip ()
    return useParentheses ? `(${expr})` : expr;
  } else if(element.name === 'apply' && first.name === 'power') {
    let expr = element.elements.slice(1)
      .map((x) => _toMathExpr(x)).join(', '); // skip ()
    return `pow(${expr})`;
  } else if(element.name === 'apply' && first.name === 'ceiling') {
    let args = element.elements.slice(1)
      .map((x) => _toMathExpr(x)); // skip ()
    return `ceil(${args[0]})`;
  } else if(element.name === 'apply' && first.name === 'root') {
    let degree = element.elements
      .find(y => y.name === 'degree');
    let args = element.elements.slice(1)
      .filter((x) => x.name !== 'degree')
      .map((x) => _toMathExpr(x)); // skip ()
    if (degree) {
      let n_element = degree.elements[0];
      let n = _toMathExpr(n_element, true);
      return `pow(${args[0]}, 1.0/${n})`;
    } else {
      return `sqrt(${args[0]})`;
    }
  } else if(element.name === 'apply' && first.name === 'ln') {
    let expr = element.elements.slice(1)
      .map((x) => _toMathExpr(x));  // skip ()
    return `ln(${expr[0]})`;
  } else if(element.name === 'apply' && first.name === 'log') {
    let logbase = element.elements
      .find(y => y.name === 'logbase');
    let expr = element.elements.slice(1)
      .filter((x) => x.name !== 'logbase')
      .map((x) => _toMathExpr(x)); // skip ()
    if (logbase === undefined) {
      return `log10(${expr[0]})`;
    } else if (logbase.elements[0]?.elements[0]?.text === '2') {
      return `log2(${expr[0]})`;
    } else {
      let base = _toMathExpr(logbase.elements[0]); // skip ()
      return `logbase(${expr[0]}, ${base})`;
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
  } else if (element.name === 'piecewise') { // return ternary if possible, or piecewise
    let args = [];
    // iterate through pieces
    element.elements
      .filter((x) => x.name === 'piece')
      .forEach((x) => {
        args.push(_toMathExpr(x.elements[0], false));
        args.push(_toMathExpr(x.elements[1], false));
      });
    let otherwise = element.elements
      .filter((x) => x.name === 'otherwise');
    if (otherwise.length > 0) {
      let otherwiseExpr = _toMathExpr(otherwise[0].elements[0], false);
      // in case of one piece and one otherwise
      if (args.length === 2) {
        return `(${args[1]} ? ${args[0]} : ${otherwiseExpr})`; // BRAKE
      }
      // all other cases
      args.push(otherwiseExpr);
    }

    return `piecewise(${args.join(', ')})`;
  } else if (element.name === 'apply' && (first.name === 'ci' || first.name === 'csymbol')) { // some user defined functions
    let funcName = _toMathExpr(first); // first.elements[0]?.text;
    let args = element.elements.slice(1)
      .map((x) => _toMathExpr(x)).join(', '); // skip ()
    return `${funcName}(${args})`;
  } else if (element.name === 'apply') { // all other internal mathml functions
    let args = element.elements.slice(1)
      .map((x) => _toMathExpr(x)).join(', ');
    return `${first.name}(${args})`;
  } else if (element.name === 'ci') {
    return element.elements[0]?.text;
  } else if (element.name === 'csymbol' && element.attributes?.definitionURL === 'http://www.sbml.org/sbml/symbols/time') {
    return 't';
  } else if (element.name === 'csymbol' && element.attributes?.definitionURL === 'http://www.sbml.org/sbml/symbols/delay') {
    // return 'delay';
    throw new Error('"delay" symbol in expression (SBML module) is not supported');
  } else if (element.name === 'csymbol') {
    return element.elements[0]?.text;
  } else if (element.name === 'cn' && element.attributes?.type === 'rational' && element.elements[1]?.name === 'sep') { // rational numbers: 1/1000
    let numerator = element.elements[0]?.text;
    let denominator = element.elements[2]?.text;
    let sign = (numerator >= 0 && denominator > 0) || (numerator <= 0 && denominator < 0)
      ? ''
      : '-';
    return `(${sign}${Math.abs(numerator)}/${Math.abs(denominator)})`;
  } else if (element.name === 'cn' && element.attributes?.type === 'e-notation' && element.elements[1]?.name === 'sep') { // rational numbers: 1.1*10^-3
    let mantissa = element.elements[0]?.text?.trim();
    let power = element.elements[2]?.text?.trim();
    return `(${mantissa}e${power})`;
  } else if (element.name === 'cn' && element.elements[0]?.text < 0) { // negative number requires (-2)
    return `(${element.elements[0]?.text})`;
  } else if (element.name === 'cn') { // regular positive numbers
    return element.elements[0]?.text;
  } else if (element.name === 'true') {
    return 'true';
  } else if (element.name === 'false') {
    return 'false';
  } else if (element.name === 'exponentiale') {
    return 'e';
  } else if (element.name === 'pi') {
    return 'pi';
  } else if (element.name === 'infinity') {
    return 'Infinity';
  } else if (element.name === 'notanumber') {
    return 'NaN';
  } else {
    throw new Error('Cannot parse MathML:' + JSON.stringify(element, null, 2));
  }
}

module.exports = _toMathExpr;