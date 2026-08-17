const { Expression } = require('../core/expression');

const { cMathMLHandler } = require('mathjs-mathml');

const csymbols = {
  t: 'http://www.sbml.org/sbml/symbols/time'
};

const MATHML_INVERSE_TRIGONOMETRIC_OPERATORS = {
  asin: 'arcsin',
  acos: 'arccos',
  atan: 'arctan',
  acot: 'arccot',
  acsc: 'arccsc',
  asec: 'arcsec',
};

// Custom handler for user defined functions in SBML
// use <ci>fun1</ci> instead of <fun1/>
function sbmlCMathMLHandler(node, options = {}) {
  if (node.type === 'FunctionNode' && MATHML_INVERSE_TRIGONOMETRIC_OPERATORS[node.fn.name]) {
    const operator = MATHML_INVERSE_TRIGONOMETRIC_OPERATORS[node.fn.name];
    const args = node.args
      .map((arg) => arg.toString({ ...options, handler: sbmlCMathMLHandler }))
      .join('');
    return `<apply><${operator}/>${args}</apply>`;
  }

  // sign is not part of the MathML subset permitted by SBML Level 2.
  if (node.type === 'FunctionNode' && node.fn.name === 'sign' && node.fnObj?.isCore) {
    const x = node.args[0].toString({ ...options, handler: sbmlCMathMLHandler });
    return `<piecewise><piece><cn>-1</cn><apply><lt/>${x}<cn>0</cn></apply></piece><piece><cn>1</cn><apply><gt/>${x}<cn>0</cn></apply></piece><otherwise><cn>0</cn></otherwise></piecewise>`;
  }

  if (node.type === 'FunctionNode' && node.fnObj && !node.fnObj.isCore) {
    let args = node.args
      .map((arg) => arg.toString({ ...options, handler: sbmlCMathMLHandler }))
      .join('');

    return `<apply><ci>${node.fn.name}</ci>${args}</apply>`;
  }

  return cMathMLHandler(node, { ...options, handler: sbmlCMathMLHandler });
}

Expression.prototype.toCMathML = function(skipHeader = false){
  let baseMathML = this.exprParsed
    .toString({ handler: sbmlCMathMLHandler, csymbols: csymbols });

  return !skipHeader
    ? `<math xmlns="http://www.w3.org/1998/Math/MathML">${baseMathML}</math>`
    : baseMathML;
};
