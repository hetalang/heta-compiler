const { Record } = require('./record');
const { Expression } = require('./expression');
const _ = require('lodash');
const math = require('mathjs');

class Species extends Record {
  merge(q, skipChecking){
    if(!skipChecking) Species.isValid(q);
    super.merge(q, skipChecking);

    if(q.compartment!==undefined) this.compartment = q.compartment;
    if(q.isAmount!==undefined) this.isAmount = q.isAmount;

    return this;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if(this.compartment) res.compartment = this.compartment;
    if(this.isAmount) res.isAmount = this.isAmount;
    return res;
  }
  unitsSBML(){
    let compartmentUnits = _.get(this, 'compartmentObj.unitsParsed');
    if (!this.isAmount && compartmentUnits!==undefined && this.unitsParsed!==undefined) {
      return this.unitsParsed
        .multiply(compartmentUnits)
        .simplify();
    } else if (this.isAmount && this.unitsParsed!==undefined) {
      return this.unitsParsed;
    } else {
      return undefined;
    }
  }
  unitsHash(useSBMLUnits){ // get normal or substance units
    if(!useSBMLUnits && this.unitsParsed!==undefined){
      return this.unitsParsed.toHash();
    }else if(useSBMLUnits && this.unitsSBML()){
      return this.unitsSBML().toHash();
    }
  }
  dependOn(context, includeCompatment = false){
    let deps = super.dependOn(context);
    if (includeCompatment && !this.isAmount && !this.isRule) {
      deps.push(this.compartment);
    }

    return deps;
  }
  // useAmount = true means that returns amount expression instead of concentration
  /*
  getAssignment(context, useAmount = false){
    if(typeof context !== 'string')
      throw new TypeError('context argument must be of string type.');

    let directExpr = _.get(this, 'assignments.' + context);
    if (directExpr === undefined) {
      return undefined;
    } else if (this.isAmount || !useAmount) {
      return directExpr;
    } else {
      // multiply concentration and compartment
      let args = [
        directExpr.exprParsed,
        new math.expression.node.SymbolNode(this.compartment)
      ];
      let expr = new math.expression.node.OperatorNode('*', 'multiply', args);
      return new Expression(expr);
    }
  }
  */
}

Species._requirements = {
  compartment: {
    required: true,
    isArray: false,
    isReference: true, targetClass: 'Compartment', setTarget: true 
  }
};

module.exports = {
  Species
};
