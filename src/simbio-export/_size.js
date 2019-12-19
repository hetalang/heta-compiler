const { _Size } = require('../core/_size');
const qspToSbml = require('../qsp-to-sbml');

_Size.prototype.unitsSimbio = function(){
  let res = this.unitsParsed
    .rebase(qspToSbml)
    .toString();
  return res;
};
