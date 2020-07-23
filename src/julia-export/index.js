const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('nunjucks');
const pkg = require('../../package');
const _ = require('lodash');
require('./expression'); // to use method toJuliaString()

class JuliaExport extends _Export {
  merge(q = {}, skipChecking){
    super.merge(q, skipChecking);
    if (q.spaceFilter instanceof Array) {
      this.spaceFilter = q.spaceFilter;
    } else if (typeof q.spaceFilter === 'string') {
      this.spaceFilter = [q.spaceFilter];
    } else {
      this.spaceFilter = ['nameless'];
    }

    return this;
  }
  get className(){
    return 'JuliaExport';
  }
  make(){
    // use only one namespace
    let logger = this.container.logger;
    if (this.spaceFilter.length === 0) {
      let msg = 'spaceFilter for Julia format should include at least one namespace but get empty';
      logger.err(msg);
      var modelContent = '';
      var runContent = '';
    } else if (!this.container.namespaces.has(this.spaceFilter[0])) {
      let msg = `Namespace "${this.spaceFilter[0]}" does not exist.`;
      logger.err(msg);
      modelContent = '';
      runContent = '';
    } else {
      if (this.spaceFilter.length > 1) {
        let msg = `Julia format does not support multispace export. Only first namespace "${this.spaceFilter[0]}" will be used.`;
        logger.warn(msg);
      }
      let ns = this.container.namespaces.get(this.spaceFilter[0]);
     
      let image = this.getJuliaImage(ns);
      modelContent = this.getModelCode(image);
      runContent = this.getRunCode(image);
    }

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
    let builderName = pkg.name + ' of v' + pkg.version;
    
    // constants
    let constants = ns
      .selectByInstanceOf('Const');
    // ODE variables
    let dynamicRecords = ns.toArray()
      .filter((x) => x.instanceOf('Record') && x.isDynamic);
    let notDynamicRecords = ns.toArray()
      .filter((x) => x.instanceOf('Record') && !x.isDynamic);
    // initialize at start records
    let initRecords = ns
      .sortExpressionsByContext('start_')
      .filter((x) => x.instanceOf('Record') && (_.has(x, 'assignments.start_') || x.isRule));
    // currently we output all records
    let ruleRecords = ns
      .sortExpressionsByContext('ode_', true)
      .filter((x) => x.instanceOf('Record'));
    let staticRecords = ns
      .selectByInstanceOf('Record')
      .filter((x) => !x.isDynamic && !x.isRule);
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
            
            let isCompartmentRequired = ref._process_.className === 'Process' 
              && record.instanceOf('Species') 
              && !record.isAmount;
            if (isCompartmentRequired) {
              return st + ref.process + '*' + record.compartment;
            } else {
              return st + ref.process;
            }
          }).join('');
        }
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
      builderName,
      options: this,
      namespace: ns,
      constants,
      dynamicRecords,
      notDynamicRecords,
      staticRecords,
      rhs,
      initRecords,
      ruleRecords,
      events,
      pTranslator: { symbolName: _.fromPairs(pTranslatorArray)},
    };
  }
  getModelCode(image = {}){
    return nunjucks.render(
      'model.jl.njk',
      image
    );
  }
  getRunCode(image = {}){
    return nunjucks.render(
      'run.jl.njk',
      image
    );
  }
}

Container.prototype.exports.Julia = JuliaExport;

module.exports = { JuliaExport };
