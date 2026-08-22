const { Component } = require('./component');
const { ajv } = require('../ajv');

const schema = {
  type: 'object',
  properties: {
    active: {oneOf: [
      {
        description: 'if false the event will not run.',
        enum: [true, false, 1, 0]
      },
      { type: 'null' }
    ]},
    priority: {oneOf: [
      { type: 'number' },
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

      if (q.priority === null) {
        delete this.priority;
      } else if (q.priority !== undefined) {
        this.priority = q.priority;
      }
    }

    return this;
  }
  get className() {
    return '_Switcher';
  }
  clone(){
    let clonedComponent = super.clone();
    if (typeof this.active !== 'undefined') {
      clonedComponent.active = this.active;
    } else {
      delete clonedComponent.active;
    }

    if (typeof this.priority !== 'undefined') {
      clonedComponent.priority = this.priority;
    }

    return clonedComponent;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.active === false) {
      res.active = false;
    } else if (this.active === undefined) {
      res.active = null;
    }
    if (this.priority !== undefined) {
      res.priority = this.priority;
    }

    return res;
  }
  static get validate() {
    return ajv.compile(schema);
  }
}

_Switcher._requirements = {
  active: {
    required: true
  }
};

module.exports = {
  _Switcher
};
