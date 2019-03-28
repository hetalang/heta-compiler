const { Model } = require('../core/model');
const { Record } = require('../core/record');
const { Compartment } = require('../core/compartment');
const { Species } = require('../core/species');
// const { Process } = require('../core/process');
const { Reaction } = require('../core/reaction');
const { Expression } = require('../core/expression');
// const { Numeric } = require('../core/numeric');
const { Switcher } = require('../core/switcher');
const nunjucks = require('../nunjucks-env');
const _ = require('lodash');
require('./record');

Model.prototype.toSBML = function(){
  if(!this.populated)
    throw new Error(`Model ${this.id} must be populated before exporting to SBML.` );
  let space = this.id;
  let selected = {
    model: this,
    uniqueUnits: this.getUniqueUnits(space),
    listOfCompartments: this._storage.getByInstance(Compartment, space),
    listOfSpecies: this._storage.getByInstance(Species, space),
    listOfParameters: this._storage.getByClassName('Record', space),
    listOfProcesses: this._storage.getByClassName('Process', space),
    listOfReactions: this._storage.getByInstance(Reaction, space),
    listOfRules: this.getListOfRules(space),
    listOfInitialAssignments: this.getListOfInitialAssignments(space),
    listOfEvents: this._storage.getByInstance(Switcher, space)
  };
  let SBMLText = nunjucks.render('sbml/template.xml.njk', selected);

  return SBMLText;
};

Model.prototype.getUniqueUnits = function(space){
  let quantities = this._storage
    .getByInstance(Record, space)
    .filter((record) => record.units);
  return _.uniqBy(quantities, (record) => record.unitsHash);
};

Model.prototype.getListOfRules = function(space){
  return this._storage
    .getByInstance(Record, space)
    .filter((record) => !(record instanceof Reaction)
        && _.has(record, 'assignments.ode_')
    );
};

Model.prototype.getListOfInitialAssignments = function(space){
  return this._storage
    .getByInstance(Record, space)
    .filter((record) => _.get(record, 'assignments.start_') instanceof Expression);
};
