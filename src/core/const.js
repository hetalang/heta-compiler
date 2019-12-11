const { _Component } = require('./_component');
const { UnitsParser, qspUnits } = require('units-parser');
let uParser = new UnitsParser(qspUnits);

class Const extends _Component { // implicit extend Numeric
  merge(q, skipChecking){
    if(!skipChecking) Const.isValid(q);
    super.merge(q, skipChecking);

    if(q.num!==undefined) this.num = q.num;
    this.free = q.free ? q.free : false;
    if(q.units!==undefined){
      //this.units = q.units;
      this.unitsParsed = uParser.parse(q.units);
    }

    return this;
  }
  get units(){
    if(this.unitsParsed!==undefined){
      return this.unitsParsed.toString();
    }else{
      return undefined;
    }
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.num !== undefined) res.num = this.num;
    if (this.free) res.free = true;
    if (this.units) res.units = this.units;

    return res;
  }
  /* used only in sbml */
  unitsSBML(){
    return this.unitsParsed;
  }
  // temporal solution
  unitsSimbio(){
    return this.units;
  }
  unitsHash(){
    if(this.unitsParsed!==undefined){
      return this.unitsParsed.toHash();
    }else{
      return undefined;
    }
  }
}

module.exports = {
  Const
};
