const { Component } = require('./component');
const { ajv } = require('../ajv');

const schema = {
  type: 'object',
  properties: {
    atStart: {oneOf: [
      {
        description: 'If true than the condition will be checked at start_',
        enum: [true, false, 1, 0],
        default: false
      },
      { type: 'null' }
    ]},
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
    let logger = this._container?.logger;
    let valid = _Switcher.isValid(q, logger);

    if (valid) {
      if (q.atStart === null) {
        delete this.atStart;
      } else if (typeof q.atStart !== 'undefined') {
        this.atStart = !!q.atStart;
      }
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
  static get validate() {
    return ajv.compile(schema);
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
