const { Expression } = require('../core/expression');

const { cMathMLHandler } = require('mathjs-mathml');

const csymbols = {
  t: 'http://www.sbml.org/sbml/symbols/time'
};

// Custom handler for user defined functions in SBML
// use <ci>fun1</ci> instead of <fun1/>
function sbmlCMathMLHandler(node, options = {}) {
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
