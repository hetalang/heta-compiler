const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('../nunjucks-env');
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
      {
        content: this.getInitCode(image),
        pathSuffix: '/init.m',
        type: 'text'
      },
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
    let namespace = this.namespace;
    let options = this.toQ();
    // constants
    let constants = this.namespace
      .selectByInstanceOf('Const');
    // ODE variables
    let dynamicRecords = this.namespace.toArray()
      .filter((x) => x.instanceOf('Record') && !x.implicitBoundary);
    // initialize at start records
    let initRecords = this.namespace
      .sortExpressionsByContext('start_')
      .filter((x) => x.instanceOf('Record') && _.has(x, 'assignments.start_'));
    // Rules
    let ruleRecords = this.namespace
      .sortExpressionsByContext('ode_')
      .filter((x) => x.instanceOf('Record') && x.implicitBoundary);
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
              st = '+' + st + '*';
            }
            return st + ref.process;
          });
        }
      });
    
    let yTranslator = dynamicRecords
      .map((x, i) => [x.id, `y(${i+1})`]);
    let pTranslator = constants
      .map((x, i) => [x.id, `p(${i+1})`]);
    let translator = {
      symbolName: _.fromPairs(yTranslator.concat(pTranslator))
    };

    return { 
      builderName,
      options,
      namespace,
      constants,
      dynamicRecords,
      rhs,
      initRecords,
      ruleRecords,
      translator
    };
  }
  getModelCode(image = {}){
    return nunjucks.render(
      'matlab-export/model.m.njk',
      image
    );
  }
  getParamCode(image = {}){
    return nunjucks.render(
      'matlab-export/param.m.njk',
      image
    );
  }
  getRunCode(image = {}){
    return nunjucks.render(
      'matlab-export/run.m.njk',
      image
    );
  }
  getInitCode(image = {}){
    return nunjucks.render(
      'matlab-export/init.m.njk',
      image
    );
  }
}

Container.prototype.classes.MatlabExport = MatlabExport;

module.exports = { MatlabExport };
