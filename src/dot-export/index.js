const { AbstractExport } = require('../core/abstract-export');
const nunjucks = require('nunjucks');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
  }
};

class DotExport extends AbstractExport{
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let logger = this._container.logger;
    let valid = DotExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    if (q.spaceFilter instanceof Array) {
      this.spaceFilter = q.spaceFilter;
    } else if (typeof q.spaceFilter === 'string') {
      this.spaceFilter = [q.spaceFilter];
    }
  }
  get className(){
    return 'DotExport';
  }
  get format(){
    return 'Dot';
  }
  make(){
    let logger = this._container.logger;

    if (this.spaceFilter !== undefined) {
      // empty namespace is not allowed
      if (this.spaceFilter.length === 0) { // check non-empty space filter
        let msg = 'spaceFilter for Dot format should include at least one namespace but is empty';
        logger.error(msg);
        return []; // BRAKE
      }

      // check if namespaces exists
      let lostNamespaces = this.spaceFilter.filter((x) => {
        let ns = this._container.namespaceStorage.get(x);
        return !ns || ns.isAbstract;
      });
      if (lostNamespaces.length > 0) {
        let msg = `Namespaces: ${lostNamespaces.join(', ')} either do not exist or are abstract. Dot export stopped.`;
        logger.error(msg);
        return []; // BRAKE
      }
    }

    // filter namespaces if set
    let selectedNamespaces = this.spaceFilter !== undefined 
      ? [...this._container.namespaceStorage].filter((x) => this.spaceFilter.indexOf(x[0]) !== -1)
      : [...this._container.namespaceStorage].filter((x) => !x[1].isAbstract);

    let results = selectedNamespaces.map((x) => {
      let spaceName = x[0];
      let ns = x[1];

      let image = this.getDotImage(ns);
      let content = this.getDotCode(image);

      return {
        content: content,
        pathSuffix: `/${spaceName}.dot`,
        type: 'text'
      };
    });

    return results;
  }
  getDotImage(ns){
    // group by clusters
    let clustersDict = {_: []};
    ns.selectByInstanceOf('Compartment')
      .forEach((comp) => clustersDict[comp.id] = []);
    ns.selectByInstanceOf('Process')
      .forEach((proc) => {
        let substrates = proc.actors
          .filter((x) => x.stoichiometry < 0);
        let hasFirstSubstrate = substrates.length > 0 
          && substrates[0].targetObj !== undefined
          && substrates[0].targetObj.compartment !== undefined;
        if (hasFirstSubstrate) {
          let mainComp = substrates[0].targetObj.compartment;
          clustersDict[mainComp].push(proc);
        } else {
          clustersDict['_'].push(proc);
        }
      });
    ns.selectByInstanceOf('Record')
      .filter((rec) => rec.isDynamic)
      .forEach((rec) => {
        if (rec.compartment !== undefined) {
          clustersDict[rec.compartment].push(rec);
        } else {
          clustersDict['_'].push(rec);
        }
      });

    return {
      ns,
      clustersDict
    };
  }
  getDotCode(image = {}){
    return nunjucks.render(
      'dot.dot.njk',
      image
    );
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = DotExport;
