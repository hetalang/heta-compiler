const { QueueError } = require('./heta-error');
const { Record } = require('./core/record');
const { Compartment } = require('./core/compartment');
const { Species } = require('./core/species');
const { Reaction } = require('./core/reaction');
const { Process } = require('./core/process');
const { ContinuousSwitcher } = require('./core/continuous-switcher');
const { TimeSwitcher } = require('./core/time-switcher');
const { ReferenceDefinition } = require('./core/reference-definition');
const { UnitDef } = require('./core/unit-def');
const { Page } = require('./core/page');
const { Const } = require('./core/const');
const { SimpleTask } = require('./core/simple-task');
const _ = require('lodash');
const { Namespace } = require('./namespace');

// they cannot be used as id, when 
const reservedWords = [
  'default',
  'id',
  'space',
  'nameless'
];

class Container {
  constructor(){
    this._namespaces = new Map();
    // default namespace
    let nameless = new Namespace();
    nameless._isAbstract = false;
    this._namespaces.set('nameless', nameless);
  }
  get namespaces(){
    return this._namespaces;
  }
  insert(q = {}, isCore = false){
    let space = q.space || 'nameless';
    // check index
    if(!q.id || (typeof q.id !== 'string'))
      throw new QueueError(q, `Id should be string, but have "${q.id}"`);
    if(reservedWords.indexOf(q.id)!==-1)
      throw new QueueError(q, `Id cannot be one of reserved word, but have "${q.id}". reservedWords = [${reservedWords}]`);
    if(!q.class || typeof q.class !== 'string')
      throw new QueueError(q, `No class or unsuitable class for "insert": ${q.class}`);

    // check if class is in the list
    let selectedClass = this.classes[q.class];
    if(selectedClass === undefined)
      throw new QueueError(q, `Unknown class "${q.class}" for the element.`);
    let component = (new selectedClass(isCore)).merge(q);

    // set component in namespace
    let namespace = this.namespaces.get(space);
    if (namespace === undefined)
      throw new QueueError(q, `Create namespace "${space}" before use.`);
    component._id = q.id;
    component._space = q.space;
    namespace.set(q.id, component);
    if(component.instanceOf('_Export')) { // include parent
      component.namespace = namespace;
    }

    return component;
  }
  update(q = {}){
    let space = q.space || 'nameless';
    if(!q.id || (typeof q.id !== 'string')){
      throw new QueueError(q, `Id should be string, but have "${q.id}"`);
    }
    if(q.class)
      throw new QueueError(q, `Class property is not allowed for "update": ${q.class}`);

    // set component
    let namespace = this.namespaces.get(space);
    if (namespace === undefined)
      throw new QueueError(q, `Create namespace "${space}" before use.`);
    let targetComponent = namespace.get(q.id);

    // creation of new components is not allowed
    if(targetComponent === undefined)
      throw new QueueError(q, 'Element with the index is not exist which is not allowed for "update" strategy.');
    if(targetComponent.isCore)
      throw new QueueError(q, 'Core component is read-only and cannot be updated.');

    targetComponent.merge(q);

    return targetComponent;
  }
  upsert(q = {}, isCore = false){
    if('class' in q){
      return this.insert(q, isCore);
    }else{
      return this.update(q);
    }
  }
  delete(q = {}){
    let space = q.space || 'nameless';
    if(!q.id || (typeof q.id !== 'string'))
      throw new QueueError(q, `Id should be string, but have "${q.id}"`);
    if(q.class)
      throw new QueueError(q, `Class property is not allowed for "delete": ${q.class}`);

    // set component
    let namespace = this.namespaces.get(space);
    if (namespace === undefined)
      throw new QueueError(q, `Create namespace "${space}" before use.`);
    let targetComponent = namespace.get(q.id);
    if(!targetComponent) // if targetComponent===false, element is not exist
      throw new QueueError(q, `Element with id "${q.id}" does not exist and cannot be deleted.`);
    if(targetComponent.isCore)
      throw new QueueError(q, 'Core component is read-only and cannot be deleted.');
    
    return namespace.delete(q.id); // true or false
  }
  select(q = {}){
    let space = q.space || 'nameless';
    if(!q.id || (typeof q.id !== 'string'))
      throw new QueueError(q, `Id should be string, got "${q.id}"`);
    let namespace = this.namespaces.get(space);
    if (namespace === undefined)
      throw new QueueError(q, `Create namespace "${space}" before use.`);

    return namespace.get(q.id);
  }
  setNS(q = {}){
    // create namespace if not exists
    let namespace = this.namespaces.get(q.space);
    if (namespace === undefined){
      namespace = new Namespace();
      this._namespaces.set(q.space, namespace);
    }
    namespace._isAbstract = q.type === 'abstract';
  }
  /* 
    clone all components to another space
    #importNS two::* {
      fromSpace: one,
      prefix: '',
      suffix: '',
      rename: {}
    };
  */
  importNS(q = {}){
    let space = q.space || 'nameless';
    if(q.fromId)
      throw new QueueError(q, `fromId must not be set for #importNS, but have "${q.fromId}"`);
    if(q.id)
      throw new QueueError(q, `id must not be set for #importNS, but have "${q.id}"`);
    _.defaults(q, {
      prefix: '',
      suffix: '',
      rename: {}
    });

    let namespace = this.namespaces.get(space);
    if (namespace === undefined)
      throw new QueueError(q, `Create namespace "${space}" before use.`);

    let fromNamespace = this.namespaces.get(q.fromSpace);
    if (fromNamespace === undefined)
      throw new QueueError(q, `Create namespace "${q.fromSpace}" before use.`);

    let clones = fromNamespace.toArray().map((component) => {
      // update id: q.id is ignored, q.rename[component.id], [q.suffix, component.id, q.prefix].join('')
      let newId = _.get(
        q.rename, 
        component.id,
        [q.prefix, component.id, q.suffix].join('') // default value
      );

      // cloning and update references
      let clone = component.clone({id: newId, space: q.space});
      clone.updateReferences(q);

      namespace.set(newId, clone);

      return clone;
    });

    return clones;
  }
  /*
    the same as importNS but delete all elements from source namespace
  */
  /*
  moveNS(q = {}){
    let toClone = this.storage.selectBySpace(q.fromSpace);
    let clones = this.importNS(q);

    toClone.forEach((component) => {
      this.storage.delete(component.index);
    });

    return clones;
  }
  */
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
  import(q = {}){
    let space = q.space || 'nameless';
    // checking arguments
    if(!q.fromId || (typeof q.fromId !== 'string'))
      throw new QueueError(q, `fromId should be string, but have "${q.fromId}"`);
    if(q.fromSpace && (typeof q.fromSpace !== 'string'))
      throw new QueueError(q, `fromSpace should be string, but have "${q.fromSpace}"`);
      
    let namespace = this.namespaces.get(space);
    if (namespace === undefined)
      throw new QueueError(q, `Create namespace "${space}" before use.`);

    let fromNamespace = this.namespaces.get(q.fromSpace);
    if (fromNamespace === undefined)
      throw new QueueError(q, `Create namespace "${q.fromSpace}" before use.`);

    // select component to copy
    let component = fromNamespace.get(q.fromId);
    if(!component)
      throw new QueueError(q, `Element with ${q.fromId}::${q.fromSpace})} does not exist and cannot be cloned.`);

    // cloning and update references
    let clone = component.clone({id: q.id, space: q.space});
    clone.updateReferences(q);

    namespace.set(q.id, clone);

    return clone;
  }

  /*
   the same as import but delete source component
  
  move(q = {}){
    let clone = this.import(q);

    // delete component
    this.delete({id: q.fromId, space: q.fromSpace});

    return clone;
  }
  */
  load(q, isCore = false){
    // estimate action, default is upsert
    let actionName = _.get(q, 'action', 'upsert');
    // do action
    return this[actionName](q, isCore);
  }
  loadMany(qArr, isCore = false){
    qArr.forEach((q) => this.load(q, isCore));
    return this;
  }
  toArray(){
    return _.chain([...this.namespaces])
      .map((x) => x[1].toArray())
      .flatten()
      .value();
  }
  toQArr(removeCoreComponents = false){
    let qArr = this.toArray()
      .filter((x) => !removeCoreComponents || !x.isCore)
      .map((x) => x.toQ());
    
    return qArr;
  }
  get length(){
    return _.sumBy([...this.namespaces], (x) => x[1].size);
  }
  // check all namespaces
  knitMany(skipErrors = false){
    [...this.namespaces].forEach((x) => {
      let ns = x[1];
      // knit only concrete namespace
      if (!ns.isAbstract) ns.knit(skipErrors);
    });

    return this;
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
  UnitDef,
  Page,
  Const
};
/*
// converts {id: 'k1', space: 'one'} => 'one.k1'
function getIndexFromQ(q = {}){
  if(q.space!==undefined){
    return `${q.space}::${q.id}`;
  }else{
    return q.id;
  }
}
*/
module.exports = Container;
