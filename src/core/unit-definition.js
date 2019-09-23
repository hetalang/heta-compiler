const _ = require('lodash');
const { _Simple } = require('./_simple');

class UnitDefinition extends _Simple {
  constructor(q = {}){
    super(q);
    this.components = []; // default
  }
  merge(q, skipChecking){
    if(!skipChecking) UnitDefinition.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.components) this.components = q.components;

    return this;
  }
  toQ(){
    let res = super.toQ();
    if(this.components.length>0)
      res.components = this.components.map((component) => {
        return _.cloneDeep(component);
      });

    return res;
  }
}

module.exports = {
  UnitDefinition
};
