const _ = require('lodash');

const expect = require('chai').expect;
const { _Simple } = require('./_simple');

/*
  Abstract class _Scoped
*/
class _Scoped extends _Simple {
  constructor(ind){
    super(ind);
    if(ind.space!==undefined) {
      expect(ind.space).be.a('string');
      // expect(ind.space).not.be.equal('global__');
      this._space = ind.space;
    }else{
      this._space = 'default__';
    }
  }
  merge(q, skipChecking){
    if(!skipChecking) _Scoped.isValid(q);
    super.merge(q, skipChecking);

    return this;
  }
  get space(){
    return this._space;
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
