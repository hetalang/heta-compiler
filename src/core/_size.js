const { Component } = require('./component');
const { Unit } = require('./unit');
const { ajv } = require('../ajv');
const HetaLevelError = require('../heta-level-error');

const schema = {
  type: "object",
  properties: {
    units: { anyOf: [
       { type: 'number', enum: [1] },
       { $ref: '#/definitions/UnitsExpr' },
       { type: 'array', items: { '$ref': '#/definitions/UnitComponent' } },
       { type: 'null' }
    ] }
  },
  definitions:{
    UnitsExpr: {
       description: 'Unit expression, see qsp-units project.',
       type: 'string',
       pattern: '^[_a-zA-Z0-9./*^ ()+-]+$',
       example: "1/h * ms"
     },
    UnitComponent: {
      type: 'object',
      required: ['kind'],
      properties: {
        kind: { '$ref': '#/definitions/ID' },
        multiplier: { type: 'number', exclusiveMinimum: 0 },
        exponent: { type: 'number' }
      },
      example: { kind: 'mole', multiplier: 1e-6, exponent: 1 }
    },
    ID: {
       description: 'First character is letter, others are letter, digit or lodash.',
       type: 'string',
       minLength: 1,
       pattern: '^[_a-zA-Z][_a-zA-Z0-9]*$',
       example: 'x_12_'
     }
  }
};

/*
  Abstract class _Size

  size1 @_Size {
    units: unit1/unit2 // <UnitsExpr>
  };
  size2 @_Size {
    units: [ // <UnitsArray>
      {kind: unit1, multiplier: 1, exponent: 1},
      {kind: unit2, multiplier: 1, exponent: -1}
    ] 
  };
*/
class _Size extends Component {
  merge(q = {}){
    super.merge(q);
    let logger = this._container?.logger;
    let valid = _Size.isValid(q, logger);
    if (valid) {
      if (q.units !== undefined) {
        if (q.units === 1) {
          this.unitsParsed = new Unit();
        } else if (typeof q.units === 'string') {
          try {
            this.unitsParsed = Unit.parse(q.units);
          } catch (error) {
            if (!(error instanceof HetaLevelError)) throw error;
            logger?.error(
              this.index + ': '+ error.message, 
              {...error.opt, space: this.space, id: this.id, path: 'units'}
            );
          }
        } else if (q.units === null) {
          delete this.unitsParsed;
        } else {
          try {
            this.unitsParsed = Unit.fromQ(q.units);
          } catch (error) {
            if (!(error instanceof HetaLevelError)) throw error;
            logger?.error(
              this.index + ': ' + error.message, 
              {...error.opt, space: this.space, id: this.id, path: 'units'}
            );
          }
        }
      }
    }

    return this;
  }
  get className() {
    return '_Size';
  }
  clone(){
    let componentClone = super.clone();
    if (this.unitsParsed)
      componentClone.unitsParsed = this.unitsParsed.clone();

    return componentClone;
  }
  get units(){
    if (this.unitsParsed !== undefined) {
      return this.unitsParsed.toString();
    } else {
      return undefined;
    }
  }
  /** Additional check of units items */
  bind(namespace){
    super.bind(namespace);
    let logger = this._container?.logger;
    let storage = this._container?.unitDefStorage;

    if (this.unitsParsed) {
      this.unitsParsed.forEach((x) => {
        let target = storage.get(x.kind);
        
        if (!target) {
          let msg = `UnitDef "${x.kind}" is not found as expected here: `
            + `${this.index} { units: ${this.units} };`;
          logger.error(
            msg,
            {diagnosticCode: 'UNKNOWN_UNIT', space: this.space, id: this.id, path: 'units', unit: x.kind}
          );
        } else {
          x.kindObj = target;
        }
      });
    }
  }
  /* used only in sbml */
  unitsSBML(){
    return this.unitsParsed;
  }
  unitsHash(){
    if(this.unitsParsed !== undefined){
      return this.unitsParsed.toHash();
    }else{
      return undefined;
    }
  }
  unitsRebased(legalUnits = [], usePefix = false){
    if (this.unitsParsed !== undefined){
      try {
        return this.unitsParsed
          .rebase(legalUnits)
          .toString(usePefix);
      } catch(error) {
        if (!(error instanceof HetaLevelError)) throw error;
        let logger = this._container?.logger;
        let msg = error.message;
        logger?.warn(msg, {...error.opt, component: this.index, space: this.space});
        return undefined;
      }
    } else {
      return undefined;
    }
  }
  static get validate() {
    return ajv.compile(schema);
  }
  toQ(options = {}){
    let res = super.toQ(options);
    
    if (this.unitsParsed) {
      if (options.useUnitsExpr) {
        res.units = this.unitsParsed.toString();
      } else {
        res.units = this.unitsParsed.toQ(options);
      }
    }

    return res;
  }
}

module.exports = {
  _Size
};
