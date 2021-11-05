const { AbstractExport } = require('../core/abstract-export');
const nunjucks = require('nunjucks');
const pkg = require('../../package');
const _ = require('lodash');
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

    if (q.spaceFilter instanceof Array) {
      this.spaceFilter = q.spaceFilter;
    } else if (typeof q.spaceFilter === 'string') {
      this.spaceFilter = [q.spaceFilter];
    } else {
      this.spaceFilter = ['nameless'];
    }
  }
  get className(){
    return 'MatlabExport';
  }
  get format(){
    return 'Matlab';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  // TODO: skipVersionCode does not work
  // skipVersionCode means that the version will not be printed in output
  // this is required for autotests
  make(skipVersionCode = false){
    // use only one namespace
    let logger = this._container.logger;
    if (this.spaceFilter.length === 0) {
      let msg = 'spaceFilter for Matlab format should include at least one namespace but get empty';
      logger.error(msg);
      var modelContent = '';
      var paramContent = '';
      var runContent = '';
    } else if (!this._container.namespaceStorage.has(this.spaceFilter[0])) {
      let msg = `Namespace "${this.spaceFilter[0]}" does not exist.`;
      logger.error(msg);
      modelContent = '';
      paramContent = '';
      runContent = '';
    } else {
      if (this.spaceFilter.length > 1) {
        let msg = `Matlab format does not support multispace export. Only first namespace "${this.spaceFilter[0]}" will be used.`;
        logger.warn(msg);
      }
      let ns = this._container.namespaceStorage.get(this.spaceFilter[0]);
      let image = this.getMatlabImage(ns);

      modelContent = this.getModelCode(image);
      paramContent = this.getParamCode(image);
      runContent = this.getRunCode(image);
    }

    return [
      {
        content: modelContent,
        pathSuffix: '/model.m',
        type: 'text'
      },
      {
        content: paramContent,
        pathSuffix: '/param.m',
        type: 'text'
      },
      {
        content: runContent,
        pathSuffix: '/run.m',
        type: 'text'
      }
    ];
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
      .filter((x) => x.instanceOf('Record') && (_.has(x, 'assignments.start_') || x.isRule));
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

    let yTranslator = dynamicRecords
      .map((x, i) => [x.id, `y(${i+1})`]);
    let pTranslator = constants
      .map((x, i) => [x.id, `p(${i+1})`]);

    // create events from switchers
    let events = ns
      .selectByInstanceOf('_Switcher')
      .map((switcher) => {
        let affect = switcher.namespace.toArray()
          .filter((x) => {
            return x.instanceOf('Record') 
              && _.has(x, 'assignments.' + switcher.id);
          });
        
        return {
          switcher,
          affect
        };
      });

    return { 
      builderName,
      options: this,
      namespace: ns, // set externally in Container
      constants,
      dynamicRecords,
      rhs,
      initRecords,
      sharedRecords,
      yTranslator: _.fromPairs(yTranslator),
      pTranslator: _.fromPairs(pTranslator),
      translator: _.fromPairs(yTranslator.concat(pTranslator)),
      events
    };
  }
  getModelCode(image = {}){
    return nunjucks.render(
      'matlab-model.m.njk',
      image
    );
  }
  getParamCode(image = {}){
    return nunjucks.render(
      'matlab-param.m.njk',
      image
    );
  }
  getRunCode(image = {}){
    return nunjucks.render(
      'matlab-run.m.njk',
      image
    );
  }
}

module.exports = MatlabExport;
