const { _Component } = require('./_component');
const { Unit } = require('./unit');
const { ValidationError, BindingError } = require('../heta-error');


class _Size extends _Component {
  merge(q = {}, skipChecking){
    if(!skipChecking) _Size.isValid(q);
    super.merge(q, skipChecking);

    if(q.units!==undefined){
      if (typeof q.units === 'string')
        this.unitsParsed = Unit.parse(q.units);
      else
        this.unitsParsed = Unit.fromQ(q.units);
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
  /** Additional check of units items */
  bind(container, skipErrors = false){
    super.bind(container, skipErrors);

    let messages = [];

    if (this.unitsParsed){
      this.unitsParsed.forEach((x) => {
        let target = container.select({id: x.kind, space: this.space});
        
        if(!target){
          messages.push(`Unit "${x.kind}" is not found as expected here: `
            + `${this.index} { unit: ${this.units} };`);
        }else if(!target.instanceOf('UnitDef')){
          messages.push(`Unit "${x.kind}" is not of UnitDef class as expected here: `
            + `${this.index} { unit: ${this.units} };`);
        }else{
          // kindObj can be set here
        }
      });
    }
    
    if(messages.length>0 && !skipErrors)
      throw new BindingError(this.index, messages, 'References error in units:');
  }
  /* used only in sbml */
  unitsSBML(){
    return this.unitsParsed;
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