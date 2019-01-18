const { _Simple } = require('./_simple');
const { Numeric, Expression } = require('./_size');
const _ = require('lodash');

class Quantity extends _Simple {
  constructor(){
    super();

    this.variable = {
      kind: 'static',
      size: new Numeric(0)
    };
    this.variable.parent = this; // this is cyclic ref

  }
  merge(q){
    // Quantity.isValid(q);

    super.merge(q);
    if(q && q.variable && q.variable.kind!==undefined) this.variable.kind = q.variable.kind;
    if(q && q.variable && q.variable.units!==undefined) this.variable.units = q.variable.units;

    let size = _.get(q, 'variable.size');
    if(size){
      if(size instanceof Numeric || size instanceof Expression){
        this.variable.size = size;
      }else if(typeof size === 'number'){
        this.variable.size = new Numeric(size);
      }else if(typeof size === 'string'){
        this.variable.size = new Expression(size);
      }else if('num' in size){
        this.size = new Numeric(size);
      }else if('expr' in size){
        this.size = new Expression(size);
      }else{
        // if code is OK never throws
        throw new Error('Wrong Variable argument.');
      }
    }

    return this;
  }
  static get schemaName(){
    return 'QuantityQ';
  }
  get className(){
    return 'Quantity';
  }
  get index(){
    return {id: this.id, space: this.space};
  }
  toQ(){
    let res = super.toQ();
    res.space = this.space;
    res.variable = _.pick(this.variable, ['kind', 'units']);
    res.variable.size = this.variable.size.toQ();
    return res;
  }
}

module.exports = {
  Quantity
};
