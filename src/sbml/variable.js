const { Variable } = require('../core/variable');
const {UnitsParser, qspUnits, qspToSbml} = require('units-parser');
let uParser = new UnitsParser(qspUnits);

Variable.prototype.getUnitDefinition = function(){
  let transformator = qspToSbml; // TODO: add user defined units
  return uParser
    .parse(this.units)
    .toXmlUnitDefinition(transformator, {nameStyle: 'HTML'});
};
