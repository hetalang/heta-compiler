const { _Size } = require('../core/_size');
const qspToSbml = require('../qsp-to-sbml');

_Size.prototype.unitsSimbio = function(){
  return this.unitsParsed
    ? this.unitsParsed
      .rebase(qspToSbml)
      .toString()
    : undefined;
};
