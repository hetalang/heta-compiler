const { Top } = require('./top');
const { ajv } = require('../ajv');

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
  merge(q = {}){
    super.merge(q);

    // check arguments here
    let logger = this._container?.logger;
    let valid = Scenario.isValid(q, logger);
    if (!valid) {
      this.errored = true;
      return this;
    }

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

    return this;
  }
  get className(){
    return 'Scenario';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  toQ(options = {}){
    let q = super.toQ(options);
    q.action = 'setScenario';

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
  /*
    This method checks scenario properties.
    Called by Container.prototype.knitMany()
  */
  bind(){
    let logger = this._container?.logger;

    // set model/namespace
    if (this._container?.namespaceStorage.has(this.model)) {
      this.modelObj = this._container?.namespaceStorage.get(this.model);
    } else {
      let msg = `Scenario's ${this.id} "model" property must refer to a namespace, got "${this.model}".`;
      logger.error(msg, {type: 'BindingError'});
      return; // BRAKE
    }

    // check parameters
    if (this.parameters !== undefined) {
      Object.getOwnPropertyNames(this.parameters)
        .forEach((key) => {
          // search in constants
          let foundComponent = this.modelObj.get(key);
          if (foundComponent === undefined || !foundComponent.instanceOf('Const')) {
            let msg = `"${key}" key in Scenario "${this.id}.parameters" must refer to Const.`;
            logger.error(msg, {type: 'BindingError'});
          }
        });
    }

    // check observables
    if (this.observables !== undefined) {
      this.observables.forEach((key) => {
        // search in records
        let foundComponent = this.modelObj.get(key);
        if (foundComponent === undefined || !foundComponent.instanceOf('Record')) {
          let msg = `"${key}" value in Scenario "${this.id}.observables" must refer to Record.`;
          logger.error(msg, {type: 'BindingError'});
        }
      });
    }

    // check events_active
    if (this.events_active !== undefined) {
      Object.getOwnPropertyNames(this.events_active)
        .forEach((key) => {
          // search in switchers
          let foundComponent = this.modelObj.get(key);
          if (foundComponent === undefined || !foundComponent.instanceOf('_Switcher')) {
            let msg = `"${key}" key in Scenario "${this.id}.events_active" must refer to Switcher.`;
            logger.error(msg, {type: 'BindingError'});
          }
        });
    }

    // check events_save
    if (this.events_save !== undefined) {
      Object.getOwnPropertyNames(this.events_save)
        .forEach((key) => {
          // search in switchers
          let foundComponent = this.modelObj.get(key);
          if (foundComponent === undefined || !foundComponent.instanceOf('_Switcher')) {
            let msg = `"${key}" key in Scenario "${this.id}.events_save" must refer to Switcher.`;
            logger.error(msg, {type: 'BindingError'});
          }
        });
    }
  }
}

module.exports = {
  Scenario
};
