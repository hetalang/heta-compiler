const { _Switcher } = require('./_switcher');

class TimeSwitcher extends _Switcher {
  merge(q, skipChecking){
    if(!skipChecking) TimeSwitcher.isValid(q);
    super.merge(q, skipChecking);

    this.start = q.start;
    if(q && q.period!==undefined) this.period = q.period;
    if(q && q.repeatCount!==undefined) this.repeatCount = q.repeatCount;

    return this;
  }
  toQ(){
    let res = super.toQ();
    res.condition = this.condition;
    res.start = this.start;
    if(this.period!==undefined) res.period = this.period;
    if(this.repeatCount!==undefined) res.repeatCount = this.repeatCount;
    return res;
  }
}

module.exports = {
  TimeSwitcher
};
