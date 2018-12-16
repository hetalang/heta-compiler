const { Variable } = require('../core/variable');
const {UnitsParser, qspUnits, Unit, qspToSbml} = require('units-parser');
let uParser = new UnitsParser(qspUnits);

/*
Object.defineProperty(Variable.prototype, 'unitDefinition', {
  get: function(){
    let transformator = qspToSbml; // TODO: add user defined units
    return uParser
      .parse(this.units)
      .toXmlUnitDefinition(transformator);
  }
});
*/

Variable.prototype.getUnitDefinition = function(){
  let transformator = qspToSbml; // TODO: add user defined units
  return uParser
    .parse(this.units)
    .toXmlUnitDefinition(transformator, {nameStyle: 'HTML'});
}
