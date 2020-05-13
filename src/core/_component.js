const { markdown } = require('markdown');
const { validator } = require('./utilities.js');
const _ = require('lodash');
const _uniq = require('lodash/uniq');
const _cloneDeep = require('lodash/cloneDeep');
const _cloneWith = require('lodash/cloneWith');
const { flatten } = require('./utilities');
const Logger = require('../logger');

/*
  Abstract class _Component

  ''' Notes 1 '''
  component1 @_Component 'title 1' {
    tags: [tag1, tag2],
    aux: {}
  };
*/
class _Component {
  constructor(isCore = false){
    this.tags = [];
    this.aux = {};
    if (isCore) this._isCore = true;
    this.logger = new Logger();
  }
  merge(q = {}){
    this.logger.reset();
    let validationLogger = _Component.isValid(q);

    this.logger.pushMany(validationLogger);
    if (!validationLogger.hasErrors) {
      if(q.title) this.title = q.title;
      if(q.notes) this.notes = _.trim(q.notes); // remove trailing symbols
      if(q.tags) this.tags = _cloneDeep(q.tags);
      if(q.aux) this.aux = _cloneDeep(q.aux);
    }
    
    return this;
  }
  get isCore(){
    return this._isCore;
  }
  get id(){
    return this._id;
  }
  // if NS not set, than undefined
  // if set any, than spaceName
  // if set nameless, than 'nameless'
  get space(){
    if (this.namespace) {
      return this.namespace.spaceName;
    } else {
      return;
    }
  }
  static get schemaName(){
    return this.name + 'P';
  }
  get className(){
    return this.constructor.name;
  }
  get index(){
    if(this.space !== 'nameless'){
      return this.space + '::' + this._id;
    }else{
      return this.id;
    }
  }
  get indexObj(){
    return { id: this.id, space: this.space };
  }
  // creates copy of element
  clone(q = {}){
    let res = _cloneWith(this, (value, key) => {
      // do not clone namespace
      if (key !== 'namespace') {
        return _cloneDeep(value);
      }
    });

    // update index
    if(q.id) res._id = q.id;

    return res;
  }
  /** Change referencies of component based on suffix/prefix/rename */
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
    let validationLogger = new Logger();
    let ind = q.space ? `${q.space}::` : '' + q.id;

    let validate = validator
      .getSchema('https://hetalang.github.io#/definitions/' + this.schemaName);
    if(!validate){
      throw new TypeError(q, `The schema "${this.schemaName}" is not found.`);
    }
    let valid = validate(q);
    if (!valid) {
      let msg = `${ind} Some of properties do not satisfy requirements for class "${this.schemaName}"\n`
        + validate.errors.map((x, i) => `    ${i+1}. ${x.dataPath} ${x.message}`)
          .join('\n');
      validationLogger.error(msg, 'ValidationError');
      validationLogger.warn('Some of component properties will not be updated.');
    }
    
    return validationLogger;
  }
  /*
    Checking references:
    - check properties based on requirements(): required, find by symbol link
    - create virtual component if local prop refferences to global component
  */
  bind(namespace){
    let logger = new Logger();
    if(!namespace)
      throw new TypeError('"namespace" argument should be set.');
    
    const iterator = (item, path, rule) => {
      let targetId = _.get(this, path);
      let target = namespace.get(targetId);

      if (!target) {
        logger.error(this.index + ` Property "${path}" has lost reference "${targetId}".`, 'BindingError');
      } else if(rule.targetClass && !target.instanceOf(rule.targetClass)) {
        logger.error(this.index + ` "${path}" property should refer to ${rule.targetClass} but not to ${target.className}.`, 'BindingError');
      } else {
        // set direct ref
        if(rule.setTarget) _.set(this, path + 'Obj', target);
        // add back references for Record from Process XXX: ugly solution
        if(this.instanceOf('Process') && item.className === 'Actor' ){
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
        logger.error(`No required "${prop}" property for "${this.index}" of ${this.className}.`, 'BindingError');
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
    
    return logger;
  }
  toQ(options = {}){
    let res = {};
    res.class = this.className;
    res.id = this.id;
    if(this.namespace && this.namespace.spaceName !== 'nameless') res.space = this.space;
    if(this.title) res.title = this.title;
    if(this.notes) res.notes = this.notes;
    if(this.tags.length>0) res.tags = _cloneDeep(this.tags);
    if(_.size(this.aux)>0) res.aux = _cloneDeep(this.aux);

    return res;
  }
  toFlat(options = {}){
    // set defaults
    _.defaults(options, {
      simplifyModifiers: true,
      simplifyActors: true,
      simplifyExpressions: true
    });

    let q = this.toQ(options);
    let res = flatten(q);

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
  /*
  array of direct references inside component (non-unique)
  */
  references(){
    return _uniq(this._references());
  }
  /* non-unique references */
  _references(){
    return [];
  }
}

_Component._requirements = {};

module.exports = {
  _Component
};
