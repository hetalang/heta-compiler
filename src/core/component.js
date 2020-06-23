const { markdown } = require('markdown');
const { validator } = require('./utilities');
const _ = require('lodash');
const { flatten } = require('./utilities');

/*
  class Component

  ''' Notes 1 '''
  component1 @Component 'title 1' {
    tags: [tag1, tag2],
    aux: {}
  };
*/
class Component {
  constructor(isCore = false){
    this.tags = [];
    this.aux = {};
    if (isCore) this._isCore = true;
  }
  merge(q = {}){
    let logger = _.get(this, 'namespace.container.logger');
    let valid = Component.isValid(q, logger);

    if (valid) {
      if (q.title) this.title = q.title;
      if (q.notes) this.notes = _.trim(q.notes); // remove trailing symbols
      if (q.tags) this.tags = _.cloneDeep(q.tags);
      if (q.aux) this.aux = _.cloneDeep(q.aux);
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
      return undefined;
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
  clone(){
    let componentClone = new this.constructor();
    if (this.title)
      componentClone.title = this.title;
    if (this.notes)
      componentClone.notes = this.notes;
    if (this.tags.length)
      componentClone.tags = this.tags.map(x => x);
    if (_.size(this.aux))
      componentClone.aux = _.cloneDeep(this.aux);

    if (this._isCore)
      componentClone._isCore = true;

    return componentClone;
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
  static isValid(q, logger){
    let ind = q.space ? `${q.space}::` : '' + q.id;

    let validate = validator
      .getSchema('https://hetalang.github.io#/definitions/' + this.schemaName);
    if (!validate) {
      throw new TypeError(`The schema "${this.schemaName}" is not found.`);
    }
    let valid = validate(q);
    if (!valid) {
      let msg = `${ind} Some of properties do not satisfy requirements for class "${this.schemaName}"\n`
        + validate.errors.map((x, i) => `    ${i+1}. ${x.dataPath} ${x.message}`)
          .join('\n');
      logger && logger.error(msg, 'ValidationError');
      logger && logger.warn('Some of component properties will not be updated.');
    }
    
    return valid;
  }
  /*
    Checking references:
    - check properties based on requirements(): required, find by symbol link
    - create virtual component if local prop refferences to global component
  */
  bind(namespace){
    let logger = this.namespace.container.logger;
    if (!namespace)
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
        if (rule.setTarget) _.set(this, path + 'Obj', target);
        // add back references for Record from Process XXX: ugly solution
        if (this.instanceOf('Process') && item.className === 'Actor' ){
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
      if (rule.required && !_.has(this, prop)) {
        logger.error(`No required "${prop}" property for "${this.index}" of ${this.className}.`, 'BindingError');
      }
      // isReference: true + className
      if (rule.isReference && _.has(this, prop)) {
        if (rule.isArray) { // iterates through array
          _.get(this, prop).forEach((item, i) => {
            let fullPath = rule.path ? `${prop}[${i}].${rule.path}` : `${prop}[${i}]`;
            iterator(item, fullPath, rule);
          });
        } else {
          let item = _.get(this, prop);
          let fullPath = rule.path ? `${prop}.${rule.path}` : `${prop}`;
          iterator(item, fullPath, rule);
        }
      }
    });
  }
  toQ(options = {}){
    let res = {};
    res.class = this.className;
    res.id = this.id;
    if (this.namespace && this.namespace.spaceName !== 'nameless') res.space = this.space;
    if (this.title) res.title = this.title;
    if (this.notes) res.notes = this.notes;
    if (this.tags.length>0) res.tags = _.cloneDeep(this.tags);
    if (_.size(this.aux)>0) res.aux = _.cloneDeep(this.aux);

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
    if(this.name === 'Component'){
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
    return _.uniq(this._references());
  }
  /* non-unique references */
  _references(){
    return [];
  }
}

Component._requirements = {};

module.exports = {
  Component
};
