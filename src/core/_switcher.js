const { Component } = require('./component');

/*
  _Switcher abstract class

  _switcher @_Switcher {
    atStart: true
  };
*/
class _Switcher extends Component {
  constructor(isCore = false){
    super(isCore);
    this.active = true;
  }
  merge(q = {}){
    super.merge(q);
    let logger = this.namespace?.container?.logger;
    let valid = _Switcher.isValid(q, logger);

    if (valid) {
      if (typeof q.atStart !== 'undefined') {
        this.atStart = !!q.atStart;
      }
      q.active !== undefined && (this.active = !!q.active);
    }

    return this;
  }
  get className() {
    return '_Switcher';
  }
  clone(){
    let clonedComponent = super.clone();
    if (typeof this.atStart !== 'undefined')
      clonedComponent.atStart = this.atStart;
    if (typeof this.active !== 'undefined')
      clonedComponent.active = this.active;

    return clonedComponent;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.atStart) res.atStart = true;
    if (this.active === false) res.active = false;

    return res;
  }
}

_Switcher._requirements = {
  atStart: {
    required: false, 
    isReference: false
  }
};

module.exports = {
  _Switcher
};
