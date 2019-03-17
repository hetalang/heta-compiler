const { markdown } = require('markdown');
const { validator } = require('./utilities.js');
const { SchemaValidationError } = require('../exceptions');
const _ = require('lodash');
const expect = require('chai').expect;

/*
  Abstract class _Simple
*/
class _Simple {
  constructor(ind){
    expect(ind).has.property('id').be.a('string');
    this._id = ind.id;
    this.tags = [];
    this.aux = {};
  }
  merge(q, skipChecking){
    if(!skipChecking) _Simple.isValid(q);

    if(q && q.title) this.title = q.title;
    if(q && q.notes) this.notes = q.notes;
    if(q && q.tags) this.tags = _.cloneDeep(q.tags);
    if(q && q.aux) this.aux = _.cloneDeep(q.aux);

    return this;
  }
  get id(){
    return this._id;
  }
  get space(){
    return 'default__';
    // to use specific space for unscoped objects
    // currently it is not used because unclear how to estimate what to select when
    // class is not set for update() method
    // return 'global__';
  }
  static get schemaName(){
    return '_Simple';
  }
  get className(){
    return '_Simple';
  }
  get index(){
    return this.space + '.' + this.id;
  }
  clone(){ // creates copy of element TODO: not tested
    let clone = _.clone(this);
    return clone;
  }
  get notesMdTree(){
    if(this.notes){
      return markdown.parse(this.notes);
    }else{
      return;
    }
  }
  get notesHTML() {
    if(this.notes){
      let HTMLTree = markdown.toHTMLTree(this.notesMdTree);
      return markdown.renderJsonML(HTMLTree);
    }else{
      return;
    }
  }
  static isValid(q){
    let validate = validator
      .getSchema('http://qs3p.insilicobio.ru#/definitions/' + this.schemaName);
    let valid = validate(q);
    if(!valid) {
      throw new SchemaValidationError('Validation error!', validate.errors);
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
  populate(){
    // do nothing
  }
}

module.exports = {
  _Simple
};
