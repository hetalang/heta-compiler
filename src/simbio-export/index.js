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
    } else {
      this.spaceFilter = ['nameless'];
    }
  }
  get className(){
    return 'SimbioExport';
  }
  get format(){
    return 'Simbio';
  }
  make(){
    // use only one namespace
    let logger = this._container.logger;
    if (this.spaceFilter.length === 0) { // check non-empty space filter
      let msg = 'spaceFilter for Simbio format should include at least one namespace but get empty';
      logger.error(msg);
      var content = '';
    } else if (!this._container.namespaceStorage.has(this.spaceFilter[0])) { // check namespace existence
      let msg = `Namespace "${this.spaceFilter[0]}" does not exist.`;
      logger.err(msg);
      content = '';
    } else {
      if (this.spaceFilter.length > 1) { // check multi-space
        let msg = `Simbio format does not support multispace export. Only first namespace "${this.spaceFilter[0]}" will be used.`;
        logger.warn(msg);
      }
      let ns = this._container.namespaceStorage.get(this.spaceFilter[0]);

      // checking unitTerm for Species
      ns.selectByInstanceOf('Species')
        .filter((species) => species.isAmount)
        .forEach((species) => {
          if (typeof species.unitsParsed === 'undefined') {
            logger.error(`Units for "${species.index}" is not found which is not allowed for Simbio format when {isAmount: true}.`);
            return true; // BRAKE
          }
          let term = species.unitsParsed.toTerm();
          let isLegal = species.legalTerms.some((x) => term.equal(x));
          if (!isLegal) {
            let termString = term.toString();
            let msg = `Species {isAmount: true} "${species.index}" has wrong unit term. It must be "amount" or "mass", got "${termString}".`;
            logger.error(msg, {type: 'UnitError'});
            return true; // BRAKE
          }
        });

      // checking unitTerm for Reaction
      ns.selectByInstanceOf('Reaction')
        .forEach((reaction) => {
          let expr = reaction.assignments.ode_.exprParsed;
          let units = expr.calcUnit(reaction);
          if (typeof units === 'undefined') {
            //let msg = `Cannot calculate units for Reaction "${reaction.index}" which is not allowed for Simbio.`; // OK if cannot calculate
            //logger.error(msg, {type: 'UnitError'});
            return true; // BRAKE
          }
          let term = units.toTerm(); 
          let isLegal = reaction.legalTerms.some((x) => term.equal(x));
          if (!isLegal) {
            let msg = `Reaction "${reaction.index}" has wrong CALCULATED unit term. It must be "amount/time" or "mass/time".`;
            logger.error(msg, {type: 'UnitError'});
            return true; // BRAKE
          }
        });

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
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = SimbioExport;
