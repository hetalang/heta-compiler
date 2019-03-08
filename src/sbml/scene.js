/*
  Adds toSBML() method to scene
*/
const { Scene } = require('../core/scene');
const nunjucks = require('../nunjucks-env');
const { Expression } = require('../core/expression');
const { Quantity } = require('../core/quantity');
const { Compartment } = require('../core/compartment');
const { Species } = require('../core/species');
const { Reaction } = require('../core/reaction');
const { Process } = require('../core/process');
const { Event } = require('../core/event');

Scene.prototype.toSBML = function(){
  let sbmlText = nunjucks.render('sbml/template.xml.njk', {out: this});
  return sbmlText;
};

Object.defineProperty(Scene.prototype, 'listOfCompartments', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => quantity instanceof Compartment);
  }
});

Object.defineProperty(Scene.prototype, 'listOfSpecies', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => quantity instanceof Species);
  }
});

Object.defineProperty(Scene.prototype, 'listOfParameters', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => quantity instanceof Quantity
        && !(quantity instanceof Compartment)
        && !(quantity instanceof Species)
        && !(quantity instanceof Reaction));
  }
});

Object.defineProperty(Scene.prototype, 'listOfReactions', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => quantity instanceof Reaction);
  }
});

Object.defineProperty(Scene.prototype, 'listOfRules', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => !(quantity instanceof Reaction) && quantity.variable.kind==='rule' );
  }
});

Object.defineProperty(Scene.prototype, 'listOfProcesses', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => !(quantity instanceof Reaction) && quantity instanceof Process );
  }
});

Object.defineProperty(Scene.prototype, 'listOfInitialAssignments', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => {
        return (quantity.variable.size instanceof Expression)
          && quantity.variable.kind!=='rule';
      });
  }
});

Object.defineProperty(Scene.prototype, 'listOfEvents', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => quantity instanceof Event );
  }
});
