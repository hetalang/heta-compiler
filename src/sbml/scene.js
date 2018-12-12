/*
  Adds toSBML() method to scene
*/
const { Scene } = require('../core/scene');
const nunjucks = require('../nunjucks-env');

Scene.prototype.toSBML = function(){
  let sbmlText = nunjucks.render('sbml/template.xml.njk', {out: this});
  return sbmlText;
};
