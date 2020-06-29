const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('nunjucks');
const pkg = require('../../package');
const _ = require('lodash');
require('./expression'); // to use method toJuliaString()

class JuliaExport extends _Export {
  get className(){
    return 'JuliaExport';
  }
  make(){
    let image = this.getJuliaImage();

    return [
      {
        content: this.getModelCode(image),
        pathSuffix: '/model.jl',
        type: 'text'
      },
      {
        content: this.getRunCode(image),
        pathSuffix: '/run.jl',
        type: 'text'
      }
    ];
  }
  getJuliaImage(){
    let builderName = pkg.name + ' of v' + pkg.version;
    let namespace = this.namespace;
    // constants
    let constants = this.namespace
      .selectByInstanceOf('Const');
    // ODE variables
    let dynamicRecords = this.namespace.toArray()
      .filter((x) => x.instanceOf('Record') && x.isDynamic);
    let notDynamicRecords = this.namespace.toArray()
      .filter((x) => x.instanceOf('Record') && !x.isDynamic);
    // initialize at start records
    let initRecords = this.namespace
      .sortExpressionsByContext('start_')
      .filter((x) => x.instanceOf('Record') && (_.has(x, 'assignments.start_') || x.isRule));
    // currently we output all records
    let ruleRecords = this.namespace
      .sortExpressionsByContext('ode_', true)
      .filter((x) => x.instanceOf('Record'));
    let staticRecords = this.namespace
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

    // create events from switchers
    let events = this.namespace
      .selectByInstanceOf('_Switcher')
      .map((switcher) => {
        let affect = switcher.namespace.toArray()
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
      namespace,
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
