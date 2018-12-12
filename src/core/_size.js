const _ = require('lodash');
const { validator } = require('./utilities.js');

class _Size {
  static isValid(q){
    let validate = validator
      .getSchema('http://qs3p.insilicobio.ru#/definitions/' + this.schemaName);
    let valid = validate(q);
    if(!valid) {
      console.log(validate.errors);  // TODO: delete later
      throw new Error('Validation error!');
    }
  }
}

class Numeric extends _Size {
  constructor(q){ // numeric or object
    super(q);
    if(typeof q==='number'){
      this.num = q;
      this.free = false;
    }else{
      Numeric.isValid(q);
      this.num = q.num;
      this.free = q.free
        ? q.free
        : false;
    }
  }
  static get schemaName(){
    return 'NumericQ';
  }
  get className(){
    return 'Numeric';
  }
  toQ(){
    let res = _.pick(this, ['num', 'free']);
    return res;
  }
}

class Expression extends _Size {
  constructor(q){ // string or object
    super(q);
    if(typeof q==='string'){
      this._exprInput = q;
      this._inputLang = 'qs3p';
    }else{
      Expression.isValid(q);
      this._exprInput = q.expr;
      this._inputLang = q.lang
        ? q.lang
        : 'qs3p';
    }
  }
  get expr(){
    return this._exprInput;
  }
  static get schemaName(){
    return 'ExpressionQ';
  }
  get className(){
    return 'Expression';
  }
  toQ(){
    let res = _.pick(this, ['expr']);
    return res;
  }
}

module.exports = {
  Numeric,
  Expression
};
