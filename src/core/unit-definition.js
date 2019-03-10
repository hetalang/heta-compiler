const _ = require('lodash');
const { _Simple } = require('./_simple');

class UnitDefinition extends _Simple {
  constructor(ind){
    super(ind);
    this.components = []; // default
  }
  merge(q, skipChecking){
    if(!skipChecking) UnitDefinition.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.components) this.components = q.components;

    return this;
  }
  static get schemaName(){
    return 'UnitDefinitionP';
  }
  get className(){
    return 'UnitDefinition';
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
