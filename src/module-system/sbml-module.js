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

  //console.log(parameters[0]);
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