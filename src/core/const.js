const { _Component } = require('./_component');
const { UnitsParser, qspUnits } = require('units-parser');
let uParser = new UnitsParser(qspUnits);

class Const extends _Component { // implicit extend Numeric
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

  toQ(){
    let res = super.toQ();
    res.num = this.num;
    if(this.free) res.free = true;
    if(this.units) res.units = this.units;
    return res;
  }
  unitsSBML(){
    return this.units;
  }
  unitsHash(){
    if(this.units){
      return uParser
        .parse(this.units)
        .toHash();
    }else{
      return undefined;
    }
  }
}

module.exports = {
  Const
};
