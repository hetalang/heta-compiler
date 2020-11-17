const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('nunjucks');
const pkg = require('../../package');
const _ = require('lodash');
require('./expression'); // to use method toJuliaString()

class SimSolverExport extends _Export {
  merge(q = {}, skipChecking){
    super.merge(q, skipChecking);
    if (q.spaceFilter instanceof Array) {
      this.spaceFilter = q.spaceFilter;
    } else if (typeof q.spaceFilter === 'string') {
      this.spaceFilter = [q.spaceFilter];
    }

    return this;
  }
  get className(){
    return 'SimSolverExport';
  }
  make(){
    let logger = this.container.logger;
    // create image for multiple namespaces
    let nsImages = [...this.container.namespaces]
      .filter((pair) => {
        let allowedByFilter = typeof this.spaceFilter === 'undefined'
          || this.spaceFilter.indexOf(pair[0]) !== -1;
        return allowedByFilter && !pair[1].isAbstract;
      })
      .map((pair) => this.getSimSolverImage(pair[1]));

    // create Content
    let image = {
      builderName: pkg.name + ' of v' + pkg.version,
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
  getSimSolverImage(ns){
    // constants
    let constants = ns
      .selectByInstanceOf('Const');
    // ODE variables
    let dynamicRecords = ns
      .selectByInstanceOf('Record')
      .filter((x) => x.isDynamic);
    // initialize at start records
    let initRecords = ns
      .sortExpressionsByContext('start_')
      .filter((x) => x.instanceOf('Record') && (_.has(x, 'assignments.start_') || x.isRule));
    // currently we output all records
    let extendedRuleRecords = ns
      .sortExpressionsByContext('ode_', true)
      .filter((x) => x.instanceOf('Record'));
    let staticRecords = ns
      .selectByInstanceOf('Record')
      .filter((x) => !x.isDynamic && !x.isRule);
    // RHS of ODE
    let rhs = dynamicRecords
      .map((record) => {
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

    // other switchers
    let events = ns
      .selectByInstanceOf('_Switcher')
      .map((switcher) => {
        let affect = ns.toArray()
          .filter((x) => x.instanceOf('Record') && _.has(x, 'assignments.' + switcher.id));
        
        return {
          switcher,
          affect
        };
      });

    let pTranslatorArray = constants
      .map((x, i) => [x.id, `cons[${i+1}]`]);
      
    return {
      namespace: ns,
      constants,
      dynamicRecords,
      staticRecords,
      rhs,
      initRecords,
      extendedRuleRecords,
      events,
      pTranslator: { symbolName: _.fromPairs(pTranslatorArray)},
    };
  }
  getModelCode(image = []){
    return nunjucks.render(
      'sim-solver-model.jl.njk',
      image
    );
  }
  getRunCode(image = []){
    return nunjucks.render(
      'sim-solver-run.jl.njk',
      image
    );
  }
}

Container.prototype.exports.SimSolver = SimSolverExport;

module.exports = { SimSolverExport };
