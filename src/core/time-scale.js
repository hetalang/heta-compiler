const { _Size } = require('./_size');
const { UnitTerm } = require('./unit-term');
const { ajv } = require('../ajv');

const schema = {
  type: 'object',
  description: 't and other time scales',
  properties: {
    slope: {oneOf: [
      { type: 'number', exclusiveMinimum: 0 },
      { type: 'null' }
    ]},
    intercept: {oneOf: [
      { type: 'number' },
      { type: 'null' }
    ]},
    output: {oneOf: [
      { enum: [true, false, 1, 0] },
      { type: 'null' }
    ]}
  }
};

/*
  time_in_minutes @TimeScale {
    units: (60 seconds),
    slope: 0.0167,
    intercept: 0,
    output: true
  };

  time_in_minutes = t * slope + intercept
*/

class TimeScale extends _Size { // implicit extend Numeric
  constructor(isCore = false){
    super(isCore);
  } 
  merge(q = {}){
    super.merge(q);
    let logger = this._container?.logger;
    let valid = TimeScale.isValid(q, logger);

    if (valid) {
      if (q.slope === null) {
        delete this.slope;
      } else if (q.slope !== undefined) {
        this.slope = q.slope;
      }
      if (q.intercept === null) {
        delete this.intercept;
      } else if (q.intercept !== undefined) {
        this.intercept = q.intercept;
      }
      if (q.output === null) {
        delete this.output;
      } else if (q.output !== undefined) {
        this.output = !!q.output;
      }
    }

    return this;
  }
  get className() {
    return 'TimeScale';
  }
  clone(){
    let clonedComponent = super.clone();

    if (this.slope !== undefined) clonedComponent.slope = this.slope;
    if (this.intercept !== undefined) clonedComponent.intercept = this.intercept;
    if (this.output !== undefined) clonedComponent.output = this.output;
      
    return clonedComponent;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.id !== 't' && this.slope !== undefined) res.slope = this.slope;
    if (this.id !== 't' && this.intercept !== undefined) res.intercept = this.intercept;
    if (this.output === true) res.output = this.output;

    // if base time scale than we "update" not "insert"
    if (this.id === 't') {
      delete res.class;
    }

    return res;
  }
  get legalTerms(){
    return [
      new UnitTerm([{kind: 'time'}])
    ];
  }
  static get validate() {
    return ajv.compile(schema);
  }
}

TimeScale._requirements = {
  slope: {
    required: true
  },
  intercept: {
    required: true
  }
};

module.exports = {
  TimeScale
};
