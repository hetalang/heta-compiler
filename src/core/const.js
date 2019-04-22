const { _Simple } = require('./_simple');

class Const extends _Simple { // implicit extend Numeric
  merge(q, skipChecking){
    if(!skipChecking) Const.isValid(q);
    super.merge(q, skipChecking);
    if(typeof q==='number'){
      this.num = q;
      this.free = false;
    }else{
      this.num = q.num;
      this.free = q.free ? q.free : false;
      if(q.units!==undefined) this.units = q.units;
    }

    return this;
  }
  static get schemaName(){
    return 'ConstP';
  }
  get className(){
    return 'Const';
  }
  toQ(){
    let res = super.toQ();
    res.num = this.num;
    if(this.free) res.free = true;
    if(this.units) res.units = this.units;
    return res;
  }
}

module.exports = {
  Const
};
