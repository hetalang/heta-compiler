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
    num: { extendedNumber: true },
    scale: {oneOf: [
      { type: 'string', enum: ['direct', 'log', 'logit'] },
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
    let normalizedQ = q.num === undefined ? q : {...q, num: normalizeNum(q.num)};
    super.merge(normalizedQ);
    let logger = this._container?.logger;
    let valid = Const.isValid(normalizedQ, logger);

    if (valid) {
      if (normalizedQ.num !== undefined) {
        this.num = normalizedQ.num;
      }
      if (normalizedQ.free === null) {
        delete this.free;
      } else if (normalizedQ.free !== undefined) {
        this.free = !!normalizedQ.free;
      }
      if (normalizedQ.scale === null) {
        delete this.scale;
      } else if (normalizedQ.scale !== undefined) {
        this.scale = normalizedQ.scale;
      }
      if (normalizedQ.lower === null) {
        delete this.lower;
      } else if (normalizedQ.lower !== undefined) {
        this.lower = normalizedQ.lower;
      }
      if (normalizedQ.upper === null) {
        delete this.upper;
      } else if (normalizedQ.upper !== undefined) {
        this.upper = normalizedQ.upper;
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
      let msg = `Constant "${this.index}" is outside of borders: ${this.num}(num) < ${this.lower}(lower)`;
      logger.error(msg, {type: 'BindingError', space: this.space});
    }
    // should be: num <= upper
    if (this.upper !== undefined && this.upper < this.num) {
      let msg = `Constant "${this.index}" is outside of borders: ${this.num}(num) > ${this.upper}(upper)`;
      logger.error(msg, {type: 'BindingError', space: this.space});
    }
    // for scale=='log' should be: num > 0
    if ((this.scale === 'log' || this.scale === 'logit') && this.num <= 0) {
      let msg = `Constant "${this.index}" ${this.num}(num) is not positive that is not allowed for "log" and "logit" scale`;
      logger.error(msg, {type: 'BindingError', space: this.space});
    }
    // for scale=='logit' should be: num < 0
    if (this.scale === 'logit' && this.num >= 1) {
      let msg = `Constant "${this.index}" ${this.num}(num) is not less than 1 that is not allowed for "logit" scale`;
      logger.error(msg, {type: 'BindingError', space: this.space});
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

function normalizeNum(value) {
  if (value === 'Infinity' || value === '+Infinity') return Infinity;
  if (value === '-Infinity') return -Infinity;
  if (value === 'NaN') return NaN;
  return value;
}

module.exports = {
  Const
};
