const { Expression } = require('../core/expression');

const math = require('mathjs');
const mathjsMathML = require('mathjs-mathml');
math.import(mathjsMathML);

Expression.prototype.toCMathML = function(){
  return this.exprParsed
    .toCMathML();
};
