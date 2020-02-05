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

    return [{
      content: this.getModelCode(image),
      pathSuffix: '/model.m',
      type: 'text'
    }];
  }
  getMatlabImage(){
    let builderName = pkg.name + ' of v' + pkg.version;
    let namespace = this.namespace;
    let options = this.toQ();
    // ODE variables
    let dynamicRecords = this.namespace.toArray()
      .filter((x) => x.instanceOf('Record') && x.isDynamic);
    // Rules
    let ruleRecords = this.namespace
      .sortExpressionsByContext('ode_')
      .filter((record) => record.instanceOf('Record') && _.has(record, 'assignments.ode_'));

    return { builderName, options, namespace, dynamicRecords, ruleRecords };
  }
  getModelCode(image = {}){
    return nunjucks.render(
      'matlab-export/model.m.njk',
      image
    );
  }
}

Container.prototype.classes.MatlabExport = MatlabExport;

module.exports = { MatlabExport };
