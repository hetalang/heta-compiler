const _ = require('lodash');
const { _Simple } = require('./_simple');
const { Compartment } = require('./compartment');
const { Species } = require('./species');
const { Reaction } = require('./reaction');
const { Quantity } = require('./quantity');
const { exception } = require('../exceptions');

class Scene extends _Simple {
  constructor(){
    super();
  }
  merge(q){
    Scene.isValid(q);
    super.merge(q);
    // this._storage;

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
  getUniqueUnits(){
    return _.chain(this.getQuantities())
      .filter((quantity) => quantity.variable.units)
      .uniqBy((quantity) => quantity.unitsHash)
      .value();
  }
  getQuantities(){
    return this._storage.filter((component) => {
      return (component instanceof Quantity) && component.space===this.scope;
    });
  }
  check(){
    this
      .getQuantities()
      .forEach((quantity, i, array) => {
        // check compartmentRef in Species
        if(quantity instanceof Species){
          if(!quantity.compartmentRef)
            exception(`compartmentRef is not set for ${quantity.index}`);
          let target = array.find((x) => x.id===quantity.compartmentRef);
          if(!target)
            exception(`compartmentRef reffered to absent value "${quantity.compartmentRef}"`);
          if(!(target instanceof Compartment))
            exception(`compartmentRef reffered to not a compartment "${quantity.compartmentRef}"`);
        }
        // check targetRef in Reactions
        if(quantity instanceof Reaction){
          quantity.actors.forEach((actor) => {
            let target = array.find((x) => x.id===actor.targetRef);
            if(!target)
              exception(`targetRef reffered to absent value "${actor.targetRef}" in reaction ${quantity.index}`);
            if(!(target instanceof Species))
              exception(`targetRef reffered to not a Species "${actor.targetRef}" in reaction ${quantity.index}`);
          });
          quantity.effectors.forEach((effector) => {
            let target = array.find((x) => x.id===effector.targetRef);
            if(!target)
              exception(`targetRef reffered to absent value "${effector.targetRef}" in reaction ${quantity.index}`);
            if(!(target instanceof Species))
              exception(`targetRef reffered to not a Species "${effector.targetRef}" in reaction ${quantity.index}`);
          });
        }
      });

    return this;
  }
  populate(){
    this
      .getQuantities()
      .forEach((quantity, i, array) => {
        // check compartmentRef in Species
        if(quantity instanceof Species) {
          if(!quantity.compartmentRef) {
            exception(`compartmentRef is not set for ${quantity.index}`);
          }else{
            let target = array.find((x) => x.id===quantity.compartmentRef);
            if(!target) {
              exception(`compartmentRef reffered to absent value "${quantity.compartmentRef}"`);
              if(!(target instanceof Compartment)) {
                exception(`compartmentRef reffered to not a compartment "${quantity.compartmentRef}"`);
              }else{
                quantity.compartment = target;
              }
            }
          }
        }
        // check targetRef in Reactions
        if(quantity instanceof Reaction){
          quantity.actors.forEach((actor) => {
            let target = array.find((x) => x.id===actor.targetRef);
            if(!target) {
              exception(`targetRef reffered to absent value "${actor.targetRef}" in reaction ${quantity.index}`);
            } else {
              if(!(target instanceof Species)) {
                exception(`targetRef reffered to not a Species "${actor.targetRef}" in reaction ${quantity.index}`);
              } else {
                actor.target = target;
              }
            }
          });
          quantity.effectors.forEach((effector) => {
            let target = array.find((x) => x.id===effector.targetRef);
            if(!target) {
              exception(`targetRef reffered to absent value "${effector.targetRef}" in reaction ${quantity.index}`);
            } else {
              if(!(target instanceof Species)) {
                exception(`targetRef reffered to not a Species "${effector.targetRef}" in reaction ${quantity.index}`);
              } else {
                effector.target = target;
              }
            }
          });
        }
      });

    return this;
  }
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
