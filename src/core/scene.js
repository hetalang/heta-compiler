const _ = require('lodash');
const { _Simple } = require('./_simple');
const { Compartment } = require('./compartment');
const { Species } = require('./species');
const { Reaction } = require('./reaction');
const { Quantity } = require('./quantity');

class Scene extends _Simple {
  constructor(q){
    super(q);
    Scene.isValid(q);

    this.filter = q.filter
      ? q.filter
      : {};
    this._components = {};
  }
  get className(){
    return 'Scene';
  }
  static get schemaName(){
    return 'SceneQ';
  }
  getVariable(id){
    return this._components[id];
  }
  add(obj){
    if(!(obj instanceof Quantity)){
      throw new Error('Only "Quantity" object can be added to scene.');
    }
    if(_.keys(this._components).indexOf(obj.variable.id)!==-1){
      throw new Error(`"id" ${obj.variable.id} must be unique.`);
    }
    this._components[obj.variable.id] = obj.variable;
    return this;
  }
  populate(){ // TODO: currently filter in off
    this.container._storage
      .filter((simple) => simple instanceof Quantity)
      .forEach((simple) => {
        if(this._components[simple.variable.id]!==undefined){
          throw new Error(`Non-unique "id" ${simple.variable.id} inside scene.`);
        }
        this._components[simple.variable.id] = simple.variable;
      });
  }
  getUniqueUnits(){
    return _.chain(this._components)
      .filter((variable) => variable.units)
      .uniqBy((variable) => variable.unitsHash)
      .value();
  }
  checkReferences(){
    _.forEach(this._components, (quantity) => {
      // check compartment in Species
      if(quantity.parent instanceof Species){
        let compartmentVariable = this._components[quantity.parent.compartmentRef];
        if(compartmentVariable===undefined){
          throw new Error(
            `"compartmentRef" ${quantity.parent.compartmentRef} is not found inside scene.`
          );
        }
        if(!(compartmentVariable.parent instanceof Compartment)){
          throw new Error(
            `"compartmentRef" ${quantity.parent.compartmentRef} reffered not to "Compartment".`
          );
        }
      }
      // check reactions
      if((quantity.parent instanceof Reaction) && quantity.parent.actors!==undefined){
        quantity.parent.actors.forEach((actor) => {
          let actorVariable = this._components[actor.targetRef];
          if(actorVariable===undefined){
            throw new Error(`"targetRef" ${actor.targetRef} is not found inside scene.`);
          }
          if(!(actorVariable.parent instanceof Species)){
            throw new Error(`"targetRef" ${actor.targetRef} reffered not to "Species".`);
          }
        });
      }
      if((quantity.parent instanceof Reaction) && quantity.parent.effectors!==undefined){
        quantity.parent.effectors.forEach((effector) => {
          let effectorVariable = this._components[effector.targetRef];
          if(effectorVariable===undefined){
            throw new Error(`"targetRef" ${effector.targetRef} is not found inside scene.`);
          }
          if(!(effectorVariable.parent instanceof Species)){
            throw new Error(`"targetRef" ${effector.targetRef} reffered not to "Species".`);
          }
        });
      }
    });
    return true;
  }
  toQ(){
    let res = super.toQ();
    res.filter = this.filter;
    return res;
  }
}

module.exports = {
  Scene
};
