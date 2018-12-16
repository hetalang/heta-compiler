const _ = require('lodash');
const { markdown } = require('markdown');
const { validator } = require('./utilities.js');

/*
  Abstract class _Simple
*/
class _Simple {
  constructor(q){
    _Simple.isValid(q);

    if(q.title) this.title = q.title;
    if(q.notes) this.notes = q.notes;
    if(q.tags) this.tags = q.tags;
    if(q.aux) this.aux = q.aux;
  }
  static get schemaName(){
    return 'SimpleQ';
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
      console.log(validate.errors); // TODO: delete later
      throw new Error('Validation error!');
    }
  }
  toQ(){
    let res = _.pick(this, ['title', 'notes', 'tags', 'aux']);
    res.class = this.className;
    return res;
  }
}

module.exports = {
  _Simple
};
