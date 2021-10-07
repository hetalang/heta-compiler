const { Top } = require('./top');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  required: ['id'],
  properties: {
    model: { '$ref': '#/definitions/ID' },
    parameters: {
      type: 'object',
      propertyNames: { '$ref': '#/definitions/ID' },
      additionalProperties: { type: 'number' }
    },
    saveat: {
      type: 'array',
      items: { type: 'number' }
    },
    tspan: {
      type: 'array',
      items: { type: 'number' },
      minItems: 2,
      maxItems: 2
    },
    observables: {
      type: 'array',
      items: { '$ref': '#/definitions/ID' }
    },
    events_active: {
      type: 'object',
      propertyNames: { '$ref': '#/definitions/ID' },
      additionalProperties: { type: 'boolean'}
    },
    events_save: {
      type: 'object',
      propertyNames: { '$ref': '#/definitions/ID' },
      additionalProperties: {
        type: 'array',
        items: { type: 'boolean' },
        minItems: 2,
        maxItems: 2
      }
    },
  },

  definitions: {
    ID: {
      description: 'First character is letter, others are letter, digit or underscore.',
      type: 'string',
      minLength: 1,
      pattern: '^[_a-zA-Z][_a-zA-Z0-9]*$',
      example: 'x_12_'
    }
  }
};

class Scenario extends Top {
  constructor(q = {}, isCore = false){
    super(q, isCore);

    // check arguments here
    let logger = this._container.logger;
    let valid = Scenario.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    // set properties
    if (q.model) {
      this.model = q.model;
    } else {
      this.model = 'nameless';
    }

    if (q.parameters) {
      this.parameters = q.parameters;
    }

    if (!q.saveat && !q.tspan) {
      logger.error(`setScenario "${q.id}" must include "saveat" or "tspan" property.`, {type: 'ValidationError'});
      this.errored = true;
    }
    if (q.saveat) {
      this.saveat = q.saveat;
    }
    if (q.tspan) {
      if (q.tspan[0] < q.tspan[1]) {
        this.tspan = q.tspan;
      } else {
        logger.error(`"tspan" property in setScenario "${q.id}" is not ordered`, {type: 'ValidationError'});
        this.errored = true;
      }
    }

    if (q.observables) {
      this.observables = q.observables;
    }

    if (q.events_active) {
      this.events_active = q.events_active;
    }

    if (q.events_save) {
      this.events_save = q.events_save;
    }
  }
  get className(){
    return 'Scenario';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  _toQ(options = {}){
    let q = super._toQ(options);
    if (this.model !== 'nameless') {
      q.model = this.model;
    }
    if (this.parameters) {
      q.parameters = this.parameters;
    }
    if (this.saveat) {
      q.saveat = this.saveat;
    }
    if (this.tspan) {
      q.tspan = this.tspan;
    }
    if (this.observables) {
      q.observables = this.observables;
    }
    if (this.events_active) {
      q.events_active = this.events_active;
    }
    if (this.events_save) {
      q.events_save = this.events_save;
    }
    
    return q;
  }
  toQ(options = {}){
    let q = this._toQ(options);
    q.action = 'setScenario';

    return q;
  }
}

module.exports = {
  Scenario
};
