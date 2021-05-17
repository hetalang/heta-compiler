const { Expression } = require('../core/expression');

const { cMathMLHandler } = require('mathjs-mathml');

const csymbols = {
  t: 'http://www.sbml.org/sbml/symbols/time'
};

Expression.prototype.toCMathML = function(skipHeader = false){
  let baseMathML = this.exprParsed
    .toString({ handler: cMathMLHandler, csymbols: csymbols });

  return !skipHeader
    ? `<math xmlns="http://www.w3.org/1998/Math/MathML">${baseMathML}</math>`
    : baseMathML;
};
