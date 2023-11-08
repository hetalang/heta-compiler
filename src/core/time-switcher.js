const { _Switcher } = require('./_switcher');
const { Const } = require('./const');
/*
  TimeSwitcher class

  ts1 @TimeSwitcher {
    start: 12,
    period: 6,
    stop: 120
  };
  ts2 @TimeSwitcher {
    start: start1, // ref to @Const
    period: period1,
    stop: stop1
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
    let logger = this.namespace?.container?.logger;
    let valid = TimeSwitcher.isValid(q, logger);

    if (valid) {
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
    }

    return this;
  }
  get className() {
    return 'TimeSwitcher';
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
  }
};

module.exports = {
  TimeSwitcher
};
