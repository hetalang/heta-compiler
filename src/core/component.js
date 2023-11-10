const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({html: true, xhtmlOut: false, linkify: true});

const { uniqBy, validator, flatten, cloneDeep } = require('../utils');
const _get = require('lodash/get');
const _set = require('lodash/set');

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
    let logger = this.namespace?.container?.logger;
    let valid = Component.isValid(q, logger);

    if (valid) {
      if (q.title) this.title = q.title;
      if (q.notes) this.notes = q.notes.trim(); // remove trailing symbols
      if (q.tags) this.tags = q.tags.map((tag) => tag); // clone
      if (q.aux) this.aux = cloneDeep(q.aux);
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
    return this.prototype.className;
  }
  get className(){
    return 'Component';
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
    if (this.aux !== undefined)
      componentClone.aux = cloneDeep(this.aux);

    if (this._isCore)
      componentClone._isCore = true;

    return componentClone;
  }
  /** Change referencies of component based on suffix/prefix/rename */
  updateReferences(_q = {}){
    // set defaults
    let q = Object.assign({
      prefix: '',
      suffix: '',
      rename: {}
    }, _q);

    // change references
    const iterator = (item, path) => { // Actor { target: 'y', stoichiometry: -1 }, actors[0].target
      let oldRef = _get(this, path);
      let newRef = q.rename[oldRef] 
        || [q.prefix, oldRef, q.suffix].join(''); // default behaviour

      _set(this, path, newRef);
    };
    // search ref in requirements
    let req = this.constructor.requirements();
    Object.entries(req)
      .forEach(([prop, rule]) => { // iterates through rules
        // isReference: true
        if (rule.isReference && this[prop] !== undefined) {
          if (rule.isArray) { // iterates through array
            this[prop].forEach((item, i) => {
              let fullPath = rule.path ? `${prop}[${i}].${rule.path}` : `${prop}[${i}]`;
              iterator(item, fullPath, rule);
            });
          } else {
            let item = this[prop];
            let fullPath = rule.path ? `${prop}.${rule.path}` : `${prop}`;
            iterator(item, fullPath, rule);
          }
        }
      });

    return this;
  }
  get notesHTML() {
    if (this.notes === undefined) {
      return undefined;
    }
    let renderedOutput = md.render(this.notes);
    return renderedOutput.trim();
  }
  static isValid(q, logger){
    let ind = q.space ? `${q.space}::${q.id}` : q.id;

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
      logger && logger.error(msg, {type: 'ValidationError', space: q.space});
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
      let targetId = _get(this, path);
      let target = namespace.get(targetId);

      if (!target) {
        logger.error(
          this.index + ` Property "${path}" has lost reference "${targetId}".`,
          {type: 'BindingError', space: this.space}
        );
      } else if(rule.targetClass && !target.instanceOf(rule.targetClass)) {
        logger.error(
          this.index + ` "${path}" property should refer to ${rule.targetClass} but not to ${target.className}.`,
          {type: 'BindingError', space: this.space}
        );
      } else {
        // set direct ref
        if (rule.setTarget) _set(this, path + 'Obj', target);
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
    Object.entries(req).forEach(([prop, rule]) => { // iterates through rules
      // required: true
      if (rule.required && this[prop] === undefined) {
        logger.error(
          `No required "${prop}" property for "${this.index}" of ${this.className}.`,
          {type: 'BindingError', space: this.space}
        );
      }
      // isReference: true + className
      if (rule.isReference && this[prop] !== undefined) {
        if (rule.isArray) { // iterates through array
          this[prop].forEach((item, i) => {
            let fullPath = rule.path ? `${prop}[${i}].${rule.path}` : `${prop}[${i}]`;
            iterator(item, fullPath, rule);
          });
        } else {
          let item = this[prop];
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
    if (this.tags.length > 0) res.tags = this.tags.map((tag) => tag);
    if (Object.keys(this.aux).length > 0) res.aux = cloneDeep(this.aux);

    return res;
  }
  toFlat(_options = {}){
    // set defaults
    let options = Object.assign({
      simplifyModifiers: true,
      simplifyActors: true,
      simplifyExpressions: true
    }, _options);

    let q = this.toQ(options);
    let res = flatten(q);

    return res;
  }
  /* recursively create requirements from _requirements, 
  currently it is not optimal */
  static requirements(){ 
    if (this.name === 'Component') {
      return this._requirements;
    } else if (this.hasOwnProperty('_requirements')) {
      let proto = Object.getPrototypeOf(this);
      let deeper = this.requirements.call(proto);
      //let deeper = Object.getPrototypeOf(this).requirements();
      return Object.assign({}, deeper, this._requirements);
    } else {
      let proto = Object.getPrototypeOf(this);
      let deeper = this.requirements.call(proto);
      //let deeper = Object.getPrototypeOf(this).requirements();
      return deeper;
    }
  }
  /* recursively check class names */
  instanceOf(className){
    if (this.className === className) {
      return true;
    } else if (!this.className) {
      return false;
    } else {
      let proto = Object.getPrototypeOf(this);
      let isInstance = this.instanceOf.call(proto, className);
      //let isInstance = Object.getPrototypeOf(this).instanceOf(className);
      return isInstance;
    }
  }
  /*
  array of direct references inside component (non-unique)
  ? used inside irt-nav
  */
  references(){
    return uniqBy(this._references());
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
