/*global describe, it*/
const schema = require('../../src/heta.json-schema.json');
const { expect } = require('chai');

const Ajv = require('ajv');
const validator = new Ajv().addSchema(schema);

// scoped
const record = require('./record');
const recordError = require('./record-error');
const process = require('./process');
const processError = require('./process-error');
const model = require('./model');
const modelError = require('./model-error');
const monteCarloTask = require('./monteCarloTask');
const monteCarloTaskError = require('./monteCarloTask-error');
const page = require('./page');
const pageError = require('./page-error');
const switcher = require('./continuousSwitcher');
const switcherError = require('./continuousSwitcher-error');

// unscoped
const unitDefinition = require('./unit-definition');
const functionDefinition = require('./function-definition');
const referenceDefinition = require('./reference-definition');
const const_ = require('./const');
const observation = require('./observation');

// scoped
singleTest('Record', record, recordError);
singleTest('Process', process, processError);
singleTest('ContinuousSwitcher', switcher, switcherError);
singleTest('Model', model, modelError);
singleTest('MonteCarloTask', monteCarloTask, monteCarloTaskError);
singleTest('Page', page, pageError);

// unscoped
singleTest('UnitDefinition', unitDefinition);
singleTest('FunctionDefinition', functionDefinition);
singleTest('ReferenceDefinition', referenceDefinition);
singleTest('Const', const_);
singleTest('Observation', observation);

function singleTest(className, checkedArray, errorArray){
  describe(`Test ${className} instances.`, () => {
    let validate = validator.getSchema(`http://qs3p.insilicobio.ru#/definitions/${className}`);
    // no errors
    checkedArray && checkedArray.forEach((component) => {
      let valid = validate(component);
      // if(!valid) console.log(validate.errors);
      it(`Structure OK of ${component.class} id :"${component.id}"`, () => {
        expect(valid).to.be.true;
      })
    });
    // errors
    errorArray && errorArray.forEach((component) => {
      it(`Wrong structure of ${component.class} id : "${component.id}"`, () => {
        validate(component);
        // console.log(validate.errors);
        expect(validate.errors[component.aux.validationResult.num].params)
          .to.have.property(component.aux.validationResult.prop);
      });
    });
  });
}
