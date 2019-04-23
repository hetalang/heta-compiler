const _ = require('lodash');
const { IndexedHetaError } = require('../heta-error');
const { _Simple } = require('./_simple');

/*
  Abstract class _Scoped
*/
class _Scoped extends _Simple {
  constructor(ind){
    super(ind);
    if(!ind.space || (typeof ind.space !== 'string'))
      throw new IndexedHetaError(ind, 'Wrong index ' + JSON.stringify({id: ind.id, space: ind.space}));
    this._space = ind.space;
  }
  merge(q, skipChecking){
    if(!skipChecking) _Scoped.isValid(q);
    super.merge(q, skipChecking);

    return this;
  }
  get space(){
    return this._space;
  }
  get index(){
    return this.space + '.' + this.id;
  }
  get indexObj(){
    return {id: this.id, space: this.space};
  }
  static get schemaName(){
    return '_ScopedP';
  }
  get className(){
    return '_Scoped';
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
