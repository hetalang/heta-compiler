const { _Switcher } = require('./_switcher');
const { ceil, floor, min, max } = Math;

class TimeSwitcher extends _Switcher {
  merge(q={}, skipChecking){
    if(!skipChecking) TimeSwitcher.isValid(q);
    super.merge(q, skipChecking);

    if(q.start!==undefined) this.start = q.start;
    if(q.stop!==undefined) this.stop = q.stop;
    if(q.period!==undefined) this.period = q.period;
    if(q.repeatCount!==undefined) this.repeatCount = q.repeatCount;

    return this;
  }
  getRepeatCount(){
    let repeatCount0 = this.repeatCount === undefined
      ? undefined
      : floor(this.repeatCount);
    let repeatCount1 = this.stop === undefined || this.period === undefined
      ? undefined
      : ceil((this.stop-this.start)/this.period) - 1;

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
    res.condition = this.condition;
    res.start = this.start;
    if(this.period!==undefined) res.period = this.period;
    if(this.stop!==undefined) res.stop = this.stop;
    if(this.repeatCount!==undefined) res.repeatCount = this.repeatCount;
    return res;
  }
}

TimeSwitcher._requirements = {
  start: {
    required: true
  },
  stop: {
    required: false
  }
};

module.exports = {
  TimeSwitcher
};
