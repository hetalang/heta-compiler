const { Component } = require('./component');
const { ajv } = require('../ajv');

const schema = {
  type: 'object',
  properties: {
    active: {oneOf: [
      {
        description: 'if false the event will not run.',
        enum: [true, false, 1, 0],
        default: true
      },
      { type: 'null' }
    ]}
  }
};

/*
  _Switcher abstract class

  _switcher @_Switcher {
    active: true
  };
*/
class _Switcher extends Component {
  constructor(isCore = false){
    super(isCore);
    this.active = true;
  }
  merge(q = {}){
    super.merge(q);
    let logger = this._container?.logger;
    let valid = _Switcher.isValid(q, logger);

    if (valid) {
      if (q.active === null) {
        delete this.active;
      } else if (q.active !== undefined) {
        this.active = !!q.active;
      }
    }

    return this;
  }
  get className() {
    return '_Switcher';
  }
  clone(){
    let clonedComponent = super.clone();
    if (typeof this.active !== 'undefined')
      clonedComponent.active = this.active;

    return clonedComponent;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.active === false) res.active = false;

    return res;
  }
  static get validate() {
    return ajv.compile(schema);
  }
}

_Switcher._requirements = {};

module.exports = {
  _Switcher
};
