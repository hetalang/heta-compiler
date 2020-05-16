const { Component } = require('./component');

/*
  _Switcher abstract class

  _switcher @_Switcher {
    // no specific properties
  };
*/
class _Switcher extends Component {
  merge(q = {}){
    super.merge(q);
    let validationLogger = _Switcher.isValid(q);
    
    this.logger.pushMany(validationLogger);

    return this;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    return res;
  }
}

module.exports = {
  _Switcher
};
