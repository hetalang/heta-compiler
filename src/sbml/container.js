const { Container } = require('../container');
const { Quantity } = require('../core/quantity');
const { Compartment } = require('../core/compartment');
const { Species } = require('../core/species');
// const { Process } = require('../core/process');
const { Reaction } = require('../core/reaction');
const { Expression } = require('../core/expression');
// const { Numeric } = require('../core/numeric');
const { Event } = require('../core/event');
const nunjucks = require('../nunjucks-env');
const _ = require('lodash');
require('./quantity');

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
    .getByInstance(Quantity, scope)
    .filter((quantity) => quantity.variable.units);
  return _.uniqBy(quantities, (quantity) => quantity.unitsHash);
};

Container.prototype.getListOfParameters = function(scope = 'default__'){
  return this.storage
    .getByInstance(Quantity, scope)
    .filter((quantity) => !(quantity instanceof Compartment)
      && !(quantity instanceof Species)
      && !(quantity instanceof Reaction)
    );
};

Container.prototype.getListOfRules = function(scope = 'default__'){
  return this.storage
    .getByInstance(Quantity, scope)
    .filter((quantity) => !(quantity instanceof Reaction)
        && quantity.variable.kind==='rule'
    );
};

Container.prototype.getListOfInitialAssignments = function(scope = 'default__'){
  return this.storage
    .getByInstance(Quantity, scope)
    .filter((quantity) => (quantity.variable.size instanceof Expression)
        && quantity.variable.kind!=='rule'
    );
};
