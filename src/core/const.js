const { _Size } = require('./_size');
const _ = require('lodash');

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
    let logger = _.get(this, 'namespace.container.logger');
    let valid = Const.isValid(q, logger);

    if (valid) {
      if (q.num !== undefined) this.num = q.num;
      if (q.free !== undefined) this.free = q.free;
      if (q.scale !== undefined) this.scale = q.scale;
      if (q.lower !== undefined) this.lower = q.lower;
      if (q.upper !== undefined) this.upper = q.upper;
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
    let logger = this.namespace.container.logger;

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
