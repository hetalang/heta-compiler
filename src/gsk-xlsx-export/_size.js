const { _Size } = require('../core/_size');
const qspToGSK = require('./qsp-to-gsk');

_Size.prototype.toFlat = function(options = {}){
  //let res = super.toFlat(options);
  let res = _Size.__proto__.prototype.toFlat.call(this, options);
  res.unitsGSK = this.unitsGSK();

  return res;
};

_Size.prototype.unitsGSK = function(){
  return this.unitsParsed
    ? this.unitsParsed
      .rebase(qspToGSK)
      .toString()
    : undefined;
};
