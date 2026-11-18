const { _Size } = require('./_size');
const { ajv } = require('../ajv');

const schema = {
  type: 'object',
  description: 'Input value. Upper and lower describes possible values. Scale describes transformation for fitting.',
  properties: {
    free: {oneOf: [
      { enum: [true, false, 1, 0] },
      { type: 'null' }
    ]},
    num: {oneOf: [
      { type: 'number' },
      { type: 'null' }
    ]},
    scale: {oneOf: [
      { type: 'string', enum: ['direct', 'log', 'logit'], default: 'direct' },
      { type: 'null' }
    ]},
    upper: {oneOf: [
      { type: 'number' },
      { type: 'null' }
    ]},
    lower: {oneOf: [
      { type: 'number' },
      { type: 'null' }
    ]}
  }
};

/*
  size1 @Const {
    num: 1.0,
    free: true,
    scale: direct,
    lower: -6,
    upper: 6
  };
*/

class Const extends _Size { // implicit extend Numeric
  constructor(isCore = false){
    super(isCore);
    this.scale = 'direct';
  } 
  merge(q = {}){
    super.merge(q);
    let logger = this._container?.logger;
    let valid = Const.isValid(q, logger);

    if (valid) {
      if (q.num === null) {
        delete this.num;
      } else if (q.num !== undefined) {
        this.num = q.num;
      }
      if (q.free === null) {
        delete this.free;
      } else if (q.free !== undefined) {
        this.free = !!q.free;
      }
      if (q.scale === null) {
        delete this.scale;
      } else if (q.scale !== undefined) {
        this.scale = q.scale;
      }
      if (q.lower === null) {
        delete this.lower;
      } else if (q.lower !== undefined) {
        this.lower = q.lower;
      }
      if (q.upper === null) {
        delete this.upper;
      } else if (q.upper !== undefined) {
        this.upper = q.upper;
      }
    }

    return this;
  }
  get className() {
    return 'Const';
  }
  get numFloat(){
    return Number.isInteger(this.num)
      ? this.num.toString() + '.0'
      : this.num.toString();
  }
  // Actually this is not bind but just checking after loading all components
  // It checks lower<=num<=upper, 0<num if scale=='log', 0<num<1 if scale=='logit'
  bind(namespace){
    super.bind(namespace);
    let logger = this._container?.logger;

    // should be: lower <= num
    if (this.lower !== undefined && this.lower > this.num) {
      logger.error(
        `Constant "${this.index}" value ${this.num} is below its lower bound ${this.lower}.`,
        {diagnosticCode: 'VALUE_OUT_OF_BOUNDS', space: this.space, id: this.id, path: 'num', value: this.num, bound: 'lower', limit: this.lower}
      );
    }
    // should be: num <= upper
    if (this.upper !== undefined && this.upper < this.num) {
      logger.error(
        `Constant "${this.index}" value ${this.num} is above its upper bound ${this.upper}.`,
        {diagnosticCode: 'VALUE_OUT_OF_BOUNDS', space: this.space, id: this.id, path: 'num', value: this.num, bound: 'upper', limit: this.upper}
      );
    }
    // for scale=='log' should be: num > 0
    if ((this.scale === 'log' || this.scale === 'logit') && this.num <= 0) {
      logger.error(
        `Constant "${this.index}" must have a positive value for the "${this.scale}" scale; got ${this.num}.`,
        {diagnosticCode: 'SCALE_VALUE_OUT_OF_RANGE', space: this.space, id: this.id, path: 'num', value: this.num, scale: this.scale}
      );
    }
    // for scale=='logit' should be: num < 0
    if (this.scale === 'logit' && this.num >= 1) {
      logger.error(
        `Constant "${this.index}" must be less than 1 for the "logit" scale; got ${this.num}.`,
        {diagnosticCode: 'SCALE_VALUE_OUT_OF_RANGE', space: this.space, id: this.id, path: 'num', value: this.num, scale: this.scale}
      );
    }
  }
  checkUnits(){
    if (this.unitsParsed === undefined) {
      this._container.logger.warn(
        `No units set for "${this.index}"`,
        {diagnosticCode: 'MISSING_UNIT', space: this.space, id: this.id, path: 'units'}
      );
    }
  }
  clone(){
    let clonedComponent = super.clone();
    if (typeof this.num !== 'undefined')
      clonedComponent.num = this.num;
    if (typeof this.free !== 'undefined')
      clonedComponent.free = this.free;
    if (typeof this.scale !== 'undefined')
      clonedComponent.scale = this.scale;
    if (typeof this.lower !== 'undefined')
      clonedComponent.lower = this.lower;
    if (typeof this.upper !== 'undefined')
      clonedComponent.upper = this.upper;
      
    return clonedComponent;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.num !== undefined) res.num = this.num;
    if (this.free) res.free = true;
    if (this.scale !== undefined && this.scale !== 'direct') res.scale = this.scale;
    if (this.lower !== undefined) res.lower = this.lower;
    if (this.upper !== undefined) res.upper = this.upper;

    return res;
  }
  static get validate() {
    return ajv.compile(schema);
  }
}

Const._requirements = {
  num: {
    required: true
  },
  scale: {
    required: false
  },
  lower: {
    required: false
  },
  upper: {
    required: false
  }
};

module.exports = {
  Const
};
