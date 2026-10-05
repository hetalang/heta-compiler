const DYNMS_SCHEMA = 'https://raw.githubusercontent.com/hetalang/heta-compiler/v0.12.3/src/dynms/dynms.schema.json';
const DYNMS_VERSION = '0.2.2';

const { AbstractExport } = require('../abstract-export');
const pkg = require('../../package');
const { ajv } = require('../ajv');

const schema = {
  type: 'object',
  properties: {
    exprFormat: {type: 'string', enum: ['math-json', 'heta', 'c', 'julia']},
  }
};

class DynMS extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = DynMS.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    this.exprFormat = q.exprFormat || 'math-json';
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
    let { logger } = this._builder;

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

    // select expression string generator
    if (this.exprFormat === 'c') {
        var expRenderer = (expr) => expr.toCString(logger);
    } else if (this.exprFormat === 'heta') {
        expRenderer = (expr) => expr.toString();
    } else if (this.exprFormat === 'julia') {
        expRenderer = (expr) => expr.toJuliaString(logger);
    } else if (this.exprFormat === 'math-json') {
        expRenderer = (expr) => expr.toMathJSON(logger);
    } else {
        let msg = `Unsupported expression format: ${this.exprFormat}`;
        logger.error(msg, {});
    }

    let selectedNamespaces = this.selectedNamespaces();
    DynMSObj.models = selectedNamespaces
      .map(([spaceName, ns]) => {
        return ns.makeDynMSModel(this.exprFormat, expRenderer);
      });

    let selectedModels = new Set(selectedNamespaces.map(([spaceName]) => spaceName));
    let scenarios = [...this._builder.container.scenarioStorage.values()]
      .filter((scenario) => selectedModels.has(scenario.model))
      .flatMap((scenario) => {
        if (!scenario.tspan) {
          logger.error(
            `Scenario "${scenario.id}" cannot be exported to DynMS because "tspan" is required.`,
            {type: 'DynMSScenarioError', scenario: scenario.id}
          );
          return [];
        }

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

        return [dynmsScenario];
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
