const _ = require('lodash');
const { _Component } = require('./_component');

class UnitDef extends _Component {
  constructor(){
    super();
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
