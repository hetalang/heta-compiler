/*
  Adds toSBML() method to scene
*/
const { Scene } = require('../core/scene');
const nunjucks = require('../nunjucks-env');
const { Expression } = require('../core/_size');
const { Compartment } = require('../core/compartment');
const { Species } = require('../core/species');
const { Reaction } = require('../core/reaction');
const {UnitsParser, qspUnits, qspToSbml} = require('units-parser');
let uParser = new UnitsParser(qspUnits);
const _ = require('lodash');

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
      .filter((quantity) => quantity.className==='Quantity');
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

Object.defineProperty(Scene.prototype, 'listOfInitialAssignments', {
  get: function(){
    return this
      .getQuantities()
      .filter((quantity) => (quantity.variable.size instanceof Expression) && quantity.variable.kind!=='rule' );
  }
});
