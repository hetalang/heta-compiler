const { _Scoped } = require('./_scoped');
const { Numeric } = require('./numeric');
const { Expression } = require('./expression');
const { UnitsParser, qspUnits } = require('units-parser');
let uParser = new UnitsParser(qspUnits);
const _ = require('lodash');

class Quantity extends _Scoped {
  constructor(ind){
    super(ind);
    /*
    this.variable = {
      kind: 'static',
      size: new Numeric(0)
    };
    */
    // this.variable.parent = this; // this is cyclic ref

  }
  merge(q, skipChecking){
    if(!skipChecking) Quantity.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.variable){
      this.variable = { kind: q.variable.kind };
      if(q.variable.units!==undefined) this.variable.units = q.variable.units;
      let size = q.variable.size;
      if(typeof size === 'number'){
        this.variable.size = new Numeric(size, true); // skip checking because already checked
      }else if(typeof size === 'string'){
        this.variable.size = new Expression(size, true);
      }else if('num' in size){
        this.variable.size = new Numeric(size, true);
      }else if('expr' in size){
        this.variable.size = new Expression(size, true);
      }else{
        // if code is OK never throws
        throw new Error('Wrong Variable argument.');
      }
    }

    return this;
  }
  static get schemaName(){
    return 'QuantityP';
  }
  get className(){
    return 'Quantity';
  }
  toQ(){
    let res = super.toQ();
    res.variable = _.pick(this.variable, ['kind', 'units']);
    res.variable.size = this.variable.size.toQ();
    return res;
  }
  get unitsHash(){
    if(this.variable.units){
      return uParser
        .parse(this.variable.units)
        .toHash();
    }else{
      return;
    }
  }
}

module.exports = {
  Quantity
};
