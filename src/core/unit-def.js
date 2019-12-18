const _ = require('lodash');
const { _Component } = require('./_component');
const { Unit } = require('./unit');

/*
  example: xxx = nM / kg3
  xxx @UnitDef { components: [
    { kind: nM, multiplier: 1, exponent: 1 },
    { kind: kg, multiplier: 1, exponent: -3 }
  ]};
*/
class UnitDef extends _Component {
  constructor(isCore = false){
    super(isCore);
  }
  merge(q = {}, skipChecking){
    if(!skipChecking) UnitDef.isValid(q);
    super.merge(q, skipChecking);

    if(q.components) this.components = Unit.fromQ(q.components);

    return this;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if(this.components.length>0){
      res.components = this.components.toQ(options);
    }

    return res;
  }
}

module.exports = {
  UnitDef
};
