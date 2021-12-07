const { AbstractExport } = require('../core/abstract-export');
const nunjucks = require('nunjucks');
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

    if (q.spaceFilter instanceof Array) {
      this.spaceFilter = q.spaceFilter;
    } else if (typeof q.spaceFilter === 'string') {
      this.spaceFilter = [q.spaceFilter];
    }
  }
  get className(){
    return 'SimbioExport';
  }
  get format(){
    return 'Simbio';
  }
  make(){
    let logger = this._container.logger;

    if (this.spaceFilter !== undefined) {
      // empty namespace is not allowed
      if (this.spaceFilter.length === 0) { // check non-empty space filter
        let msg = 'spaceFilter for Simbio format should include at least one namespace but is empty';
        logger.error(msg);
        return []; // BRAKE
      }

      // check if namespaces exists
      let lostNamespaces = this.spaceFilter.filter((x) => {
        let ns = this._container.namespaceStorage.get(x);
        return !ns || ns.isAbstract;
      });
      if (lostNamespaces.length > 0) {
        let msg = `Namespaces: ${lostNamespaces.join(', ')} either do not exist or are abstract. Simbio export stopped.`;
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
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = SimbioExport;
