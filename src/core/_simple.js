const { markdown } = require('markdown');
const { validator } = require('./utilities.js');
const { IndexedHetaError, SchemaValidationError } = require('../heta-error');
const _ = require('lodash');

/*
  Abstract class _Simple
*/
class _Simple {
  constructor(q = {}){
    if(!q.id || (typeof q.id !== 'string'))
      throw new TypeError('Wrong index ' + JSON.stringify({id: q.id}));
    this._id = q.id;
    this.tags = [];
    this.aux = {};
  }
  merge(q, skipChecking){
    if(!skipChecking) _Simple.isValid(q);

    if(q && q.title) this.title = q.title;
    if(q && q.notes) this.notes = _.trim(q.notes); // remove trailing symbols
    if(q && q.tags) this.tags = _.cloneDeep(q.tags);
    if(q && q.aux) this.aux = _.cloneDeep(q.aux);

    return this;
  }
  get id(){
    return this._id;
  }
  static get schemaName(){
    return '_SimpleP';
  }
  get className(){
    return '_Simple';
  }
  get is_Simple(){
    return true;
  }
  get index(){
    return this.id;
  }
  get indexObj(){
    return {id: this.id};
  }
  clone(){ // creates copy of element TODO: not tested
    return _.clone(this);
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
      throw new IndexedHetaError(q, `The schema "${this.schemaName}" is not found.`);
    }
    let valid = validate(q);
    if(!valid) {
      // console.log(q);
      throw new SchemaValidationError(validate.errors, this.schemaName, q);
    }
  }
  toQ(){
    let res = {};
    res.class = this.className;
    res.id = this.id;
    if(this.title) res.title = this.title;
    if(this.notes) res.notes = this.notes;
    if(this.tags.length>0) res.tags = _.cloneDeep(this.tags);
    if(_.size(this.aux)>0) res.aux = _.cloneDeep(this.aux);

    return res;
  }
}

module.exports = {
  _Simple
};
