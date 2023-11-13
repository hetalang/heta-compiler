const { AbstractExport } = require('../core/abstract-export');
/* global compiledTemplates */
const pkg = require('../../package');
require('./expression'); // to use method toMatlabString()
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
  }
};

class MatlabExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let logger = this._container.logger;
    let valid = MatlabExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'MatlabExport';
  }
  get defaultFilepath() {
    return 'matlab';
  }
  get format(){
    return 'Matlab';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  get requireConcrete() {
    return true;
  }
  // TODO: skipVersionCode does not work
  // skipVersionCode means that the version will not be printed in output
  // this is required for autotests
  makeText(skipVersionCode = false){
    let logger = this._container.logger;

    // filter namespaces if set
    let selectedNamespaces = this.selectedNamespaces();

    let results = [];

    selectedNamespaces.forEach(([spaceName, ns]) => {
      let image = this.getMatlabImage(ns);

      let modelContent = this.getModelCode(image);
      let paramContent = this.getParamCode(image);
      let runContent = this.getRunCode(image);
      

      results.push({
        content: modelContent,
        pathSuffix: `/${spaceName}_model.m`,
        type: 'text'
      });

      results.push({
        content: paramContent,
        pathSuffix: `/${spaceName}_param.m`,
        type: 'text'
      });

      results.push({
        content: runContent,
        pathSuffix: `/${spaceName}_run.m`,
        type: 'text'
      });
    });

    return results;
  }
  getMatlabImage(ns){
    let builderName = pkg.name + ' of v' + pkg.version;
    
    // constants
    let constants = ns
      .selectByInstanceOf('Const');
    // ODE variables
    let dynamicRecords = ns.toArray()
      .filter((x) => x.instanceOf('Record') && !x.isRule);
    // initialize at start records
    let initRecords = ns
      .sortExpressionsByContext('start_')
      .filter((x) => {
        return x.instanceOf('Record') 
          && (x.assignments?.start_ !== undefined || x.isRule);
      });
    // currently we output all records
    let sharedRecords = ns
      .sortExpressionsByContext('ode_', true)
      .filter((x) => x.instanceOf('Record'));
    // RHS of ODE
    let rhs = dynamicRecords
      .map((record) => {
        if (!record.isDynamic) {
          return 0;
        } else { 
          return record.backReferences.map((ref, i) => {
            if (ref.stoichiometry === -1) {
              var st = '-';
            } else if (ref.stoichiometry < 0) {
              st = ref.stoichiometry + '*';
            } else if (ref.stoichiometry === 1){
              st = i === 0 ? '' : '+';
            } else { // ref.stoichiometry >= 0
              st = i === 0 ? ref.stoichiometry + '*' : '+' + ref.stoichiometry + '*';
            }
    
            return st + ref.process;
          }).join(' ');
        }
      });

    // create events from switchers
    let events = ns
      .selectByInstanceOf('_Switcher')
      .map((switcher) => {
        let affect = switcher.namespace.toArray()
          .filter((x) => {
            return x.instanceOf('Record')
              && x.assignments !== undefined
              && x.assignments[switcher.id] !== undefined;
          });
        
        return {
          switcher,
          affect
        };
      });

    let yTranslator = {};
    dynamicRecords.forEach((x, i) => {
      yTranslator[x.id] = `y(${i+1})`;
    });
    
    let pTranslator = {};
    constants.forEach((x, i) => {
      pTranslator[x.id] = `p(${i+1})`;
    });
    // add from events
    let const_len = constants.length;
    events.forEach((x, i) => {
      pTranslator[x.switcher.id + '_'] = `p(${const_len + i + 1})`;
    });

    let functionDefArray = [...ns.container.functionDefStorage.values()];

    return { 
      builderName,
      options: this,
      namespace: ns, // set externally in Container
      constants,
      dynamicRecords,
      rhs,
      initRecords,
      sharedRecords,
      yTranslator,
      pTranslator,
      translator: Object.assign({}, yTranslator, pTranslator),
      events,
      functionDefArray
    };
  }
  getModelCode(image = {}){
    return compiledTemplates['matlab-model.m.njk'].render(image);
  }
  getParamCode(image = {}){
    return compiledTemplates['matlab-param.m.njk'].render(image);
  }
  getRunCode(image = {}){
    return compiledTemplates['matlab-run.m.njk'].render(image);
  }
}

module.exports = MatlabExport;
