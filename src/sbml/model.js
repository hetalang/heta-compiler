const { Model } = require('../core/model');
const { Record } = require('../core/record');
const { Reaction } = require('../core/reaction');
const { Expression } = require('../core/expression');
const nunjucks = require('../nunjucks-env');
const _ = require('lodash');
require('./record');

Model.prototype.toSBML = function(){
  if(!this.populated)
    throw new Error(`Model ${this.id} must be populated before exporting to SBML.` );
  let SBMLText = nunjucks.render('sbml/template.xml.njk', {model: this});

  return SBMLText;
};

Model.prototype.getUniqueUnits = function(){
  let quantities = this
    .getByInstance(Record)
    .filter((record) => record.units);
  return _.uniqBy(quantities, (record) => record.unitsHash);
};

Model.prototype.getListOfRules = function(){
  return this
    .getByInstance(Record)
    .filter((record) => !(record instanceof Reaction)
        && _.has(record, 'assignments.ode_')
    );
};

Model.prototype.getListOfInitialAssignments = function(){
  return this
    .getByInstance(Record)
    .filter((record) => _.get(record, 'assignments.start_') instanceof Expression);
};
