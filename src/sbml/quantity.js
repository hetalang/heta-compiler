const { Quantity } = require('../core/quantity');
const {UnitsParser, qspUnits, qspToSbml} = require('units-parser');
let uParser = new UnitsParser(qspUnits);

Quantity.prototype.getUnitDefinition = function(){
  let transformator = qspToSbml; // TODO: add user defined units
  return uParser
    .parse(this.variable.units)
    .toXmlUnitDefinition(transformator, {nameStyle: 'HTML'});
};
