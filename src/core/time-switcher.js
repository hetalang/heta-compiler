const { _Switcher } = require('./_switcher');
const { Const } = require('./const');
const { floor, min } = Math;
const _ = require('lodash');
/*
  TimeSwitcher class

  ts1 @TimeSwitcher {
    start: 12,
    period: 6,
    stop: 120,
    repeatCount: 8
  };
  ts2 @TimeSwitcher {
    start: start1, // ref to @Const
    period: period1,
    stop: stop1,
    repeatCount: count1
  };

  How many times does it switch?
  if (repeatCount < 0 || stop-start < 0) return 0;
  if (period <= 0 || 0 <= repeatCount < 1 || 0 <= (stop-start)/period < 1) return 1;
  if (period > 0 && 1 <= repeatCount && 1 <= (stop-start)/period) return n;
  if (period > 0 && repeatCount === Infinity/undefined && stop === Infinity/undefined) return Infinity;
*/
class TimeSwitcher extends _Switcher {
  constructor(isCore = false){
    super(isCore);
    // default start
    this.startObj = (new Const).merge({ num: 0 });
  }
  merge(q = {}){
    super.merge(q);
    let validationLogger = TimeSwitcher.isValid(q);

    this.logger.pushMany(validationLogger);
    if (!validationLogger.hasErrors) {
      // empty means anon 0 as default
      if (typeof q.start === 'string'){
        this.start = q.start;
      } else if (typeof q.start === 'number') {
        delete this.start;
        this.startObj = (new Const).merge({ num: q.start });
      }
      // empty is same as 0
      if (typeof q.period === 'string'){
        this.period = q.period;
      } else if (typeof q.period === 'number') {
        delete this.period;
        this.periodObj = (new Const).merge({ num: q.period });
      }
      // empty is the same as Infinity
      if (typeof q.stop === 'string'){
        this.stop = q.stop;
      } else if (typeof q.stop === 'number') {
        delete this.stop;
        this.stopObj = (new Const).merge({ num: q.stop });
      }
      // empty is the same as Infinity
      if (typeof q.repeatCount === 'string'){
        this.repeatCount = q.repeatCount;
      } else if (typeof q.repeatCount === 'number') {
        delete this.repeatCount;
        this.repeatCountObj = (new Const).merge({ num: q.repeatCount });
      }
    }

    return this;
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
    } else if (_.has(this, 'startObj.num')) {
      return this.startObj.num;
    }
  }
  getPeriod(){
    if (this.period !== undefined) {
      return this.period;
    } else if (_.has(this, 'periodObj.num')) {
      return this.periodObj.num;
    }
  }
  getStop(){
    if (this.stop !== undefined) {
      return this.stop;
    } else if (_.has(this, 'stopObj.num')) {
      return this.stopObj.num;
    }
  }
  getRepeatCount(){
    if (this.repeatCount !== undefined) {
      return this.repeatCount;
    } else if (_.has(this, 'repeatCountObj.num')) {
      return this.repeatCountObj.num;
    }
  }
  getRepeatCountInt(){
    let repeatCount0 = _.get(this, 'repeatCountObj.num', Infinity);
    let stop1 = _.get(this, 'stopObj.num', Infinity);
    let period1 = _.get(this, 'periodObj.num', 0);

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
}

TimeSwitcher._requirements = {
  start: {
    required: false,
    isArray: false,
    isReference: true, targetClass: 'Const', setTarget: true
  },
  stop: {
    required: false,
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
  }
};

module.exports = {
  TimeSwitcher
};
