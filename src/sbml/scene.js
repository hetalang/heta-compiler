/*
  Adds toSBML() method to model
*/
const { Model } = require('../core/model');
const nunjucks = require('../nunjucks-env');
const { Expression } = require('../core/expression');
const { Quantity } = require('../core/quantity');
const { Compartment } = require('../core/compartment');
const { Species } = require('../core/species');
const { Reaction } = require('../core/reaction');
const { Process } = require('../core/process');
const { Event } = require('../core/event');

Model.prototype.toSBML = function(){
  let sbmlText = nunjucks.render('sbml/template.xml.njk', {out: this});
  return sbmlText;
};

Object.defineProperty(Model.prototype, 'listOfCompartments', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => quantity instanceof Compartment);
  }
});

Object.defineProperty(Model.prototype, 'listOfSpecies', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => quantity instanceof Species);
  }
});

Object.defineProperty(Model.prototype, 'listOfParameters', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => quantity instanceof Quantity
        && !(quantity instanceof Compartment)
        && !(quantity instanceof Species)
        && !(quantity instanceof Reaction));
  }
});

Object.defineProperty(Model.prototype, 'listOfReactions', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => quantity instanceof Reaction);
  }
});

Object.defineProperty(Model.prototype, 'listOfRules', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => !(quantity instanceof Reaction) && quantity.variable.kind==='rule' );
  }
});

Object.defineProperty(Model.prototype, 'listOfProcesses', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => !(quantity instanceof Reaction) && quantity instanceof Process );
  }
});

Object.defineProperty(Model.prototype, 'listOfInitialAssignments', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => {
        return (quantity.variable.size instanceof Expression)
          && quantity.variable.kind!=='rule';
      });
  }
});

Object.defineProperty(Model.prototype, 'listOfEvents', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => quantity instanceof Event );
  }
});
