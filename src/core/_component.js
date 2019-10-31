const { markdown } = require('markdown');
const { validator } = require('./utilities.js');
const { IndexedHetaError, SchemaValidationError } = require('../heta-error');
const _ = require('lodash');

/*
  Abstract class _Component
*/
class _Component {
  constructor(q = {}){ // q must be in form {id: <string>} or {id: <string>, space: <string>}
    if(q.id && (typeof q.id === 'string')){
      this._id = q.id;
    }else{
      throw new TypeError('Wrong index ' + JSON.stringify({id: q.id}));
    }
    if(q.space){
      if(typeof q.space === 'string'){
        this._space = q.space;
      }else{
        throw new TypeError('Wrong index, space should be string, but get ' + q.space);
      }
    }

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
  /*
  clone(){ // creates copy of element TODO: not tested
    return _.clone(this);
  }
  */
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
      throw new IndexedHetaError(q, `The schema "${this.schemaName}" is not found.`);
    }
    let valid = validate(q);
    if(!valid) {
      throw new SchemaValidationError(validate.errors, this.schemaName, q);
    }
  }
  toQ(){
    let res = {};
    res.class = this.className;
    res.id = this._id;
    if(this._space) res.space = this._space;
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
