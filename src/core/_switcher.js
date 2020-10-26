const { Component } = require('./component');
const _ = require('lodash');

/*
  _Switcher abstract class

  _switcher @_Switcher {
    atStart: true
  };
*/
class _Switcher extends Component {
  merge(q = {}){
    super.merge(q);
    let logger = _.get(this, 'namespace.container.logger');
    let valid = _Switcher.isValid(q, logger);

    if (valid) {
      if (typeof q.atStart !== 'undefined') {
        this.atStart = q.atStart;
      }
    }

    return this;
  }
  clone(){
    let clonedComponent = super.clone();
    if (typeof this.atStart !== 'undefined')
      clonedComponent.atStart = this.atStart;
      
    return clonedComponent;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.atStart) res.atStart = true;

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
