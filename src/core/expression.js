const math = require('mathjs');
const mathjsTranslate = require('mathjs-translate');
math.import(mathjsTranslate);
const mathjsCMathML = require('mathjs-cmathml');
math.import(mathjsCMathML);

const _ = require('lodash');
const { validator } = require('./utilities.js');
const { SchemaValidationError } = require('../exceptions');

class Expression {
  constructor(q){ // string or object
    Expression.isValid(q);
    if(typeof q==='string'){
      this._exprInput = q;
      this._inputLang = 'qs3p';
    }else{
      this._exprInput = q.expr;
      this._langInput = q.lang
        ? q.lang
        : 'qs3p';
    }
    this.exprParsed = math.parse(this._exprInput);
  }
  get expr(){
    return this.exprParsed.toString();
  }
  set expr(v){
    this._exprInput = v;
    this._langInput = 'qs3p';
    this.exprParsed = math.parse(this._exprInput);
  }
  get toCMathML(){
    return this.exprParsed
      .toCMathML()
      .toString();
  }
  static get schemaName(){
    return 'ExpressionInput';
  }
  get className(){
    return 'Expression';
  }
  toQ(){
    let res = _.pick(this, ['expr']);
    return res;
  }
  static isValid(q){
    let validate = validator
      .getSchema('http://qs3p.insilicobio.ru#/definitions/' + this.schemaName);
    let valid = validate(q);
    if(!valid) {
      throw new SchemaValidationError('Validation error!', validate.errors);
    }
  }
}

module.exports = {
  Expression
};
