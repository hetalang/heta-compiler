const { _Simple } = require('./_simple');
const { Variable } = require('./variable');
const { validator } = require('./utilities.js');

class Quantity extends _Simple {
  constructor(q){
    super(q);
    Quantity.isValid(q);

    this.variable = new Variable(q.variable);
    this.variable.parent = this; // this is cyclic ref
  }
  static get schemaName(){
    return 'QuantityQ';
  }
  get className(){
    return 'Quantity';
  }
  toQ(){
    let res = super.toQ();
    res.variable = this.variable.toQ();
    return res;
  }
}

module.exports = {
  Quantity
};
