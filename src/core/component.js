const { Top } = require('./top');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({html: true, xhtmlOut: false, linkify: true});

const { uniqBy, ajv, cloneDeep } = require('../utils');
const _get = require('lodash/get');
const _set = require('lodash/set');

const schema = {
  type: "object",
  description: "Abstract class for all top elements.",
  properties: {
    class: { type: "string" },
    title: {oneOf: [
      { type: "null" },
      { type: "string" }
    ]},
    notes: {oneOf: [
      { type: "null" },
      { type: "string" }
    ]},
    tags: {oneOf: [
      { type: "null" },
      { type: "array", "items": { "type": "string" } }
    ]},
    aux: {oneOf: [
      { type: "null" },
      {
        type: "object",
        additionalProperties: {
          oneOf: [ { "type": "string" }, { "type": "number" }, {"type": "array"}, { "type": "object" }, { "type": "boolean"} ]
        }
      }
    ]}
  }
};

/*
  class Component

  ''' Notes 1 '''
  component1 @Component 'title 1' {
    tags: [tag1, tag2],
    aux: {}
  };
*/
class Component extends Top {
  constructor(isCore = false) {
    super(isCore);

    this.tags = [];
    this.aux = {};
  }
  merge(q = {}) {
    super.merge(q);

    let logger = this._container?.logger;
    let valid = Component.isValid(q, logger);
    
    if (valid) {
      if (q.title === null) {
        delete this.title;
      } else if (q.title !== undefined) {
        this.title = q.title;
      }
      if (q.notes === null) {
        delete this.notes;
      } else if (q.notes !== undefined) { 
        this.notes = q.notes.trim(); // remove trailing symbols
      }
      if (q.tags === null) {
        this.tags = [];
      } else if (q.tags !== undefined) {
        this.tags = q.tags.map((tag) => tag); // clone
      }
      if (q.aux === null) {
        this.aux = {};
      } else if (q.aux) {
        this.aux = cloneDeep(q.aux);
      }
    }
    
    return this;
  }
  // if NS not set, than undefined
  // if set any, than spaceName
  // if set nameless, than 'nameless'
  get space() {
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
  clone() {
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
  updateReferences(_q = {}) {
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
    let renderedOutput = md.render(this.notes)
      .replace(/\n+\r*/g, ' ')
      .trim();
    return renderedOutput;
  }
  static get validate() {
    return ajv.compile(schema);
  }
  /*
    Checking references:
    - check properties based on requirements(): required, find by symbol link
    - create virtual component if local prop refferences to global component
  */
  bind(namespace) {

    let logger = this._container?.logger;
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
  toQ(options = {}) {
    let q = super.toQ(options);
    delete q.action;

    q.class = this.className;
    if (this.namespace && this.namespace.spaceName !== 'nameless') q.space = this.space;
    if (this.title) q.title = this.title;
    if (this.notes) q.notes = this.notes;
    if (this.tags.length > 0) q.tags = this.tags.map((tag) => tag);
    if (Object.keys(this.aux).length > 0) q.aux = cloneDeep(this.aux);

    return q;
  }
  /* recursively create requirements from _requirements, 
  currently it is not optimal */
  static requirements() { 
    if (this.prototype.className === 'Component') {
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
  /* non-unique references */
  _references() {
    return [];
  }
  /*
  array of direct references inside component to another components
  it is used inside irt-nav
  */
  references() {
    let nonUnique = this._references();
    return uniqBy(nonUnique);
  }
}

Component._requirements = {};

module.exports = {
  Component
};
