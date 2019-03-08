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
    super.merge(q, skipChecking);

    this.space = (q && q.space) ? q.space : 'default__';

    return this;
  }
  static get schemaName(){
    return '_ScopedP';
  }
  get className(){
    return '_Scoped';
  }
  get index(){
    return {id: this.id, space: this.space};
  }
  toQ(){
    let res = super.toQ();
    if(this.space) res.space = this.space;
    return res;
  }
  populate(){
    // do nothing
  }
}

module.exports = {
  _Scoped
};
