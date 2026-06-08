const { Expression } = require('../core/expression');

const { cMathMLHandler } = require('mathjs-mathml');

const csymbols = {
  t: 'http://www.sbml.org/sbml/symbols/time'
};

// Custom handler for user defined functions in SBML
// use <ci>fun1</ci> instead of <fun1/>
function sbmlCMathMLHandler(node, options = {}) {
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
