const _ = require('lodash');
const { validator } = require('./utilities.js');
const { SchemaValidationError } = require('../exceptions');

class Numeric {
  constructor(q, skipChecking){ // number or object
    // super(q);
    if(!skipChecking) Numeric.isValid(q);
    if(typeof q==='number'){
      this.num = q;
      this.free = false;
    }else{
      this.num = q.num;
      this.free = q.free
        ? q.free
        : false;
    }
  }
  get toCMathML(){
    return `<math xmlns="http://www.w3.org/1998/Math/MathML"><cn>${this.num}</cn></math>`;
  }
  static get schemaName(){
    return 'NumericInput';
  }
  get className(){
    return 'Numeric';
  }
  toQ(){
    let res = { num: this.num };
    if(this.free) res.free = this.free;
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
  Numeric
};
