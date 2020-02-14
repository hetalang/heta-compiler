const { _Switcher } = require('./_switcher');
const { Const } = require('./const');
const { ceil, floor, min, max } = Math;
const _ = require('lodash');

class TimeSwitcher extends _Switcher {
  constructor(isCore = false){
    super(isCore);
    // default start
    this.startObj = (new Const).merge({ num: 0 });
  }
  merge(q={}, skipChecking){
    if(!skipChecking) TimeSwitcher.isValid(q);
    super.merge(q, skipChecking);

    if (typeof q.start === 'string'){
      this.start = q.start;
    } else if (typeof q.start === 'number') {
      this.start = undefined;
      this.startObj = (new Const).merge({ num: q.start });
    }
    if (typeof q.stop === 'string'){
      this.stop = q.stop;
    } else if (typeof q.stop === 'number') {
      this.stop = undefined;
      this.stopObj = (new Const).merge({ num: q.stop });
    }
    if (typeof q.period === 'string'){
      this.period = q.period;
    } else if (typeof q.period === 'number') {
      this.period = undefined;
      this.periodObj = (new Const).merge({ num: q.period });
    }
    if (typeof q.repeatCount === 'string'){
      this.repeatCount = q.repeatCount;
    } else if (typeof q.repeatCount === 'number') {
      this.repeatCount = undefined;
      this.repeatCountObj = (new Const).merge({ num: q.repeatCount });
    }

    return this;
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
    let repeatCount0 = _.get(this, 'repeatCountObj.num');
    let stop1 = _.get(this, 'stopObj.num');
    let period1 = _.get(this, 'periodObj.num');
    let repeatCount1 = stop1 === undefined|| period1 === undefined
      ? undefined
      : ceil((stop1-this.startObj.num)/period1) - 1;

    if (repeatCount0 === undefined && repeatCount1 === undefined){
      var repeatCount = 0;
    } else if (repeatCount0 === undefined) {
      repeatCount = repeatCount1;
    } else if (repeatCount1 === undefined){
      repeatCount = repeatCount0;
    } else {
      repeatCount = min(repeatCount0, repeatCount1);
    }

    return repeatCount;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.condition !== undefined) res.condition = this.condition;

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
    required: false
  },
  stop: {
    required: false
  }
};

module.exports = {
  TimeSwitcher
};
