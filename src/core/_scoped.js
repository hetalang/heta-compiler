const _ = require('lodash');

const expect = require('chai').expect;
const { _Simple } = require('./_simple');

/*
  Abstract class _Scoped
*/
class _Scoped extends _Simple {
  constructor(ind){
    super(ind);
    expect(ind).to.have.property('space').with.a('string');
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
