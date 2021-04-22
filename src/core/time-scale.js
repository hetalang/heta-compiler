const { _Size } = require('./_size');
const { UnitTerm } = require('./unit-term');
const _ = require('lodash');

/*
  time_in_minutes @TimeScale {
    units: (60 seconds),
    slope: 0.0167,
    intercept: 0
  };

  time_in_minutes = t * slope + intercept
*/

class TimeScale extends _Size { // implicit extend Numeric
  constructor(isCore = false){
    super(isCore);
    this.slope = 1;
    this.intercept = 0;
  } 
  merge(q = {}){
    super.merge(q);
    let logger = _.get(this, 'namespace.container.logger');
    let valid = TimeScale.isValid(q, logger);

    if (valid) {
      if (q.slope !== undefined) this.slope = q.slope;
      if (q.intercept !== undefined) this.intercept = q.intercept;
    }

    return this;
  }
  clone(){
    let clonedComponent = super.clone();

    clonedComponent.slope = this.slope;
    clonedComponent.intercept = this.intercept;
      
    return clonedComponent;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.slope !== 1) res.slope = this.slope;
    if (this.intercept !== 0) res.intercept = this.intercept;

    return res;
  }
  get legalTerms(){
    return [
      new UnitTerm([{kind: 'time'}])
    ]
  }
}

module.exports = {
  TimeScale
};
