const { Expression } = require('../core/expression');

const math = require('mathjs');
const mathjsMathML = require('mathjs-mathml');
math.import(mathjsMathML);

const csymbols = {
  t: 'http://www.sbml.org/sbml/symbols/time'
};

Expression.prototype.toCMathML = function(skipHeader = false){

  return !skipHeader
    ? this.exprParsed.toCMathML(csymbols)
    : this.exprParsed.toCMathMLNode(csymbols); // without <math>...</math>
};
