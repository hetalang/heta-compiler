const DYNMS_SCHEMA = 'https://raw.githubusercontent.com/hetalang/heta-compiler/v0.13.0/src/dynms/dynms.schema.json';
const DYNMS_VERSION = '0.3.0';

const { AbstractExport } = require('../abstract-export');
const pkg = require('../../package');
const { ajv } = require('../ajv');

const schema = {
  type: 'object'
};

class DynMS extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = DynMS.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'DynMS';
  }
  get defaultFilepath() {
    return 'dynms';
  }
  get format(){
    return 'dynms';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  get requireConcrete() {
    return true;
  }
  makeText(){
    //let { logger } = this._builder;

    // meta information
    let DynMSObj = {
      '$schema': DYNMS_SCHEMA,
      dynms: DYNMS_VERSION,
      generator: {name: pkg.name, version: pkg.version},
      created: new Date().toISOString(),
      platformId: this._builder.id,
      platformVersion: this._builder.version,
      platformNotes: this._builder.notes,
      license: this._builder.license,
      models: []
    };

    let selectedNamespaces = this.selectedNamespaces();
    DynMSObj.models = selectedNamespaces
      .map(([spaceName, ns]) => {
        return ns.makeDynMSModel();
      });

    let selectedModels = new Set(selectedNamespaces.map(([spaceName]) => spaceName));
    let scenarios = [...this._builder.container.scenarioStorage.values()]
      .filter((scenario) => selectedModels.has(scenario.model))
      .map((scenario) => {
        let dynmsScenario = {
          id: scenario.id,
          model: scenario.model,
          tspan: scenario.tspan
        };
        if (scenario.parameters) dynmsScenario.parameters = scenario.parameters;
        if (scenario.saveat) dynmsScenario.saveat = scenario.saveat;
        if (scenario.observables) dynmsScenario.observables = scenario.observables;
        if (scenario.events_active) dynmsScenario.eventsActive = scenario.events_active;
        if (scenario.events_save) dynmsScenario.eventsSave = scenario.events_save;
        return dynmsScenario;
      });
    if (scenarios.length > 0) DynMSObj.scenarios = scenarios;

    return [{
      content: JSON.stringify(DynMSObj, null, 2),
      pathSuffix: '/output.dynms.json',
      type: 'text'
    }];
  }
}

module.exports = DynMS;
