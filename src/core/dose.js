const { _Size } = require('./_size');
const { Const } = require('./const');
const { floor, min } = Math;

const { ajv } = require('../ajv');

const schema = {
  // TODO: add validation
};

/*
  Dose class
*/
class Dose extends _Size {
  constructor(isCore = false){
    super(isCore);
    // default start
    this.startObj = (new Const).merge({ num: 0 });
  }
  merge(q = {}){
    super.merge(q);
    let logger = this._container?.logger;
    let valid = Dose.isValid(q, logger);

    if (valid) {
      // empty means anon 0 as default
      if (typeof q.start === 'string') {
        this.start = q.start;
      } else if (typeof q.start === 'number') {
        delete this.start;
        this.startObj = (new Const).merge({ num: q.start });
      }
      // empty is same as 0
      if (typeof q.period === 'string') {
        this.period = q.period;
      } else if (typeof q.period === 'number') {
        delete this.period;
        this.periodObj = (new Const).merge({ num: q.period });
      }
      // empty is the same as Infinity
      if (typeof q.repeatCount === 'string') {
        this.repeatCount = q.repeatCount;
      } else if (typeof q.repeatCount === 'number') {
        delete this.repeatCount;
        this.repeatCountObj = (new Const).merge({ num: q.repeatCount });
      }
      // set target
      if (typeof q.target !== 'undefined') {
        this.target = q.target;
      }
      // set amount 
      if (typeof q.amount === 'string') {
        this.amount = q.amount;
      } else if (typeof q.amount === 'number') {
        delete this.amount;
        this.amountObj = (new Const).merge({ num: q.amount });
      }
    }

    return this;
  }
  get className() {
    return 'Dose';
  }
  clone(){
    let clonedComponent = super.clone();
    if (typeof this.start === 'string'){
      clonedComponent.start = this.start;
    } else if (typeof this.startObj !== 'undefined') {
      clonedComponent.startObj = this.startObj.clone();
    }
    if (typeof this.stop === 'string'){
      clonedComponent.stop = this.stop;
    } else if (typeof this.stopObj !== 'undefined') {
      clonedComponent.stopObj = this.stopObj.clone();
    }
    if (typeof this.period === 'string'){
      clonedComponent.period = this.period;
    } else if (typeof this.periodObj !== 'undefined') {
      clonedComponent.periodObj = this.periodObj.clone();
    }
    if (typeof this.repeatCount === 'string'){
      clonedComponent.repeatCount = this.repeatCount;
    } else if (typeof this.repeatCountObj !== 'undefined') {
      clonedComponent.repeatCountObj = this.repeatCountObj.clone();
    }
      
    return clonedComponent;
  }
  getStart(){
    if (this.start !== undefined) {
      return this.start;
    } else if (this.startObj?.num !== undefined) {
      return this.startObj.num;
    }
  }
  getPeriod(){
    if (this.period !== undefined) {
      return this.period;
    } else if (this.periodObj?.num !== undefined) {
      return this.periodObj.num;
    }
  }
  getStop(){
    if (this.stop !== undefined) {
      return this.stop;
    } else if (this.stopObj?.num !== undefined) {
      return this.stopObj.num;
    }
  }
  getRepeatCount(){
    if (this.repeatCount !== undefined) {
      return this.repeatCount;
    } else if (this.repeatCountObj?.num !== undefined) {
      return this.repeatCountObj.num;
    }
  }
  getRepeatCountInt(){
    let repeatCount0 = this.repeatCountObj?.num !== undefined
      ? this.repeatCountObj.num
      : Infinity;
    let stop1 = this.stopObj?.num !== undefined
      ? this.stopObj.num
      : Infinity;
    let period1 = this.periodObj?.num || 0;

    // update repeatCount based on stop
    let repeatCount = period1 <= 0
      ? repeatCount0
      : min(repeatCount0, (stop1-this.startObj.num)/period1);

    return repeatCount === Infinity ? undefined : floor(repeatCount);
  }
  toQ(options = {}){
    let res = super.toQ(options);

    if (this.startObj !== undefined) {
      res.start = this.getStart();
    }
    if (this.periodObj !== undefined) {
      res.period = this.getPeriod();
    }
    if (this.stopObj !== undefined) {
      res.stop = this.getStop();
    }
    if (this.repeatCountObj !== undefined) {
      res.repeatCount = this.getRepeatCount();
    }

    return res;
  }
  static get validate() {
    return ajv.compile(schema);
  }
}

Dose._requirements = {
  start: {
    required: true,
    isArray: false,
    isReference: true, targetClass: 'Const', setTarget: true
  },
  period: {
    required: false,
    isArray: false,
    isReference: true, targetClass: 'Const', setTarget: true
  },
  repeatCount: {
    required: false,
    isArray: false,
    isReference: true, targetClass: 'Const', setTarget: true
  },
  target: {
    required: true,
    isArray: false,
    isReference: true, targetClass: 'Species', setTarget: true
  },
  amount: {
    required: true,
    isArray: false,
    isReference: true, targetClass: 'Const', setTarget: true
  }
};

module.exports = {
  Dose
};
