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
const { SimpleTask } = require('./core/simple-task');
const _ = require('lodash');
const { getIndexFromQ } = require('./common');
const XArray = require('./x-array');

// they cannot be used as id, when 
const reservedWords = [
  'default',
  'id'
];

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
    if(reservedWords.indexOf(q.id)!==-1)
      throw new IndexedHetaError(q, `Id cannot be one of reserved word, but have "${q.id}". reservedWords = [${reservedWords}]`);
    if(!q.class || typeof q.class !== 'string')
      throw new IndexedHetaError(q, `No class or unsuitable class for "insert": ${q.class}`);
    // check if class is in the list
    let selectedClass = this.classes[q.class];
    if(selectedClass===undefined)
      throw new IndexedHetaError(q, `Unknown class "${q.class}" for the element.`);
    let component = (new selectedClass({id: q.id, space: q.space})).merge(q);

    this.storage.set(component.index, component);
    if(component.instanceOf('_Export')) { // include parent
      component._container = this;
    }

    return component;
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
  /*
    The same as select() but search in namespace then globally
  */
  softSelect(q = {}){
    let tryDirectly = this.select(q);
    if(tryDirectly || !q.space){
      return tryDirectly;
    }else{
      return this.select({id: q.id});
    }
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
      .map((obj) => obj[1].toQ())
      .filter((x) => !x.isVirtual);
    return qArr;
  }
  get length(){
    return this.storage.size;
  }
  // check all components and add references
  populate(skipErrors = false){
    [...this.storage].map((x) => x[1])
      .forEach((component) => component.bind(this, skipErrors)); // iterates all components

    return this;
  }
  getPopulation(targetSpace){
    // argument checking
    if(targetSpace!==undefined && typeof targetSpace!=='string'){
      throw new TypeError('targetSpace must be string');
    }
    let children = [...this.storage]
      .filter((x) => x[1].space===targetSpace)
      .map((x) => x[1]); // get array
    let population = new XArray(...children); // get XArray

    return population;
  }
}

Container.prototype.classes = {
  Record,
  Compartment,
  Species,
  Process,
  Reaction,
  ContinuousSwitcher,
  TimeSwitcher,
  SimpleTask,
  ReferenceDefinition,
  UnitDefinition,
  Page,
  Const
};

module.exports = Container;
