const { _Component } = require('./_component');
const { Unit } = require('./unit');

/*
  Abstract class _Size

  size1 @_Size {
    units: unit1/unit2 // <UnitsExpr>
  };
  size2 @_Size {
    units: [ // <UnitsArray>
      {kind: unit1, multiplier: 1, exponent: 1},
      {kind: unit2, multiplier: 1, exponent: -1}
    ] 
  };
*/
class _Size extends _Component {
  merge(q = {}){
    super.merge(q);
    let validationLogger = _Size.isValid(q);

    this.logger.pushMany(validationLogger);
    if (!validationLogger.hasErrors) {
      if(q.units!==undefined){
        if (typeof q.units === 'string')
          this.unitsParsed = Unit.parse(q.units);
        else
          this.unitsParsed = Unit.fromQ(q.units);
      }
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
  bind(namespace){
    let logger = super.bind(namespace);

    if (this.unitsParsed){
      this.unitsParsed.forEach((x) => {
        let target = namespace.get(x.kind);
        
        if(!target){
          let msg = `Unit "${x.kind}" is not found as expected here: `
            + `${this.index} { unit: ${this.units} };`;
          logger.error(msg, 'BindingError');
        }else if(!target.instanceOf('UnitDef')){
          let msg = `Unit "${x.kind}" is not of UnitDef class as expected here: `
            + `${this.index} { unit: ${this.units} };`;
          logger.error(msg, 'BindingError');
        }else{
          // kindObj can be set here
          x.kindObj = target;
        }
      });
    }
    
    return logger;
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
  unitsRebased(legalUnits = [], usePefix = false){
    if (this.unitsParsed!==undefined){
      return this.unitsParsed
        .rebase(legalUnits)
        .toString(usePefix);
    } else {
      return undefined;
    }
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.unitsParsed) res.units = this.unitsParsed.toQ(options);

    return res;
  }
}

module.exports = {
  _Size
};