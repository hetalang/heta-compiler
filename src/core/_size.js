const { Component } = require('./component');
const { Unit } = require('./unit');
const _ = require('lodash');

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
class _Size extends Component {
  merge(q = {}){
    super.merge(q);
    let logger = _.get(this, 'namespace.container.logger');
    let valid = _Size.isValid(q, logger);

    if (valid) {
      if (q.units) {
        if (typeof q.units === 'string')
          this.unitsParsed = Unit.parse(q.units);
        else
          this.unitsParsed = Unit.fromQ(q.units);
      }
    }

    return this;
  }
  clone(){
    let componentClone = super.clone();
    if (this.unitsParsed)
      componentClone.unitsParsed = this.unitsParsed.clone();

    return componentClone;
  }
  get units(){
    if (this.unitsParsed !== undefined) {
      return this.unitsParsed.toString();
    } else {
      return undefined;
    }
  }
  /** Additional check of units items */
  bind(namespace){
    super.bind(namespace);
    let logger = this.namespace.container.logger;

    if (this.unitsParsed) {
      this.unitsParsed.forEach((x) => {
        let target = namespace.get(x.kind);
        
        if (!target) {
          let msg = `Unit "${x.kind}" is not found as expected here: `
            + `${this.index} { units: ${this.units} };`;
          logger.error(msg, {type: 'BindingError', space: this.space});
        } else if (!target.instanceOf('UnitDef')){
          let msg = `Unit "${x.kind}" is not of UnitDef class as expected here: `
            + `${this.index} { units: ${this.units} };`;
          logger.error(msg, {type: 'BindingError', space: this.space});
        } else {
          // kindObj can be set here
          x.kindObj = target;
        }
      });
    }
  }
  /* used only in sbml */
  unitsSBML(){
    return this.unitsParsed;
  }
  unitsHash(){
    if(this.unitsParsed !== undefined){
      return this.unitsParsed.toHash();
    }else{
      return undefined;
    }
  }
  unitsRebased(legalUnits = [], usePefix = false){
    if (this.unitsParsed !== undefined){
      try {
        return this.unitsParsed
          .rebase(legalUnits)
          .toString(usePefix);
      } catch(err) {
        let logger = this.namespace.container.logger;
        let msg = err.message;
        logger.warn(msg);
        return undefined;
      }
    } else {
      return undefined;
    }
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.unitsParsed) {
      if (options.noUnitsExpr) {
        res.units = this.unitsParsed.toQ(options);
      } else {
        res.units = this.units;
      }
    }

    return res;
  }
  _references(){
    let classSpecificRefs = [];

    return super._references()
      .concat(classSpecificRefs);
  }
}

module.exports = {
  _Size
};