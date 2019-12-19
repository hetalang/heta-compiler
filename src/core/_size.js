const { _Component } = require('./_component');
const { Unit } = require('./unit');

class _Size extends _Component {
  merge(q, skipChecking){
    if(!skipChecking) _Size.isValid(q);
    super.merge(q, skipChecking);

    if(q.units!==undefined){
      this.unitsParsed = Unit.parse(q.units);
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
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.units) res.units = this.units;

    return res;
  }
}

module.exports = {
  _Size
};