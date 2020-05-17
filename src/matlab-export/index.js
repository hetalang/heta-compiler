const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('nunjucks');
const pkg = require('../../package');
const _ = require('lodash');

class MatlabExport extends _Export {
  get className(){
    return 'MatlabExport';
  }
  make(){
    let image = this.getMatlabImage();

    return [
      {
        content: this.getModelCode(image),
        pathSuffix: '/model.m',
        type: 'text'
      },
      /*{
        content: this.getInitCode(image),
        pathSuffix: '/init.m',
        type: 'text'
      },*/
      {
        content: this.getParamCode(image),
        pathSuffix: '/param.m',
        type: 'text'
      },
      {
        content: this.getRunCode(image),
        pathSuffix: '/run.m',
        type: 'text'
      }
    ];
  }
  getMatlabImage(){
    let builderName = pkg.name + ' of v' + pkg.version;
    
    // constants
    let constants = this.namespace
      .selectByInstanceOf('Const');
    // ODE variables
    let dynamicRecords = this.namespace.toArray()
      .filter((x) => x.instanceOf('Record') && !x.isRule);
    // initialize at start records
    let initRecords = this.namespace
      .sortExpressionsByContext('start_')
      .filter((x) => x.instanceOf('Record') && (_.has(x, 'assignments.start_') || x.isRule));
    // currently we output all records
    let outputRecords = this.namespace
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
    let events = this.namespace
      .selectByInstanceOf('TimeSwitcher')
      .map((switcher) => {
        let affect = switcher.namespace.toArray()
          .filter((x) => x.instanceOf('Record') && _.has(x, 'assignments.' + switcher.id));
        
        return {
          switcher,
          affect
        };
      });

    return { 
      builderName,
      options: this,
      namespace: this.namespace, // set externally in Container
      constants,
      dynamicRecords,
      rhs,
      initRecords,
      outputRecords,
      yTranslator: { symbolName: _.fromPairs(yTranslator)},
      pTranslator: { symbolName: _.fromPairs(pTranslator)},
      translator: { symbolName: _.fromPairs(yTranslator.concat(pTranslator))},
      events
    };
  }
  getModelCode(image = {}){
    return nunjucks.render(
      'model.m.njk',
      image
    );
  }
  getParamCode(image = {}){
    return nunjucks.render(
      'param.m.njk',
      image
    );
  }
  getRunCode(image = {}){
    return nunjucks.render(
      'run.m.njk',
      image
    );
  }
  getInitCode(image = {}){
    return nunjucks.render(
      'init.m.njk',
      image
    );
  }
}

Container.prototype.exports.Matlab = MatlabExport;

module.exports = { MatlabExport };
