const _ = require('lodash');
const { _Component } = require('./_component');

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
    this.components = []; // default
  }
  merge(q, skipChecking){
    if(!skipChecking) UnitDef.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.components) this.components = q.components;

    return this;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if(this.components.length>0)
      res.components = this.components.map((component) => {
        return _.cloneDeep(component);
      });

    return res;
  }
}

module.exports = {
  UnitDef
};
