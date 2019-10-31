const { _Component } = require('./_component');

class _Switcher extends _Component {
  merge(q, skipChecking){
    if(!skipChecking) _Switcher.isValid(q);
    super.merge(q, skipChecking);

    return this;
  }
  toQ(){
    let res = super.toQ();
    return res;
  }
}

module.exports = {
  _Switcher
};
