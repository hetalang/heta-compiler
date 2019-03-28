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
  let scope = this.id;
  let selected = {
    model: this,
    uniqueUnits: this.getUniqueUnits(scope),
    listOfCompartments: this._storage.getByInstance(Compartment, scope),
    listOfSpecies: this._storage.getByInstance(Species, scope),
    listOfParameters: this._storage.getByClassName('Record', scope),
    listOfProcesses: this._storage.getByClassName('Process', scope),
    listOfReactions: this._storage.getByInstance(Reaction, scope),
    listOfRules: this.getListOfRules(scope),
    listOfInitialAssignments: this.getListOfInitialAssignments(scope),
    listOfEvents: this._storage.getByInstance(Switcher, scope)
  };
  let SBMLText = nunjucks.render('sbml/template.xml.njk', {out: selected});

  return SBMLText;
};

Model.prototype.getUniqueUnits = function(scope){
  let quantities = this._storage
    .getByInstance(Record, scope)
    .filter((record) => record.units);
  return _.uniqBy(quantities, (record) => record.unitsHash);
};
/*
Model.prototype.getListOfParameters = function(scope){
  return this._storage
    .getByInstance(Record, scope)
    .filter((record) => !(record instanceof Compartment)
      && !(record instanceof Species)
      && !(record instanceof Reaction)
    );
};
*/
Model.prototype.getListOfRules = function(scope){
  return this._storage
    .getByInstance(Record, scope)
    .filter((record) => !(record instanceof Reaction)
        && _.has(record, 'assignments.ode_')
    );
};

Model.prototype.getListOfInitialAssignments = function(scope){
  return this._storage
    .getByInstance(Record, scope)
    .filter((record) => _.get(record, 'assignments.start_') instanceof Expression);
};
