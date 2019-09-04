const { IndexedHetaError } = require('./heta-error');
const { Record } = require('./core/record');
const { Compartment } = require('./core/compartment');
const { Species } = require('./core/species');
const { Reaction } = require('./core/reaction');
const { Process } = require('./core/process');
const { ContinuousSwitcher } = require('./core/continuous-switcher');
const { TimeSwitcher } = require('./core/time-switcher');
const { ReferenceDefinition } = require('./core/reference-definition');
const { UnitDefinition } = require('./core/reference-definition');
const { Page } = require('./core/page');
const { Const } = require('./core/const');
const _ = require('lodash');
const { _Export, JSONExport } = require('./core/_export');
const { getIndexFromQ } = require('./common');

class Container {
  constructor(){
    this.storage = new Map();
  }
  insert(q){
    // check
    if(!q)
      throw new IndexedHetaError(q, JSON.stringify(q));
    if(!q.id || (typeof q.id !== 'string'))
      throw new IndexedHetaError(q, `Id should be string, but have "${q.id}"`);
    if(!q.class || typeof q.class !== 'string')
      throw new IndexedHetaError(q, `No class or unsuitable class for "insert": ${q.class}`);
    // check if class is in the list
    let selectedClass = this.classes[q.class];
    if(selectedClass===undefined)
      throw new IndexedHetaError(q, `Unknown class "${q.class}" for the element.`);
    let simple = (new selectedClass({id: q.id, space: q.space})).merge(q);

    this.storage.set(simple.index, simple);
    if(simple instanceof _Export) { // include storage
      simple._storage = this.storage;
      simple._container = this;
    }

    return simple;
  }
  update(q){
    if(!q)
      throw new IndexedHetaError(q, JSON.stringify(q));
    if(!q.id || (typeof q.id !== 'string')){
      throw new IndexedHetaError(q, `Id should be string, but have "${q.id}"`);
    }
    if(q.class)
      throw new IndexedHetaError(q, `Class property is not allowed for "update": ${q.class}`);
    let index = getIndexFromQ(q);
    let targetComponent = this.storage.get(index);

    // creation of new components is not allowed
    if(targetComponent===undefined)
      throw new IndexedHetaError(q, 'Element with the index is not exist which is not allowed for "update" strategy.');

    targetComponent.merge(q);

    return targetComponent;
  }
  upsert(q){
    if('class' in q){
      return this.insert(q);
    }else{
      return this.update(q);
    }
  }
  delete(q){
    if(!q)
      throw new IndexedHetaError(q, JSON.stringify(q));
    if(!q.id || (typeof q.id !== 'string'))
      throw new IndexedHetaError(q, `Id should be string, but have "${q.id}"`);
    if(q.class)
      throw new IndexedHetaError(q, `Class property is not allowed for "delete": ${q.class}`);
    let index = getIndexFromQ(q);
    let targetComponent = this.storage.delete(index);
    if(!targetComponent) // if targetComponent===false, element is not exist
      throw new IndexedHetaError(q, 'Element with index is not exist and cannot be deleted.');

    return targetComponent; // true or false
  }
  select(q){
    if(!q)
      throw new IndexedHetaError(q, JSON.stringify(q));
    if(!q.id || (typeof q.id !== 'string'))
      throw new IndexedHetaError(q, `Id should be string, got "${q.id}"`);
    let index = getIndexFromQ(q);
    return this.storage.get(index);
  }
  load(q){
    // estimate action, default is upsert
    let actionName = _.get(q, 'action', 'upsert');
    // do action
    return this[actionName](q);
  }
  loadMany(qArr){
    qArr.forEach((q) => this.load(q));
    return this;
  }
  toQArr(){
    let qArr = [...this.storage]
      .map((obj) => obj[1].toQ());
    return qArr;
  }
  toJSON(){
    return JSON.stringify(this.toQArr(), null, 2);
  }
  get length(){
    return this.storage.size;
  }
  setReferences(){
    // add compartment ref for Species
    [...this.storage].map((x) => x[1])
      .filter((x) => x instanceof Species)
      .forEach((species) => {
        if(!species.compartment)
          throw new IndexedHetaError(species.indexObj, 'No "compartment" prop for Species.');
        let compartment = this.select({id: species.compartment, space: species.space});
        if(!compartment)
          throw new IndexedHetaError(species.indexObj, `Property "compartment" has lost reference "${species.compartment}".`);
        if(compartment.className!=='Compartment')
          throw new IndexedHetaError(species.indexObj, `"compartment" prop reffered not to Compartment but ${compartment.className} for Species.`);
        species.compartmentObj = compartment;
      });

    // add record ref for Process.actors
    [...this.storage].map((x) => x[1])
      .filter((x) => x instanceof Process)
      .forEach((process) => {
        process.actors.forEach((actor) => {
          // checking target
          let target = this.select({id: actor.target, space: process.space});
          if(!target)
            throw new IndexedHetaError(process.indexObj, `Property "target" has lost reference "${actor.target}".`);
          if(!(target instanceof Record))
            throw new IndexedHetaError(process.indexObj, `"target" prop reffered not to Record but ${target.className} for Process.`);
          actor._target_ = target;
          // create ode expression
          target.backReferences.push({
            process: process.id,
            _process_: process,
            stoichiometry: actor.stoichiometry
          });
        });
      });

    // check Reactions
    [...this.storage].map((x) => x[1])
      .filter((x) => x instanceof Reaction)
      .forEach((reaction) => {
        reaction.actors.forEach((actor) => { // check ref objects for actors
          if(!(actor._target_ instanceof Species))
            throw new IndexedHetaError(reaction.indexObj, `"target" prop refered not to Species but ${actor._target_.className} for Reaction.`);
        });
        reaction.modifiers.forEach((modifier) => { // set ref objects for modifiers
          let _target_ = this.select({id: modifier.target, space: reaction.space});
          if(!_target_)
            throw new IndexedHetaError(reaction.indexObj, `Property "target" has lost reference "${modifier.target}".`);
          if(!(_target_ instanceof Species))
            throw new IndexedHetaError(reaction.indexObj, `"target" prop reffered not to Species but ${_target_.className} for Reaction.`);
          modifier._target_ = _target_;
        });
      });

    return this;
  }
}

Container.prototype.classes = {
  // scoped classes
  Record,
  Compartment,
  Species,
  Process,
  Reaction,
  ContinuousSwitcher,
  TimeSwitcher,
  // unscoped classes
  ReferenceDefinition,
  UnitDefinition,
  Page,
  Const,
  JSONExport
};

module.exports = Container;
