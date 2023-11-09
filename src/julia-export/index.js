const { AbstractExport } = require('../core/abstract-export');
/* global compiledTemplates */
const pkg = require('../../package');
require('./expression'); // to use method toJuliaString()
const { ajv, uniqBy } = require('../utils');

const schema = {
  type: 'object',
  properties: {
  }
};

class JuliaExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let logger = this._container.logger;
    let valid = JuliaExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    if (q.spaceFilter instanceof Array) {
      this.spaceFilter = q.spaceFilter;
    } else if (typeof q.spaceFilter === 'string') {
      this.spaceFilter = [q.spaceFilter];
    }
  }
  get className(){
    return 'JuliaExport';
  }
  get format(){
    return 'Julia';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  // skipVersionCode means that the version will not be printed in output
  // this is required for autotests
  makeText(skipVersionCode = false){
    //let logger = this._container.logger;
    // create image for multiple namespaces
    let nsImages = [...this._container.namespaceStorage]
      .filter((pair) => {
        let allowedByFilter = typeof this.spaceFilter === 'undefined'
          || this.spaceFilter.indexOf(pair[0]) !== -1;
        return allowedByFilter && !pair[1].isAbstract;
      })
      .map((pair) => this.getJuliaImage(pair[1]));

    // create Content
    let image = {
      builderVersion: skipVersionCode ? '*' : pkg.version,
      options: this,
      nsImages
    };
    let modelContent = this.getModelCode(image);
    let runContent = this.getRunCode(image);

    return [
      {
        content: modelContent,
        pathSuffix: '/model.jl',
        type: 'text'
      },
      {
        content: runContent,
        pathSuffix: '/run.jl',
        type: 'text'
      }
    ];
  }
  getJuliaImage(ns){
    // constants
    let constants = ns
      .selectByInstanceOf('Const');
    // ODE variables
    let dynamicRecords = ns
      .selectByInstanceOf('Record')
      .filter((x) => x.isDynamic);
    // currently we output all records
    let extendedRuleRecords = ns
      .sortExpressionsByContext('ode_', true)
      .filter((x) => x.isExtendedRule);
    let staticRecords = ns
      .selectByInstanceOf('Record')
      .filter((x) => !x.isDynamic && !x.isRule);
    // RHS of ODE
    let rhs = dynamicRecords.map((record) => {
      return record.backReferences.map((ref, i) => {
        if (ref.stoichiometry === -1) {
          var st = '-';
        } else if (ref.stoichiometry < 0) {
          st = ref.stoichiometry + '*';
        } else if (ref.stoichiometry === 1) {
          st = i === 0 ? '' : '+';
        } else { // ref.stoichiometry >= 0
          st = i === 0 ? ref.stoichiometry + '*' : '+' + ref.stoichiometry + '*';
        }
        
        // XXX this is wrong solution because it results in problem d(comp1*S1)/dt = r1*comp1
        let isCompartmentRequired = ref._process_.className === 'Process' 
          && record.instanceOf('Species') 
          && !record.isAmount;
        if (isCompartmentRequired) {
          return st + ref.process + '*' + record.compartment;
        } else {
          return st + ref.process;
        }
      }).join('');
    });

    // initialize at start records
    let initRecordsRaw = ns
      .sortExpressionsByContext('start_')
      .filter((x) => x.instanceOf('Record') && (x.assignments['start_'] !== undefined || x.isRule));
    /* shorter version of rules, but not sure it's effective
    let initDeps = [].concat(
      dynamicRecords.map(x => x.id),
      staticRecords.map(x => x.id)
    );
    let initRecords = _minimalRuleList(initRecordsRaw, initDeps);
    */
    let initRecords = initRecordsRaw;

    // select only rules to calculate ode
    // TODO: maybe it is betted to calculate only active Processes
    let odeDeps = ns
      .selectByInstanceOf('Process')
      .map((x) => x.id);
    let odeRules = _minimalRuleList(extendedRuleRecords, odeDeps);

    // other switchers
    let events = ns
      .selectByInstanceOf('_Switcher')
      .map((switcher) => {
        let affect = ns.toArray()
          .filter((x) => {
            return x.instanceOf('Record') 
              && x.assignments !== undefined 
              && x.assignments[switcher.id] !== undefined;
          });

        // find all unique dependencies inside assignments
        let affectDeps = [];
        affect.forEach((x) => {
          let dep = x.dependOn(switcher.id, true);
          affectDeps.push(...dep);
        });
        
        // select rules required for affect
        let affectRules = _minimalRuleList(extendedRuleRecords, uniqBy(affectDeps));

        // find all unique dependencies inside trigger
        let triggerDeps = switcher.trigger ? switcher.trigger.dependOn() : [];
        // select rules required for switcher
        let triggerRules = _minimalRuleList(extendedRuleRecords, uniqBy(triggerDeps));

        return {
          switcher,
          triggerRules,
          affect,
          affectRules
        };
      });

    let pTranslatorObject = {};
    constants.forEach((constant, i) => {
      pTranslatorObject[constant.id] = `__constants__[${i+1}]`;
    });
      
    return {
      namespace: ns,
      constants,
      dynamicRecords,
      staticRecords,
      rhs,
      initRecords,
      extendedRuleRecords,
      odeRules,
      events,
      pTranslator: pTranslatorObject,
    };
  }
  getModelCode(image = []){
    return compiledTemplates['julia-model.jl.njk'].render(image);
  }
  getRunCode(image = []){
    return compiledTemplates['julia-run.jl.njk'].render(image);
  }
}

module.exports = JuliaExport;

// select sub-array from rulesList which describes deps
function _minimalRuleList(rulesList, deps = []){
  // calculate number of rules to include
  let rulesListIds = rulesList.map((x) => x.id);
  let rulesListNum = deps.map((x) => rulesListIds.indexOf(x));
  let rulesMaxIndex = Math.max(...rulesListNum);

  // select rules required
  return rulesList.slice(0, rulesMaxIndex + 1);
}
