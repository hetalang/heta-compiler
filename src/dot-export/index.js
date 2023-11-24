const { AbstractExport } = require('../abstract-export');
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
  get defaultFilepath() {
    return 'dot';
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
        let substrates = proc.actors.filter((x) => x.stoichiometry < 0);
        // push records
        proc.actors.forEach((actor) => {
          let record = ns.get(actor.target) || { id: actor.target }; // use fake record
          let compartmentId = record.compartment || '_';
          clustersDict[compartmentId]?.push(record) || (clustersDict[compartmentId] = [record]);
        });
        // push process
        let compartmentOfFirstSubstrate = ns.get(substrates[0]?.target)?.compartment || '_';
        clustersDict[compartmentOfFirstSubstrate]?.push(proc);
      });
    /* display all records
    ns.selectByInstanceOf('Record')
      .forEach((rec) => {
        if (rec.compartment !== undefined) {
          clustersDict[rec.compartment].push(rec);
        } else {
          clustersDict['_'].push(rec);
        }
      });
    */
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
