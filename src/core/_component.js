const { markdown } = require('markdown');
const { validator } = require('./utilities.js');
const { ValidationError, BindingError } = require('../heta-error');
const _ = require('lodash');

/*
  Abstract class _Component
*/
class _Component {
  constructor(){
    this.tags = [];
    this.aux = {};
  }
  merge(q, skipChecking){
    if(!skipChecking) _Component.isValid(q);

    if(q && q.title) this.title = q.title;
    if(q && q.notes) this.notes = _.trim(q.notes); // remove trailing symbols
    if(q && q.tags) this.tags = _.cloneDeep(q.tags);
    if(q && q.aux) this.aux = _.cloneDeep(q.aux);

    return this;
  }
  get id(){
    return this._id;
  }
  get space(){
    return this._space;
  }
  static get schemaName(){
    return this.name + 'P';
  }
  get className(){
    return this.constructor.name;
  }
  get index(){
    if(this._space){
      return this._space + '::' + this._id;
    }else{
      return this.id;
    }
  }
  get indexObj(){
    if(this._space){
      return { id: this._id, space: this._space };
    }else{
      return { id: this._id };
    }
  }
  get isGlobal(){
    return this._space===undefined;
  }
  // creates copy of element
  clone(q = {}, isVirtual = false){
    let res = _.cloneDeep(this);

    // update index
    if(q.toId) res._id = q.toId;
    if(q.toSpace) res._space = q.toSpace;
    res.isVirtual = isVirtual;

    return res;
  }
  updateReferences(q = {}){
    // set defaults
    _.defaults(q, {
      prefix: '',
      suffix: '',
      rename: {}
    });

    // change references
    const iterator = (item, path) => { // Actor { target: 'y', stoichiometry: -1 }, actors[0].target
      let oldRef = _.get(this, path);
      let newRef = _.get(
        q.rename, 
        oldRef,
        [q.prefix, oldRef, q.suffix].join('') // default behaviour
      );

      _.set(this, path, newRef);
    };
    // search ref in requirements
    let req = this.constructor.requirements();
    _.each(req, (rule, prop) => { // iterates through rules
      // isReference: true
      if(rule.isReference && _.has(this, prop)){
        if(rule.isArray){ // iterates through array
          _.get(this, prop).forEach((item, i) => {
            let fullPath = rule.path ? `${prop}[${i}].${rule.path}` : `${prop}[${i}]`;
            iterator(item, fullPath, rule);
          });
        }else{
          let item = _.get(this, prop);
          let fullPath = rule.path ? `${prop}.${rule.path}` : `${prop}`;
          iterator(item, fullPath, rule);
        }
      }
    });

    return this;
  }
  get notesMdTree(){
    if(this.notes){
      return markdown.parse(this.notes);
    }else{
      return undefined;
    }
  }
  get notesHTML() {
    if(this.notes){
      let HTMLTree = markdown.toHTMLTree(this.notesMdTree);
      return markdown.renderJsonML(HTMLTree);
    }else{
      return undefined;
    }
  }
  static isValid(q){
    let validate = validator
      .getSchema('http://qs3p.insilicobio.ru#/definitions/' + this.schemaName);
    if(!validate){
      throw new TypeError(q, `The schema "${this.schemaName}" is not found.`);
    }
    let valid = validate(q);
    if(!valid) {
      throw new ValidationError(q, validate.errors, `Some of properties do not satisfy requirements for class "${this.name}".`);
    }
  }
  /*
    Checking references:
    - check properties based on requirements(): required, find by symbol link
    - create virtual component if local prop refferences to global component
  */
  bind(container, skipErrors = false){
    if(!container) throw new TypeError('"container" argument should be set.');
    
    const iterator = (item, path, rule) => {
      let target = container.select({
        id: _.get(this, path), 
        space: this.space
      });

      if(!target){
        throw new BindingError(this.index, [], `Property "${path}" has lost reference "${_.get(this, path)}".`);
      }else if(rule.targetClass && !target.instanceOf(rule.targetClass)){
        throw new BindingError(this.index, [], `"${path}" property should refer to ${rule.targetClass} but not to ${target.className}.`);
      }else{
        // set direct ref
        if(rule.setTarget) _.set(this, path + 'Obj', target);
        // add back references for Process XXX: ugly solution
        if(this.instanceOf('Process')){
          target.backReferences.push({
            process: this.id,
            _process_: this,
            stoichiometry: item.stoichiometry
          });
        }
      }
    };

    // check requirements
    let req = this.constructor.requirements();
    _.each(req, (rule, prop) => { // iterates through rules
      // required: true
      if(rule.required && !_.has(this, prop)){
        throw new ValidationError(this.indexObj, [], `No required "${prop}" property for ${this.className}.`);
      }
      // isReference: true + className
      if(rule.isReference && _.has(this, prop)){
        if(rule.isArray){ // iterates through array
          _.get(this, prop).forEach((item, i) => {
            let fullPath = rule.path ? `${prop}[${i}].${rule.path}` : `${prop}[${i}]`;
            iterator(item, fullPath, rule);
          });
        }else{
          let item = _.get(this, prop);
          let fullPath = rule.path ? `${prop}.${rule.path}` : `${prop}`;
          iterator(item, fullPath, rule);
        }
      }
    });
  }
  toQ(){
    let res = {};
    res.class = this.className;
    res.id = this.id;
    if(this.space) res.space = this.space;
    if(this.title) res.title = this.title;
    if(this.notes) res.notes = this.notes;
    if(this.tags.length>0) res.tags = _.cloneDeep(this.tags);
    if(_.size(this.aux)>0) res.aux = _.cloneDeep(this.aux);
    if(this.isVirtual) res.isVirtual = this.isVirtual;

    return res;
  }
  /* recursively create requirements from _requirements, 
  currently it is not optimal */
  static requirements(){
    if(this.name === '_Component'){
      return this._requirements;
    }else if(this.hasOwnProperty('_requirements')){
      let deeper = this.requirements.call(this.__proto__);
      return Object.assign({}, deeper, this._requirements);
    }else{
      let deeper = this.requirements.call(this.__proto__);
      return deeper;
    }
  }
  /* recursively check class names */
  instanceOf(className){
    if(this.constructor.name === className){
      return true;
    }else if(this.constructor.name === 'Object'){
      return false;
    }else{
      return this.instanceOf.call(this.__proto__, className);
    }
  }
}

_Component._requirements = {};

module.exports = {
  _Component
};
