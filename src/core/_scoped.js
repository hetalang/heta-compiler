const _ = require('lodash');
const { markdown } = require('markdown');
const { validator } = require('./utilities.js');
const { exception } = require('../exceptions');

const { _Simple } = require('./_simple');

/*
  Abstract class _Scoped
*/
class _Scoped extends _Simple {
  merge(q, skipChecking){
    if(!skipChecking) _Scoped.isValid(q);

    if(q && q.title) this.title = q.title;
    if(q && q.notes) this.notes = q.notes;
    if(q && q.tags) this.tags = _.clone(q.tags);
    if(q && q.aux) this.aux = _.clone(q.aux);

    return this;
  }
  static get schemaName(){
    return '_ScopedP';
  }
  get className(){
    return '_Scoped';
  }
  get index(){
    return {id: this.id};
  }
  get indexString(){
    return this.id;
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
      exception(validate.errors);
      throw new Error('Validation error!');
    }

  }
  toQ(){
    let res = _.pick(this, ['title', 'notes', 'tags', 'aux', 'id']);
    res.class = this.className;
    return res;
  }

  populate(){
    // do nothing
  }

}

module.exports = {
  _Scoped
};
