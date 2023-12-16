const { Namespace } = require('../namespace');

Namespace.prototype.getDotImage = function() {
  // group by clusters
  let clustersDict = {_: []};
  this.selectByInstanceOf('Compartment')
    .forEach((comp) => clustersDict[comp.id] = []);
  this.selectByInstanceOf('Process')
    .forEach((proc) => {
      let substrates = proc.actors.filter((x) => x.stoichiometry < 0);
      // push records
      proc.actors.forEach((actor) => {
        let record = this.get(actor.target) || { id: actor.target }; // use fake record
        let compartmentId = record.compartment || '_';
        clustersDict[compartmentId]?.push(record) || (clustersDict[compartmentId] = [record]);
      });
      // push process
      let compartmentOfFirstSubstrate = this.get(substrates[0]?.target)?.compartment || '_';
      clustersDict[compartmentOfFirstSubstrate]?.push(proc);
    });
  /* display all records
  this.selectByInstanceOf('Record')
    .forEach((rec) => {
      if (rec.compartment !== undefined) {
        clustersDict[rec.compartment].push(rec);
      } else {
        clustersDict['_'].push(rec);
      }
    });
  */
  return {
    ns: this,
    clustersDict
  };
};