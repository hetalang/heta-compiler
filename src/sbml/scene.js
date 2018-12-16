/*
  Adds toSBML() method to scene
*/
const { Scene } = require('../core/scene');
const nunjucks = require('../nunjucks-env');
const { Expression } = require('../core/_size');
const { Compartment } = require('../core/compartment');
const { Species } = require('../core/species');
const { Reaction } = require('../core/reaction');
const _ = require('lodash');

Scene.prototype.toSBML = function(){
  let sbmlText = nunjucks.render('sbml/template.xml.njk', {out: this});
  return sbmlText;
};

Object.defineProperty(Scene.prototype, 'listOfCompartments', {
  get: function(){
    return _.filter(this._components, (variable) => variable.parent instanceof Compartment);
  }
});

Object.defineProperty(Scene.prototype, 'listOfSpecies', {
  get: function(){
    return _.filter(this._components, (variable) => variable.parent instanceof Species);
  }
});

Object.defineProperty(Scene.prototype, 'listOfParameters', {
  get: function(){
    return _.filter(this._components, (variable) => variable.parent.className==='Quantity');
  }
});

Object.defineProperty(Scene.prototype, 'listOfReactions', {
  get: function(){
    return _.filter(this._components, (variable) => variable.parent instanceof Reaction);
  }
});

Object.defineProperty(Scene.prototype, 'listOfRules', {
  get: function(){
    return _.filter(this._components, (variable) => {
      return !(variable.parent instanceof Reaction)
      && variable.kind==='rule';
    });
  }
});

Object.defineProperty(Scene.prototype, 'listOfInitialAssignments', {
  get: function(){
    return _.filter(this._components, (variable) => {
      return (variable.size instanceof Expression)
      && variable.kind!=='rule';
    });
  }
});
