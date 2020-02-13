const { _Switcher } = require('./_switcher');

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
