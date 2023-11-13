const { AbstractExport } = require('../core/abstract-export');
/* global compiledTemplates */
const legalUnits = require('./legal-units');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
  }
};

class SimbioExport extends AbstractExport{
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let logger = this._container.logger;
    let valid = SimbioExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'SimbioExport';
  }
  get format(){
    return 'Simbio';
  }
  makeText(){
    let logger = this._container.logger;

    // filter namespaces if set
    let selectedNamespaces = [...this._container.namespaceStorage]
      .filter(([spaceName, ns]) => new RegExp(this.spaceFilter).test(spaceName))
      .filter(([spaceName, ns]) => !ns.isAbstract);
    
    let results = selectedNamespaces.map(([spaceName, ns]) => {
      // checking unitTerm for Species
      ns.selectByInstanceOf('Species')
        .filter((species) => species.isAmount)
        .forEach((species) => {
          if (typeof species.unitsParsed === 'undefined') {
            logger.error(`Units for "${species.index}" is not found which is not allowed for Simbio format when {isAmount: true}.`);
            return true; // BRAKE
          }
          let term = species.unitsParsed.toTerm();
          if (term === undefined) {
            let msg = `Unit term cannot be calculated for species "${species.index}" that is not allowed for Simbio format when {isAmount: true}.`;
            logger.error(msg, {type: 'UnitError'});
            return true; // BRAKE
          }
          let isLegal = species.legalTerms.some((x) => term.equal(x));
          if (!isLegal) {
            let msg = `Species {isAmount: true} "${species.index}" has wrong unit term. It must be "amount" or "mass", got "${term}".`;
            logger.error(msg, {type: 'UnitError'});
            return true; // BRAKE
          }
        });

      // checking unitTerm for Reaction
      ns.selectByInstanceOf('Reaction')
        .forEach((reaction) => {
          let units = reaction.assignments['ode_'].calcUnit(reaction);
          if (typeof units === 'undefined') {
            //let msg = `Cannot calculate units for Reaction "${reaction.index}" which is not allowed for Simbio.`; // OK if cannot calculate
            //logger.error(msg, {type: 'UnitError'});
            return true; // BRAKE
          }
          let term = units.toTerm(); 
          let isLegal = reaction.legalTerms.some((x) => term.equal(x));
          if (!isLegal) {
            let msg = `Reaction "${reaction.index}" has wrong CALCULATED unit term. It must be "amount/time" or "mass/time", got ${term}`;
            logger.error(msg, {type: 'UnitError'});
            return true; // BRAKE
          }
        });

      // display that function definition is not supported
      let functionsNames = [...this._container.functionDefStorage.keys()];
      if (functionsNames.length > 0) {
        logger.warn(`"FunctionDef" object: ${functionsNames.join(', ')} are presented in platform but not supported by Simbio export.`);
      }

      let image = this.getSimbioImage(ns);
      let content = this.getSimbioCode(image);

      return {
        content: content,
        pathSuffix: `/${spaceName}.m`,
        type: 'text'
      };
    });

    results.push({
      content: this.getFunCode(),
      pathSuffix: '/tern__.m',
      type: 'text'
    });

    return results;
  }
  getSimbioImage(ns){
    // set functionDefinition
    let listOfFunctionDefinitions = [...ns.container.functionDefStorage.values()];

    return {
      population: ns,
      legalUnits,
      listOfFunctionDefinitions // currently not used
    };
  }
  getSimbioCode(image = {}){
    return compiledTemplates['simbio.m.njk'].render(image);
  }
  getFunCode(){
    return compiledTemplates['simbio-tern__.m.njk'].render(this);
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = SimbioExport;
