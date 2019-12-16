const { _Size } = require('./_size');

class Const extends _Size { // implicit extend Numeric
  merge(q, skipChecking){
    if(!skipChecking) Const.isValid(q);
    super.merge(q, skipChecking);

    if(q.num!==undefined) this.num = q.num;
    this.free = q.free ? q.free : false;

    return this;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.num !== undefined) res.num = this.num;
    if (this.free) res.free = true;

    return res;
  }
}

module.exports = {
  Const
};
