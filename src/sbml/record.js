const { Record } = require('../core/record');
const { UnitsParser, qspUnits, qspToSbml } = require('units-parser');
let uParser = new UnitsParser(qspUnits);

Record.prototype.getUnitDefinition = function(){
  let transformator = qspToSbml; // TODO: add user defined units
  return uParser
    .parse(this.units)
    .toXmlUnitDefinition(transformator, {nameStyle: 'HTML'});
};
