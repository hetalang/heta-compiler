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
    // what about space?

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
  get indexString(){
    return this.id + '$' + this.space;
  }
  toQ(){
    let res = super.toQ();
    res.space = this.space;
    return res;
  }
  populate(){
    // do nothing
  }
}

module.exports = {
  _Scoped
};
