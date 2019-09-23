//const _ = require('lodash');
//const { IndexedHetaError } = require('../heta-error');
const { _Simple } = require('./_simple');

/*
  Abstract class _Scoped
*/
class _Scoped extends _Simple {
  constructor(q = {}){
    super(q);
    if(!q.space || (typeof q.space !== 'string'))
      throw new TypeError('Space must be set for scoped classes, wrong index ' + JSON.stringify({id: q.id, space: q.space}));
    this._space = q.space;
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
  get isScoped(){
    return true;
  }
  toQ(){
    let res = super.toQ();
    res.space = this.space;
    return res;
  }
}

module.exports = {
  _Scoped
};
