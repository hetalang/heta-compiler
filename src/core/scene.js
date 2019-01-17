const _ = require('lodash');
const { _Simple } = require('./_simple');
const { Compartment } = require('./compartment');
const { Species } = require('./species');
const { Reaction } = require('./reaction');
const { Quantity } = require('./quantity');

class Scene extends _Simple {
  constructor(){
    super();
    //this._variables = [];
  }
  merge(q){
    // Scene.isValid(q);
    super.merge(q);

    if(q && q.scope) this.scope = q.scope;
    if(q && q.type) this.type = q.type;
    if(q && q.method) this.method = q.method;

    return this;
  }
  get className(){
    return 'Scene';
  }
  static get schemaName(){
    return 'SceneQ';
  }
  /*
  getUniqueUnits(){
    return _.chain(this._components)
      .filter((variable) => variable.units)
      .uniqBy((variable) => variable.unitsHash)
      .value();
  }
  */
  toQ(){
    let res = super.toQ();
    if(this.scope) res.scope = this.scope;
    if(this.type) res.type = this.type;
    if(this.method) res.method = this.method;

    return res;
  }
}

module.exports = {
  Scene
};
