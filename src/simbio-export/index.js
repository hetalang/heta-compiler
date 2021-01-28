const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('nunjucks');
const legalUnits = require('./legal-units');

class SimbioExport extends _Export{
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
    return 'SimbioExport';
  }
  make(){
    // use only one namespace
    let logger = this.container.logger;
    if (this.spaceFilter.length === 0) {
      let msg = 'spaceFilter for Simbio format should include at least one namespace but get empty';
      logger.err(msg);
      var content = '';
    } else if (!this.container.namespaces.has(this.spaceFilter[0])) {
      let msg = `Namespace "${this.spaceFilter[0]}" does not exist.`;
      logger.err(msg);
      content = '';
    } else {
      if (this.spaceFilter.length > 1) {
        let msg = `Simbio format does not support multispace export. Only first namespace "${this.spaceFilter[0]}" will be used.`;
        logger.warn(msg);
      }
      let ns = this.container.namespaces.get(this.spaceFilter[0]);
      let image = this.getSimbioImage(ns);
      content = this.getSimbioCode(image);
    }

    return [
      {
        content: content,
        pathSuffix: '/model.m',
        type: 'text'
      },
      {
        content: this.getFunCode(),
        pathSuffix: '/tern__.m',
        type: 'text'
      }
    ];
  }
  getSimbioImage(ns){
    // check unsupported properties in @TimeSwitcher
    let logger = ns.container.logger;
    ns
      .selectByInstanceOf('TimeSwitcher')
      .forEach((ts) => {
        // check "speriod"
        if (typeof ts.periodObj !== 'undefined') {
          let msg = `"Simbio" format does not support "period" property in @TimeSwitcher as stated in "${ts.index}".`;
          logger.warn(msg);
        }
        // check "stop"
        if (typeof ts.stopObj !== 'undefined') {
          let msg = `"Simbio" format does not support "stop" property in @TimeSwitcher as stated in "${ts.index}".`;
          logger.warn(msg);
        }
      });

    return {
      population: ns,
      legalUnits: legalUnits
    };
  }
  getSimbioCode(image = {}){
    return nunjucks.render(
      'simbio.m.njk',
      image
    );
  }
  getFunCode(){
    return nunjucks.render(
      'simbio-tern__.m',
      this
    );
  }
}

Container.prototype.exports.Simbio = SimbioExport;

module.exports = {
  SimbioExport
};
