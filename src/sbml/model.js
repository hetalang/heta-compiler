const { Model } = require('../core/model');
const { Record } = require('../core/record');
const { Reaction } = require('../core/reaction');
const { Expression } = require('../core/expression');
const nunjucks = require('../nunjucks-env');
const _ = require('lodash');
// require('./record');
const { UnitsParser, qspUnits } = require('units-parser');
let uParser = new UnitsParser(qspUnits);

Model.prototype.toSBML = function(){
  this.populate(); // populate before any export
  let SBMLText = nunjucks.render('sbml/template.xml.njk', {model: this});

  return SBMLText;
};

Model.prototype.getUniqueUnits = function(){
  return _.chain(this.selectByInstance(Record))
    .filter((record) => record.SBMLUnits())
    .uniqBy((record) => record.unitsHash(true))
    .map((record) => record.SBMLUnits())
    .value();
};

Model.prototype.getListOfUnitDefinitions = function(){
  return this.getUniqueUnits()
    .map((units) => {
      return uParser
        .parse(units)
        .toSbmlUnitDefinition({nameStyle: 'string', simplify: true});
    });
};

Model.prototype.getListOfRulesAssignment = function(){
  return this
    .selectByInstance(Record)
    .filter((record) => !(record instanceof Reaction)
        && _.has(record, 'assignments.ode_')
        && !record.assignments.ode_.increment
    );
};

Model.prototype.getListOfRulesRate = function(){
  return this
    .selectByInstance(Record)
    .filter((record) => !(record instanceof Reaction)
        && _.has(record, 'assignments.ode_')
        && record.assignments.ode_.increment
    );
};

Model.prototype.getListOfInitialAssignments = function(){
  return this
    .selectByInstance(Record)
    .filter((record) => _.get(record, 'assignments.start_.size') instanceof Expression);
};
