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
    let simple = (new selectedClass({id: q.id, space: q.space})).merge(q);

    this.storage.set(simple.index, simple);
    if(simple.instanceOf('_Export')) { // include parent
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
  get length(){
    return this.storage.size;
  }
  getPopulation(targetSpace, skipMathChecking=false){
    // argument checking
    if(targetSpace===undefined || typeof targetSpace!=='string'){
      throw new TypeError('targetSpace must be string');
    }
    let children = [...this.storage]
      .filter((x) => x[1].space===targetSpace)
      .map((x) => x[1]);
    let population = new XArray(...children);


    // add Const to population
    let messages = []; // messages for reference errors
    population
      .selectByInstanceOf('Record')
      .filter((record) => record.assignments)
      .forEach((record) => {
        _.keys(record.assignments)
          .forEach((key) => {
            let expr = record.assignments[key].expr;
            let deps = record.dependOn(key);
            deps.forEach((id, i) => {
              let _component_ = population.getById(id);
              if(!_component_){ // component inside space is not found
                let _global_ = this.storage.get(id);
                if(!_global_){
                  if(!skipMathChecking) {
                    messages.push(`Component "${id}" is not found in space "${record.space}" or in global as expected in expression\n`
                      + `${record.id}$${record.space} [${key}]= ${expr};`);
                  }
                }else if(!(_global_ instanceof Const)){
                  messages.push(`Component "${id}" is not a Const class as expected in expression\n`
                    + `${record.id}$${record.space} [${key}]= ${expr};`);
                }else{
                  population.push(_global_);
                }
              }else if(!(_component_ instanceof Record) && !(_component_ instanceof Const)){
                messages.push(`Component "${id}$${record.space}" is not a Record class as expected in expression\n`
                  + `${record.id}$${record.space} [${key}]= ${expr};`);
              }
            });
          });
      });
    if(messages.length>0){
      throw new Error('References error in expressions:\n' + messages.map((m, i) => `(${i}) `+ m).join('\n\n'));
    }

    return population;
  }
  setReferences(){
    [...this.storage].map((x) => x[1])
      .forEach((x) => { // iterates all components
        let req = x.constructor.requirements();
        _.each(req, (rule, prop) => { // iterates through rules
          // required: true
          if(rule.required && !_.has(x, prop)){
            throw new IndexedHetaError(x.indexObj, `No "${prop}" property for ${x.className}.`);
          }
          // isReference: true + className
          if(rule.isReference && _.has(x, prop)){
            const iterator = (item, path) => {
              let target = this.select({id: _.get(x, path), space: x.space});
              if(!target){
                throw new IndexedHetaError(x.indexObj, `Property "${path}" has lost reference "${_.get(x, path)}".`);
              }else if(rule.targetClass && !target.instanceOf(rule.targetClass)){
                throw new IndexedHetaError(x.indexObj, `"${path}" property should refer to ${rule.targetClass} but not to ${target.className}.`);
              }else if(rule.setTarget){
                _.set(x, path + 'Obj', target);
                // add back references for Process XXX: ugly solution
                if(x.instanceOf('Process')){
                  target.backReferences.push({
                    process: x.id,
                    _process_: x,
                    stoichiometry: item.stoichiometry
                  });
                }
              }
            };
            if(rule.isArray){ // iterates through array
              _.get(x, prop).forEach((item, i) => { 
                let fullPath = `${prop}[${i}].${rule.path || ''}`;
                iterator(item, fullPath);
              });
            }else{
              let fullPath = prop + (rule.path || '');
              iterator(_.get(x, prop), fullPath);
            }
          }
        });
      });

    // check output refs in SimpleTasks XXX: it seems to be working but ugly
    [...this.storage].map((x) => x[1])
      .filter((x) => x instanceof SimpleTask && x.subtasks)
      .forEach((x) => {
        x.subtasks.forEach((sub) => { // iterate through subtasks
          sub.output.forEach((out) => { // itrate through record refs
            let _record_ = this.select({id: out, space: x.space});
            if(!_record_){
              let msg = `Property "output" has lost reference for "${out}".`;
              throw new IndexedHetaError(x.indexObj, msg);
            }else if(_record_ instanceof Record){
              // do not attach
            }else{
              let msg = `"output" prop must be reffered to Record but now on ${_record_.className}.`;
              throw new IndexedHetaError(x.indexObj, msg);
            }
          });
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
  SimpleTask,
  // unscoped classes
  ReferenceDefinition,
  UnitDefinition,
  Page,
  Const
};

module.exports = Container;
