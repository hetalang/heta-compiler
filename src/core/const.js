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
  get numFloat(){
    return Number.isInteger(this.num)
      ? this.num.toString() + '.0'
      : this.num.toString();
  }
  clone(){
    let clonedComponent = super.clone();
    if (typeof this.num !== 'undefined')
      clonedComponent.num = this.num;
    if (typeof this.free !== 'undefined')
      clonedComponent.free = this.free;
      
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
