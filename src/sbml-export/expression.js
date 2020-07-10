const { Expression } = require('../core/expression');

const math = require('mathjs');
const mathjsMathML = require('mathjs-mathml');
math.import(mathjsMathML);

const csymbols = {
  t: 'http://www.sbml.org/sbml/symbols/time'
};

Expression.prototype.toCMathML = function(){

  return this.exprParsed
    .toCMathML(csymbols);
};
