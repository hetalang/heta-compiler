const { Top } = require('./top');
const { Unit } = require('./unit');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  required: ['id'],
  properties: {
    units: { anyOf: [
       { '$ref': "#/definitions/UnitsExpr" },
       { type: "array", items: { '$ref': "#/definitions/UnitComponent" } }
    ] }
  },

  definitions: {
    ID: {
      description: "First character is letter, others are letter, digit or underscore.",
      type: "string",
      minLength: 1,
      pattern: "^[_a-zA-Z][_a-zA-Z0-9]*$",
      example: "x_12_"
    },

    UnitsExpr: {
      description: "Unit expression, see qsp-units project.",
      type: "string",
      pattern: "^[_a-zA-Z0-9./*^ ()+-]*$",
      example: "1/h * ms"
    },

    UnitComponent: {
      type: "object",
      required: ["kind"],
      properties: {
        kind: { '$ref': "#/definitions/ID" },
        multiplier: { type: "number", exclusiveMinimum: 0 },
        exponent: { type: "number" }
      },
      example: { kind: "mole", multiplier: 1e-6, exponent: 1 }
    },
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
  constructor(q = {}, isCore = false){
    let res = super(q, isCore);

    this.unitsParsed = new Unit();

    // check arguments here
    let logger = this._container.logger;
    let valid = UnitDef.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    if (q.units && typeof q.units === 'string') {
      this.unitsParsed = Unit.parse(q.units);
    } else if (q.units && q.units instanceof Array) {
      this.unitsParsed = Unit.fromQ(q.units);
    }
  }
  get units(){
    if (this.unitsParsed !== undefined) {
      return this.unitsParsed.toString();
    } else {
      return undefined;
    }
  }
  bind(){
    // super.bind();
    let logger = this._container.logger;
    let storage = this._container.unitDefStorage;

    if (this.unitsParsed) {
      this.unitsParsed.forEach((x) => {
        let target = storage.get(x.kind);
        
        if (!target) {
          let msg = `UnitDef "${x.kind}" is not found as expected here: `
            + `${this.index} { units: ${this.units} };`;
          logger.error(msg, {type: 'BindingError'});
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
  _toQ(options = {}){
      let q = super._toQ(options);

      if (this.unitsParsed) {
        if (options.noUnitsExpr) {
          q.units = this.unitsParsed.toQ(options);
        } else {
          q.units = this.unitsParsed.toString();
        }
      }
      return q;
  }
  toQ(options = {}){
      let q = this._toQ(options);
      q.action = 'defineUnit';

      return q;
  }
}

module.exports = {
  UnitDef
};
