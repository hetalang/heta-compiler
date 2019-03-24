const Container = require('../container');
const { Record } = require('../core/record');
const { Compartment } = require('../core/compartment');
const { Species } = require('../core/species');
// const { Process } = require('../core/process');
const { Reaction } = require('../core/reaction');
const { Expression } = require('../core/expression');
// const { Numeric } = require('../core/numeric');
const { Event } = require('../core/event');
const nunjucks = require('../nunjucks-env');
const _ = require('lodash');
require('./record');

Container.prototype.toSBML = function(scope = 'default__'){
  let selected = {
    uniqueUnits: this.getUniqueUnits(scope),
    listOfCompartments: this.storage.getByInstance(Compartment, scope),
    listOfSpecies: this.storage.getByInstance(Species, scope),
    listOfParameters: this.getListOfParameters(scope),
    listOfProcesses: this.storage.getByClassName('Process', scope),
    listOfReactions: this.storage.getByInstance(Reaction, scope),
    listOfRules: this.getListOfRules(scope),
    listOfInitialAssignments: this.getListOfInitialAssignments(scope),
    listOfEvents: this.storage.getByInstance(Event, scope)
  };
  let SBMLText = nunjucks.render('sbml/template.xml.njk', {out: selected});

  return SBMLText;
};

Container.prototype.getUniqueUnits = function(scope = 'default__'){
  let quantities = this.storage
    .getByInstance(Record, scope)
    .filter((record) => record.variable.units);
  return _.uniqBy(quantities, (record) => record.unitsHash);
};

Container.prototype.getListOfParameters = function(scope = 'default__'){
  return this.storage
    .getByInstance(Record, scope)
    .filter((record) => !(record instanceof Compartment)
      && !(record instanceof Species)
      && !(record instanceof Reaction)
    );
};

Container.prototype.getListOfRules = function(scope = 'default__'){
  return this.storage
    .getByInstance(Record, scope)
    .filter((record) => !(record instanceof Reaction)
        && record.variable.kind==='rule'
    );
};

Container.prototype.getListOfInitialAssignments = function(scope = 'default__'){
  return this.storage
    .getByInstance(Record, scope)
    .filter((record) => (record.variable.size instanceof Expression)
        && record.variable.kind!=='rule'
    );
};
