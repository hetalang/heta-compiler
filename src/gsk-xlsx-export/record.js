const { Record } = require('../core/record');

Record.prototype.toFlat = function(options = {}){
  //let res = super.toFlat(options);
  let res = Record.__proto__.prototype.toFlat.call(this, options);
  res.unitsSimbio = this.unitsSimbio();

  return res;
};
