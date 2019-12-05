const { QueueError } = require('./heta-error');
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
const XArray = require('./x-array');

// they cannot be used as id, when 
const reservedWords = [
  'default',
  'id',
  'space'
];

class Storage extends Map {
  set(key, value){
    // argument checking
    let keyIsCorrect = /^([a-zA-Z_]\w*::)*([a-zA-Z_]\w*)$/.test(key);
    if(!keyIsCorrect) 
      throw new TypeError('Wrong index in Storage: ' + key);

    if(!value.instanceOf('_Component'))
      throw new TypeError('Value in Storage should be _Component, but we have: ' + value);

    super.set(key, value);
    let indexArray = _.reverse(key.split('::'));
    value._id = indexArray[0];
    if(indexArray.length > 1) value._space = indexArray[1];

    return this;
  }
  selectBySpace(space){
    if(space===undefined){
      var res = [...this].filter((item) => {
        let indexArray = item[0].split('::');
        return indexArray.length===1;
      });
    } else {
      res = [...this].filter((item) => {
        let indexArray = item[0].split('::');
        return indexArray.length===2 && indexArray[0]===space;
      });
    }

    return res.map((item) => item[1]);
  }
}

class Container {
  constructor(){
    this.storage = new Storage();
    this.namespaces = [{
      name: undefined, // for anonimous
      abstract: undefined, // undefined => can be changed by @_Export, true => @_Export is not allowed, false => bindings
      private: false // cannot be included
    }];
  }
  get nsList(){
    return this.namespaces.map((ns) => ns.name);
  }
  insert(q = {}){
    // check index
    if(!q.id || (typeof q.id !== 'string'))
      throw new QueueError(q, `Id should be string, but have "${q.id}"`);
    if(reservedWords.indexOf(q.id)!==-1)
      throw new QueueError(q, `Id cannot be one of reserved word, but have "${q.id}". reservedWords = [${reservedWords}]`);
    if(!q.class || typeof q.class !== 'string')
      throw new QueueError(q, `No class or unsuitable class for "insert": ${q.class}`);
    //if(this.nsList.indexOf(q.space)===-1){
    //  throw new QueueError(q, `Namespace must be initialized before first use. namespace ${q.space} begin ... end`);
    //}

    // check if class is in the list
    let selectedClass = this.classes[q.class];
    if(selectedClass===undefined)
      throw new QueueError(q, `Unknown class "${q.class}" for the element.`);
    let component = (new selectedClass).merge(q);

    let index = getIndexFromQ(q);
    this.storage.set(index, component);
    if(component.instanceOf('_Export')) { // include parent
      component._container = this;
    }

    return component;
  }
  update(q = {}){
    if(!q.id || (typeof q.id !== 'string')){
      throw new QueueError(q, `Id should be string, but have "${q.id}"`);
    }
    if(q.class)
      throw new QueueError(q, `Class property is not allowed for "update": ${q.class}`);
    let index = getIndexFromQ(q);
    let targetComponent = this.storage.get(index);

    // creation of new components is not allowed
    if(targetComponent===undefined)
      throw new QueueError(q, 'Element with the index is not exist which is not allowed for "update" strategy.');

    targetComponent.merge(q);

    return targetComponent;
  }
  upsert(q = {}){
    if('class' in q){
      return this.insert(q);
    }else{
      return this.update(q);
    }
  }
  delete(q = {}){
    if(!q.id || (typeof q.id !== 'string'))
      throw new QueueError(q, `Id should be string, but have "${q.id}"`);
    if(q.class)
      throw new QueueError(q, `Class property is not allowed for "delete": ${q.class}`);
    let index = getIndexFromQ(q);
    let targetComponent = this.storage.delete(index);
    if(!targetComponent) // if targetComponent===false, element is not exist
      throw new QueueError(q, 'Element with index is not exist and cannot be deleted.');

    return targetComponent; // true or false
  }
  select(q = {}){
    if(!q.id || (typeof q.id !== 'string'))
      throw new QueueError(q, `Id should be string, got "${q.id}"`);
    let index = getIndexFromQ(q);
    
    return this.storage.get(index);
  }
  setNS(q = {}){
    // do nothing: temporal solution
  }
  /* 
    clone space components to another space
    #importNS two::* {
      fromSpace: one,
      //from: two::*
      prefix: '',
      suffix: '',
      rename: {}
    };
*/
  importNS(q = {}, isVirtual = false){
    let toClone = this.storage.selectBySpace(q.fromSpace);
    if(q.fromId)
      throw new QueueError(q, `fromId must not be set for #importNS, but have "${q.fromId}"`);
    if(q.id)
      throw new QueueError(q, `id must not be set for #importNS, but have "${q.id}"`);
    _.defaults(q, {
      prefix: '',
      suffix: '',
      rename: {}
    });

    let clones = toClone.map((component) => {
      // update id: q.id is ignored, q.rename[component.id], [q.suffix, component.id, q.prefix].join('')
      q.id = _.get(
        q.rename, 
        component.id,
        [q.prefix, component.id, q.suffix].join('') // default value
      );

      // cloning and update references
      let clone = component.clone(q, isVirtual);
      clone.updateReferences(q);

      this.storage.set(clone.index, clone);

      return clone;
    });

    return clones;
  }
  /*
    the same as importNS but delete all elements from source namespace
  */
  moveNS(q = {}, isVirtual = false){
    let toClone = this.storage.selectBySpace(q.fromSpace);
    let clones = this.importNS(q, isVirtual);

    toClone.forEach((component) => {
      this.storage.delete(component.index);
    });

    return clones;
  }
  /* 
    clones element updating id, space and referencies
    #import two::k2 {
      fromId: k1
      fromSpace: one,
      // from: one::k1
      prefix: '',
      suffix: '',
      rename: {}
    };
  */
  import(q = {}, isVirtual = false){
    // checking arguments
    if(!q.fromId || (typeof q.fromId !== 'string'))
      throw new QueueError(q, `fromId should be string, but have "${q.fromId}"`);
    if(q.fromSpace && (typeof q.fromSpace !== 'string'))
      throw new QueueError(q, `fromSpace should be string, but have "${q.fromSpace}"`);
      
    // select component to copy
    let component = this.select({id: q.fromId, space: q.fromSpace});
    if(!component)
      throw new QueueError(q, `Element with ${component.index} does not exist and cannot be cloned.`);

    // cloning and update references
    let clone = component.clone(q, isVirtual);
    clone.updateReferences(q);

    this.storage.set(clone.index, clone);

    return clone;
  }
  /*
   the same as import but delete source component
  */
  move(q = {}, isVirtual = false){
    let clone = this.import(q, isVirtual);

    // delete component
    this.delete(q);

    return clone;
  }
  /*
    #initNamespace one::* { abstract: true };
  
  initNamespace(q = {}){
    if(this.namespaces.indexOf(q.space)===-1){
      this.namespaces.push({ name: q.space, abstract: q.abstract });
      this.importNS({ space: q.space }, true);
    }else{
      throw new QueueError(q, `Namespace ${q.space} was already initiated.`);
    }
  }
  */
  load(q){
    // push to spaces list and use anonimous
    if(this.nsList.indexOf(q.space)===-1){
      this.namespaces.push({ name: q.space });
      this.importNS({ space: q.space }, true);
    }
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

// converts {id: 'k1', space: 'one'} => 'one.k1'
function getIndexFromQ(q = {}){
  if(q.space!==undefined){
    return `${q.space}::${q.id}`;
  }else{
    return q.id;
  }
}

module.exports = Container;
