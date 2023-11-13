const { AbstractExport } = require('../core/abstract-export');
/* global compiledTemplates */
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
  }
  get className(){
    return 'DotExport';
  }
  get format(){
    return 'Dot';
  }
  makeText(){
    let logger = this._container.logger;

    let selectedNamespaces = this.selectedNamespaces();

    let results = selectedNamespaces.map(([spaceName, ns]) => {
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
    return compiledTemplates['dot.dot.njk'].render(image);
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = DotExport;
