const { _Size } = require('./_size');

/*
  size1 @Const {
    num: 1.0,
    free: true
  };
*/

class Const extends _Size { // implicit extend Numeric
  merge(q = {}){
    super.merge(q);
    let validationLogger = Const.isValid(q);

    this.logger.pushMany(validationLogger);
    if (!validationLogger.hasErrors) {
      if(q.num!==undefined) this.num = q.num;
      this.free = q.free ? q.free : false;
    }

    return this;
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

    return res;
  }
}

Const._requirements = {
  num: {
    required: true
  }
};

module.exports = {
  Const
};
