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

  console.log(parameters);
  return qArr;
}

function compartmentToQ(x){
  let start_ = _.get(x, 'attributes.size');
  let q = {
    id: _.get(x, 'attributes.id'),
    class: 'Compartment',
    title: _.get(x, 'attributes.name'),
    boundary: _.get(x, 'attributes.constant') !== 'false'
  };
  if (start_ !== undefined) q.assignments = { start_: start_ };

  return q;
}

function parameterToQ(x){
  let isConstant = _.get(x, 'attributes.constant') === 'true';
  if (isConstant) {
    let num = _.get(x, 'attributes.value');
    var q = {
      id: _.get(x, 'attributes.id'),
      class: 'Const',
      title: _.get(x, 'attributes.name') 
    };
    if (num !== undefined) q.num = Number.parseFloat(num);
  } else {
    let start_ = _.get(x, 'attributes.value');

    q = {
      id: _.get(x, 'attributes.id'),
      class: 'Record',
      title: _.get(x, 'attributes.name')
    };

    if (start_ !== undefined) q.assignments = { start_: start_ };
  }

  return q;
}