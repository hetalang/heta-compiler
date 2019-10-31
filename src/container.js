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
  /* version WITH VIRTUALS
    1. check all components for good references recursively
    2. clone global referenced components as virtual
    3. if lost reference than error
    4. repeat 2-4 recursively
  */
  pop(component, skipErrors = false){ // check, set references and clone global references to local virtual components
    // checking argument may be good idea
    
    let messages = []; // messages for reference errors
    
    const iterator = (item, path, rule) => {
      let target = this.softSelect({
        id: _.get(component, path), 
        space: component.space
      });

      if(!target){
        throw new IndexedHetaError(component.indexObj, `Property "${path}" has lost reference "${_.get(component, path)}".`);
      }else if(rule.targetClass && !target.instanceOf(rule.targetClass)){
        throw new IndexedHetaError(component.indexObj, `"${path}" property should refer to ${rule.targetClass} but not to ${target.className}.`);
      }else{
        if(component.space !== target.space){ // if local -> global
          // clone component with another space
          let q = target.toQ();
          let selectedClass = this.classes[q.class];
          target = (new selectedClass({id: target.id, space: component.space})).merge(q);
          target.isVirtual = true;
          this.storage.set(target.index, target);
          // pop dependencies of virtual recursively
          this.pop(target);
        }
        // set direct ref
        if(rule.setTarget) _.set(component, path + 'Obj', target);
        // add back references for Process XXX: ugly solution
        if(component.instanceOf('Process')){
          target.backReferences.push({
            process: component.id,
            _process_: component,
            stoichiometry: item.stoichiometry
          });
        }
      }
    };

    // check requirements
    let req = component.constructor.requirements();
    _.each(req, (rule, prop) => { // iterates through rules
      // required: true
      if(rule.required && !_.has(component, prop)){
        throw new IndexedHetaError(component.indexObj, `No required "${prop}" property for ${component.className}.`);
      }
      // isReference: true + className
      if(rule.isReference && _.has(component, prop)){
        if(rule.isArray){ // iterates through array
          _.get(component, prop).forEach((item, i) => {
            let fullPath = rule.path ? `${prop}[${i}].${rule.path}` : `${prop}[${i}]`;
            iterator(item, fullPath, rule);
          });
        }else{
          let item = _.get(component, prop);
          let fullPath = rule.path ? `${prop}.${rule.path}` : `${prop}`;
          iterator(item, fullPath, rule);
        }
      }
    });
    
    // check output refs in SimpleTasks XXX: it seems to be working but ugly and without iterativity
    if(component instanceof SimpleTask && component.subtasks){
      component.subtasks.forEach((sub) => { // iterate through subtasks
        sub.output.forEach((out) => { // itrate through record refs
          let _record_ = this.select({id: out, space: component.space});
          if(!_record_){
            let msg = `Property "output" has lost reference for "${out}".`;
            throw new IndexedHetaError(component.indexObj, msg);
          }else if(_record_ instanceof Record){
            // do not attach
          }else{
            let msg = `"output" prop must be reffered to Record but now on ${_record_.className}.`;
            throw new IndexedHetaError(component.indexObj, msg);
          }
        });
      });
    }
    
    // check math expression refs
    if(component instanceof Record && component.assignments){
      _.each(component.assignments, (mathExpr, key) => {
        component
          .dependOn(key)
          .forEach((id) => {
            let target = this.softSelect({
              id: id, 
              space: component.space
            });

            if(!target){
              messages.push(`Component "${id}" is not found in space "${component.space}" or in global as expected in expression\n`
                    + `${component.index} [${key}]= ${mathExpr.expr};`);
            }else if(!target.instanceOf('Const') && !target.instanceOf('Record')){
              messages.push(`Component "${id}" is not a Const or Record class as expected in expression\n`
                + `${component.index} [${key}]= ${mathExpr.expr};`);
            }else{
              if(component.space !== target.space){ // if local -> global
                // clone component with another space
                let q = target.toQ();
                let selectedClass = this.classes[q.class];
                target = (new selectedClass({id: target.id, space: component.space})).merge(q);
                target.isVirtual = true;
                this.storage.set(target.index, target);
                // pop dependencies of virtual recursively
                this.pop(target);
              }
            }
          });
      });
    }

    let msg = 'References error in expressions:\n' 
      + messages.map((m, i) => `(${i}) `+ m).join('\n\n');
    if(messages.length>0 && !skipErrors){
      throw new Error(msg);
    }

    return this;
  }
  // check all components and add references
  populate(skipErrors = false){
    [...this.storage].map((x) => x[1])
      .forEach((component) => this.pop(component, skipErrors)); // iterates all components

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
