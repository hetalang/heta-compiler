const fs = require('fs');
const _Module = require('./_module');
const { xml2js } = require('xml-js');
const { FileSystemError } = require('../heta-error');
const _ = require('lodash');

_Module.prototype.setSBMLModuleAsync = async function(){
  //checking file exists
  if(!fs.existsSync(this.filename)) throw new FileSystemError(`No such file: ${this.filename}`);
  
  let fileContent = fs.readFileSync(this.filename, 'utf8');
  this.parsed = _SBMLParse(this.filename, fileContent);

  return this;
};

function _SBMLParse(filename, fileContent){
  try {
    let JSBML = xml2js(fileContent, {compact: false});
    return jsbmlToQArr(JSBML);
  } catch(e) {
    throw e;
  }
}

/*
  Converst of JSON image of SBML to Heta array
*/
function jsbmlToQArr(JSBML){
  let qArr = [];

  let sbml = JSBML.elements // <file>
    .find((x) => x.name === 'sbml'); // <sbml>

  let model = sbml.elements
    .find((x) => x.name === 'model'); // <model>

  // compartments
  let compartments = _.chain(model.elements)
    .filter(['name', 'listOfCompartments'])
    .map('elements')
    .flatten()
    .filter(['name', 'compartment'])
    .value();
  compartments.forEach((x) => {
    let q = compartmentToQ(x);
    qArr.push(q);
  });

  // species
  let species = _.chain(model.elements)
    .filter(['name', 'listOfSpecies'])
    .map('elements')
    .flatten()
    .filter(['name', 'species'])
    .value();
  species.forEach((x) => {
    let q = speciesToQ(x);
    qArr.push(q);
  });

  // reactions
  let reactions = _.chain(model.elements)
    .filter(['name', 'listOfReactions'])
    .map('elements')
    .flatten()
    .filter(['name', 'reaction'])
    .value();
  reactions.forEach((x) => {
    let q = reactionToQ(x);
    qArr.push(q);
  });

  // parameters
  let parameters = _.chain(model.elements)
    .filter(['name', 'listOfParameters'])
    .map('elements')
    .flatten()
    .filter(['name', 'parameter'])
    .value();
  parameters.forEach((x) => {
    let q = parameterToQ(x);
    qArr.push(q);
  });

  return qArr;
}

/*
  Converts common properties to Heta Object
*/
function baseToQ(x){
  let q = {
    id: _.get(x, 'attributes.id'),
    title: _.get(x, 'attributes.name')
  };
  // set metaid
  let metaid = _.get(x, 'attributes.metaid');
  if (metaid !== undefined) _.set(q, 'aux.metaid', metaid);
  // set sboTerm
  let sboTerm = _.get(x, 'attributes.sboTerm');
  if (sboTerm !== undefined) _.set(q, 'aux.sboTerm', sboTerm);
  // take only first notes
  let notes = x.elements
    && x.elements.find((y) => y.name === 'notes');
  if (notes) q.notes = _toMarkdown(notes.elements);
  // annotation
  let annotation = x.elements
    && x.elements.find((y) => y.name === 'annotation');
  if (annotation) _.set(q, 'aux.annotation', _toAux(annotation.elements));

  return q;
}

function _toMarkdown(elements){
  let text = elements.map((x) => {
    if (x.type === 'text') {
      return x.text.replace(/\r*\n/g, '');
    } else {
      switch (x.name) {
        case 'body':
        case 'div':
        case 'p':
          return _toMarkdown(x.elements) + '\n\n';
          break;
        case 'b':
        case 'strong':
          return '**' + _toMarkdown(x.elements) + '**';
          break;
        case 'i':
          return '_' +_toMarkdown(x.elements) + '_';
          break;
        case 'ul': {
          let list = x.elements.map((y) => '  * ' +_toMarkdown(y.elements))
            .join('\n');
          return list;
          break;
        }
        case 'ol': {
          let list = x.elements.map((y) => '  1. ' +_toMarkdown(y.elements))
            .join('\n');
          return list;
          break;
        }
        case 'a':
          let href = _.get(x, 'attributes.href');
          let title = _.get(x, 'attributes.title');
          return '[' + _toMarkdown(x.elements) + '](' + href + ')';
          break;
        case 'h1':
          return '# ' + _toMarkdown(x.elements) + '\n\n';
          break;
        case 'h2':
          return '## ' + _toMarkdown(x.elements) + '\n\n';
          break;
        case 'h3':
          return '### ' + _toMarkdown(x.elements) + '\n\n';
          break;
        case 'h4':
          return '#### ' + _toMarkdown(x.elements) + '\n\n';
          break;
        case 'h5':
          return '##### ' + _toMarkdown(x.elements) + '\n\n';
          break;
        case 'h6':
          return '###### ' + _toMarkdown(x.elements) + '\n\n';
          break;
      default:
          return _toMarkdown(x.elements);
      }
    }
  }).join('');

  return text;
}

// TODO: use the same result as in SBMLViewer
function _toAux(elements){
  return elements;
}

function compartmentToQ(x){
  let q = baseToQ(x);

  q.class = 'Compartment';
  q.boundary = _.get(x, 'attributes.constant') !== 'false';
  let start_ = _.get(x, 'attributes.size');
  if (start_ !== undefined) _.set(q, 'assignments.start_', start_);

  // compartmentType
  let compartmentType = _.get(x, 'attributes.compartmentType');
  if (compartmentType !== undefined) _.set(q, 'tags.0', compartmentType);

  return q;
}

function speciesToQ(x){
  let q = baseToQ(x);

  q.class = 'Species';
  q.boundary = _.get(x, 'attributes.constant') === 'true' 
    || _.get(x, 'attributes.boundaryCondition') === 'true';
  q.compartment = _.get(x, 'attributes.compartment');
  q.isAmount = _.get(x, 'attributes.hasOnlySubstanceUnits') === 'true';
  let concentration = _.get(x, 'attributes.initialConcentration');
  let amount = _.get(x, 'attributes.initialAmount');
  if (concentration !== undefined && !q.isAmount) {
    _.set(q, 'assignments.start_', concentration);
  } else if (concentration !== undefined && q.isAmount) {
    _.set(q, 'assignments.start_', concentration + '*' + q.compartment);
  } else if (amount !== undefined && !q.isAmount) {
    _.set(q, 'assignments.start_', amount + '/' + q.compartment);
  } else if (amount !== undefined && q.isAmount) {
    _.set(q, 'assignments.start_', amount);
  }
  // speciesType
  let speciesType = _.get(x, 'attributes.speciesType');
  if (speciesType !== undefined) _.set(q, 'tags.0', speciesType);

  return q;
}

function reactionToQ(x){
  let q = baseToQ(x);

  q.class = 'Reaction';
  let ode_ = 'xxx';
  if (ode_ !== undefined) _.set(q, 'assignments.ode_', ode_);

  let reversible = _.get(x, 'attributes.reversible') !== 'false' ;
  _.set(q, 'aux.reversible', reversible);
  let fast = _.get(x, 'attributes.fast') === 'true' ;
  _.set(q, 'aux.fast', fast);

  // products
  let products = x.elements
    && x.elements.find((y) => y.name === 'listOfProducts');
  if (_.has(products, 'elements')) {
    var actors0 = products.elements
      .filter((y) => y.name === 'speciesReference')
      .map((y) => {
        let stoichiometry = _.get(y, 'attributes.stoichiometry');
        return {
          target: _.get(y, 'attributes.species'),
          stoichiometry: Number.parseFloat(stoichiometry)
        };
      });
  } else {
    actors0 = [];
  }

  // reactants
  let reactants = x.elements
    && x.elements.find((y) => y.name === 'listOfReactants');
  if (_.has(reactants, 'elements')) {
    var actors1 = reactants.elements
      .filter((y) => y.name === 'speciesReference')
      .map((y) => {
        let stoichiometry = _.get(y, 'attributes.stoichiometry');
        return {
          target: _.get(y, 'attributes.species'),
          stoichiometry: (-1) * Number.parseFloat(stoichiometry)
        };
      });
  } else {
    actors1 = [];
  }

  // modifiers
  let modifiers = x.elements
    && x.elements.find((y) => y.name === 'listOfModifiers');
  if (_.has(modifiers, 'elements')) {
    var modifiers1 = modifiers.elements
      .filter((y) => y.name === 'modifierSpeciesReference')
      .map((y) => {
        return { target: _.get(y, 'attributes.species') };
      });
  } else {
    modifiers1 = [];
  }

  q.actors = actors0.concat(actors1);
  q.modifiers = modifiers1;

  return q;
}

function parameterToQ(x){
  let q = baseToQ(x);

  let isConstant = _.get(x, 'attributes.constant') === 'true';
  if (isConstant) {
    q.class = 'Const';
    let num = _.get(x, 'attributes.value');
    if (num !== undefined) q.num = Number.parseFloat(num);
  } else {
    q.class = 'Record';
    let start_ = _.get(x, 'attributes.value');
    if (start_ !== undefined) _.set(q, 'assignments.start_', start_);
  }

  return q;
}