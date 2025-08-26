const { Top } = require('./top');
const { Unit } = require('./unit');
const { UnitTerm } = require('./unit-term');
const { ajv } = require('../ajv');

const schema = {
  type: 'object',
  required: ['id'],
  properties: {
    units: { anyOf: [
      { type: 'number', enum: [1]},
      { '$ref': '#/definitions/UnitsExpr' },
      { type: 'array', items: { '$ref': '#/definitions/UnitItem' } }
    ] },
    terms: {
      type: 'array',
      items: { '$ref': '#/definitions/UnitTermItem' }
    }
  },

  definitions: {
    ID: {
      description: 'First character is letter, others are letter, digit or underscore.',
      type: 'string',
      minLength: 1,
      pattern: '^[_a-zA-Z][_a-zA-Z0-9]*$',
      example: 'x_12_'
    },

    UnitsExpr: {
      description: 'Unit expression, see qsp-units project.',
      type: 'string',
      pattern: '^[_a-zA-Z0-9./*^ ()+-]+$',
      example: '1/h * ms'
    },

    UnitItem: {
      type: 'object',
      required: ['kind'],
      properties: {
        kind: { '$ref': '#/definitions/ID' },
        multiplier: { type: 'number', exclusiveMinimum: 0 },
        exponent: { type: 'number' }
      },
      example: { kind: 'mole', multiplier: 1e-6, exponent: 1 }
    },

    UnitTermItem: {
      type: 'object',
      required: ['kind'],
      properties: {
        kind: { type: 'string', enum: ['amount', 'length', 'time', 'mass', 'current', 'temperature'] },
        exponent: { type: 'number' }
      },
      example: { kind: 'time', exponent: 1 }
    }
  }
};

/*
  // example:  unitDef1 = nM / kg3
  unitDef1 #defineUnit { units: [
    { kind: nM, multiplier: 1, exponent: 1 },
    { kind: kg, multiplier: 1, exponent: -3 }
  ]};
*/
class UnitDef extends Top {
  merge(q = {}) {
    super.merge(q);

    // check arguments here
    let logger = this._container?.logger;
    let valid = UnitDef.isValid(q, logger);
    if (!valid) {
      this.errored = true;
      return this;
    }

    // units or terms are required but not both
    if (q.units && q.terms) {
      logger?.error(`UnitDef "${q.id}" must include "units" or "terms" property but not both`, {type: 'ValidationError'});
      this.errored = true;
    } else if (!q.units && !q.terms) {
      logger?.error(`UnitDef "${q.id}" must include "units" or "terms" property`, {type: 'ValidationError'});
      this.errored = true;
    }

    if (q.units && q.units === 1) {
      this.unitsParsed = new Unit();
    } else if (q.units && typeof q.units === 'string') {
      try {
        this.unitsParsed = Unit.parse(q.units);
      } catch (e) {
        let msg = this.index + ': '+ e.message;
        logger?.error(msg, {type: 'ValidationError', space: this.space});
      }
    } else if (q.units && q.units instanceof Array) {
      this.unitsParsed = Unit.fromQ(q.units);
    }

    if (q.terms) this.terms = new UnitTerm(q.terms);

    return this;
  }
  get units(){
    if (!!this.unitsParsed) {
      return this.unitsParsed.toString();
    } else {
      return undefined;
    }
  }
  bind() {
    // super.bind();
    let logger = this._container?.logger;
    let storage = this._container?.unitDefStorage;

    if (!!this.unitsParsed) {
      // set kindObj
      this.unitsParsed.forEach((x) => {
        let target = storage.get(x.kind);
        
        if (!target) {
          let msg = `UnitDef "${x.kind}" is not found as expected here: `
            + `${this.index} { units: ${this.units} };`;
          logger?.error(msg, {type: 'BindingError'});
        } else {
          x.kindObj = target;
        }
      });
    }
  }
  get className(){
    return 'UnitDef';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  toQ(options = {}){
    let q = super.toQ(options);
    q.action = 'defineUnit';

    if (this.unitsParsed) {
      if (options.useUnitsExpr) {
        q.units = this.unitsParsed.toQ(options);
      } else {
        q.units = this.unitsParsed.toString();
      }
    }

    return q;
  }
}

module.exports = {
  UnitDef
};
