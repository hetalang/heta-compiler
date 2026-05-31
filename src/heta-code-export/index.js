const { AbstractExport } = require('../abstract-export');
const { ajv } = require('../ajv');

const schema = {
  type: 'object',
  properties: {
  }
};

class HetaCodeExport extends AbstractExport{
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = HetaCodeExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'HetaExport';
  }
  get format(){
    return 'heta';
  }
  get defaultFilepath() {
    return 'heta-code';
  }
  /**
   * Creates Heta code text outputs.
   *
   * @returns {object[]} Text outputs with `content`, `pathSuffix`, and `type`.
   */
  makeText() {
    // let { logger } = this._builder;

    let image = this.getHetaCodeImage(this._builder.container);
    let content = this.getHetaCodeCode(image);

    return [{
      content: content,
      pathSuffix: '/output.heta',
      type: 'text'
    }];
  }
  /**
   * Creates the model image used by the Heta code template.
   *
   * @returns {object} Template image.
   */
  getHetaCodeImage() {
    let { namespaceStorage, functionDefStorage, unitDefStorage } = this._builder.container;

    let filteredNamespaceStorage = [...namespaceStorage]
      .filter(([spaceName, ns]) => new RegExp(this.spaceFilter).test(spaceName));
    
    return {
      functionDefStorage: filterUsedFunctionDefs(functionDefStorage, filteredNamespaceStorage),
      unitDefStorage: filterUsedUnitDefs(unitDefStorage, filteredNamespaceStorage),
      namespaceStorage: filteredNamespaceStorage
    };
  }
  getHetaCodeCode(image = {}){
    return this.renderTemplate('heta-code.heta.njk', image);
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

function filterUsedFunctionDefs(functionDefStorage, namespaceStorage) {
  let usedFunctionIds = new Set();

  let addFromExpression = (expression) => {
    if (!expression || typeof expression.functionList !== 'function') return;

    expression.functionList().forEach((functionNode) => {
      let id = functionNode.fn?.name || functionNode.name;
      addFunction(id);
    });
  };

  let addFunction = (id) => {
    let functionDef = functionDefStorage.get(id);
    if (!functionDef || functionDef.isCore || usedFunctionIds.has(id)) return;

    usedFunctionIds.add(id);
    addFromExpression(functionDef.math);
  };

  namespaceStorage.forEach(([, namespace]) => {
    namespace.toArray().forEach((component) => {
      getComponentExpressions(component).forEach(addFromExpression);
    });
  });

  return [...functionDefStorage]
    .filter(([id, functionDef]) => !functionDef.isCore && usedFunctionIds.has(id));
}

function filterUsedUnitDefs(unitDefStorage, namespaceStorage) {
  let usedUnitIds = new Set();

  let addFromUnit = (unit) => {
    if (!unit || typeof unit.forEach !== 'function') return;

    unit.forEach((unitItem) => addUnitDef(unitItem.kind));
  };

  let addUnitDef = (id) => {
    let unitDef = unitDefStorage.get(id);
    if (!unitDef || unitDef.isCore || usedUnitIds.has(id)) return;

    usedUnitIds.add(id);
    addFromUnit(unitDef.unitsParsed);
  };

  namespaceStorage.forEach(([, namespace]) => {
    namespace.toArray().forEach((component) => {
      addFromUnit(component.unitsParsed);
    });
  });

  return [...unitDefStorage]
    .filter(([id, unitDef]) => !unitDef.isCore && usedUnitIds.has(id));
}

function getComponentExpressions(component) {
  let expressions = [];

  if (component.assignments) {
    expressions.push(...Object.values(component.assignments));
  }
  if (component.trigger) {
    expressions.push(component.trigger);
  }

  return expressions;
}

module.exports = HetaCodeExport;
