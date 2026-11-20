const Container = require('./main');
const { Namespace } = require('../namespace');

// they cannot be used as id, when 
const reservedWords = [
  'include', 'block', 'namespace', 'abstract', 'concrete', 'begin', 'end',
  'NaN', 'Infinity',
  'e', 'E', 'pi', 'PI',
  'null'
];

/**
 * Creates an export instance from an inline `#export` action.
 *
 * The export class is selected by `q.format`, for example `format: "json"`
 * creates a JSON export instance.
 *
 * @deprecated Use the `export` section in the platform declaration instead.
 * 
 * @param {object} q The `export` object in JS object format.
 * @param {boolean} isCore Kept for action compatibility.
 * 
 * @returns {AbstractExport|undefined} The created export, or `undefined` if validation fails.
 */
// TODO: this is part which will be removed later
// invisible => deprecated => removed
Container.prototype.export = function(q = {}, isCore = false) {
  this.logger.warn(
    'Inline #export is deprecated and will be removed in the future. Use export property in platform configuration.', 
    {diagnosticCode: 'DEPRECATED_INLINE_EXPORT', input: q}
  );
  
  if (q.format == null || q.format === '') {
    this.logger.error(
      'Inline #export requires a "format" property.',
      {diagnosticCode: 'MISSING_EXPORT_FORMAT', action: 'export', path: 'format', format: q.format}
    );
    return; // BRAKE
  }
  if (typeof q.format !== 'string') {
    this.logger.error(
      'The "format" property of inline #export must be a string.',
      {diagnosticCode: 'INVALID_EXPORT_CONFIGURATION', action: 'export', path: 'format', format: q.format}
    );
    return; // BRAKE
  }
  let { exportClasses, exportArray } = this._builder;
  let format = q.format.toLowerCase(); // convert to lower case here
  if (typeof exportClasses[format] !== 'function') {
    this.logger.error(
      `Export format "${q.format}" is not supported.`,
      {diagnosticCode: 'UNKNOWN_EXPORT_FORMAT', format: q.format, action: 'export', path: 'format'}
    );

    return; // BRAKE
  }

  // create and push to storage
  let exportInstance = new exportClasses[format](q, isCore);
  let ignoreInlineExport = this._builder.export.length > 0; // TODO: remove at version 0.10.0
  if (!exportInstance.errored && !ignoreInlineExport) { // TODO: remove second check later
    exportArray.push(exportInstance);
  } else if (!exportInstance.errored) {
    this.logger.warn(
      `inline #export {format: ${q.format}} will not be applied because export was set in platform configuration.`, 
      {diagnosticCode: 'INLINE_EXPORT_IGNORED'}
    );
  }

  return exportInstance;
};

/**
 * Creates a `UnitDef` and stores it by id.
 * 
 * @param {object} q The `#defineUnit` statement in JS object format.
 * @param {boolean} isCore Marks the unit definition as read-only.
 * 
 * @returns {UnitDef} The created object.
 */
Container.prototype.defineUnit = function(q = {}, isCore = false){
  // normal flow
  let unitDefInstance = new this.classes.UnitDef(isCore).merge(q);
  if (!unitDefInstance.errored) this.unitDefStorage.set(unitDefInstance.id, unitDefInstance);

  return unitDefInstance;
};

/**
 * Creates a `FunctionDef` and stores it by id.
 * 
 * @param {object} q The `#defineFunction` statement in JS object format.
 * @param {boolean} isCore Marks the function definition as read-only.
 * 
 * @returns {FunctionDef} The created object.
 */
Container.prototype.defineFunction = function(q = {}, isCore = false){
  // normal flow
  let functionDefInstance = new this.classes.FunctionDef(isCore).merge(q);
  if (!functionDefInstance.errored) this.functionDefStorage.set(functionDefInstance.id, functionDefInstance);

  return functionDefInstance;
};

/**
 * Creates a `Scenario` and stores it by id.
 * 
 * @param {object} q The `#setScenario` statement in JS object format.
 * @param {boolean} isCore Marks the scenario as read-only.
 * 
 * @returns {Scenario} The created object.
 */
Container.prototype.setScenario = function(q = {}, isCore = false){
  // normal flow
  let scenarioInstance = new this.classes.Scenario(isCore).merge(q);
  if (!scenarioInstance.errored) this.scenarioStorage.set(scenarioInstance.id, scenarioInstance);

  return scenarioInstance;
};

/**
 * Inserts a component and logs a warning when an existing component is replaced.
 *
 * @param {object} q The component object in Q-object format.
 * @param {boolean} isCore Marks the component as read-only.
 *
 * @returns {Component|undefined} The inserted component, or `undefined` if validation fails.
 */
Container.prototype.insert = function(q = {}, isCore = false) {
  let ind = getIndexFromQ(q);
  let space = q.space || 'nameless';

  let namespace = this.namespaceStorage.get(space);
  if (namespace === undefined) {
    this.logger.error(
      `"${ind}" create namespace "${space}" before use.`,
      {diagnosticCode: 'MISSING_NAMESPACE', space, id: q.id, action: q.action || 'insert'}
    );
    return;
  }

  let isExist = namespace.has(q.id);
  if (isExist) {
    let old = namespace.get(q.id);
    this.logger.warn(
      `"${ind}" Component "${old.id} @${old.className}" is substituted by "${q.id} @${q.class}", use #forceInsert to avoid this warning.`,
      {diagnosticCode: 'COMPONENT_REPLACED', id: q.id, space: space}
    );
  }
  return this.forceInsert(q, isCore);
}

/**
 * Creates a component of `q.class` and stores it in a namespace.
 *
 * For example `{id: "k1", class: "Const", space: "one"}` creates a `Const`
 * component in namespace `one`.
 * 
 * @param {object} q The `#forceInsert` statement in JS object format.
 * @param {boolean} isCore Marks the component as read-only.
 * 
 * @returns {Component|undefined} The created component, or `undefined` if validation fails.
 */
Container.prototype.forceInsert = function(q = {}, isCore = false){
  let ind = getIndexFromQ(q);

  let space = q.space || 'nameless';
  // check index
  if (q.id == null || q.id === '') {
    this.logger.error(
      `${ind} id should not be empty, got "${q.id}"\n\t- ${JSON.stringify(q)}`,
      {diagnosticCode: 'MISSING_IDENTIFIER', id: q.id, space, action: q.action || 'forceInsert', path: 'id'}
    );
    return;
  }
  if (typeof q.id !== 'string' || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)) {
    this.logger.error(
      `${ind} id should be string of type ID, got "${q.id}"\n\t- ${JSON.stringify(q)}`,
      {diagnosticCode: 'INVALID_IDENTIFIER', id: q.id, space, action: q.action || 'forceInsert'}
    );
    return;
  }
  if (reservedWords.indexOf(q.id) !== -1) {
    this.logger.error(
      `id must not be a reserved word, got "${ind}". Reserved words list: \n\t ${reservedWords.join(', ')}`,
      {diagnosticCode: 'RESERVED_IDENTIFIER', space, id: q.id, action: q.action || 'forceInsert', path: 'id'}
    );
    return;
  }
  if (q.class === undefined || q.class === '') {
    this.logger.error(
      `Component "${ind}" requires a "class" property.`,
      {diagnosticCode: 'MISSING_CLASS', space, id: q.id, action: q.action || 'forceInsert'}
    );
    return;
  }
  if (typeof q.class !== 'string'){
    this.logger.error(
      `${ind} Class must be string for "insert": ${q.class}`,
      {diagnosticCode: 'INVALID_CLASS', space: space, id: q.id, wrongClass: q.class}
    );
    return;
  }

  // check if class is in the list
  let selectedClass = this.classes[q.class];
  if (selectedClass === undefined){
    this.logger.error(
      `"${ind}" Unknown class "${q.class}" for the component.`,
      {space: space, diagnosticCode: 'INVALID_CLASS'}
    );
    return;
  }

  // get in namespace
  let namespace = this.namespaceStorage.get(space);
  if (namespace === undefined) {
    this.logger.error(
      `"${ind}" create namespace "${space}" before use.`,
      {diagnosticCode: 'MISSING_NAMESPACE', space, id: q.id, action: q.action || 'forceInsert'}
    );
    return;
  }

  // normal flow
  let component = new selectedClass(isCore).merge(q);
  component.namespace = namespace; // set parent space directly to component
  namespace.set(q.id, component);
  return component;
};

/**
 * Updates an existing component.
 * 
 * @param {object} q The `#update` action in JS object format.
 * 
 * @returns {Component|undefined} Updated component, or `undefined` if validation fails.
 */
Container.prototype.update = function(q = {}){
  let space = q.space || 'nameless';
  if (q.id == null || q.id === '') {
    this.logger.error(
      `"id" property is not set in "#update" action:\n\t- ${JSON.stringify(q)}`,
      {diagnosticCode: 'MISSING_IDENTIFIER', id: q.id, space, action: 'update', path: 'id'}
    );
    return;
  }
  if (typeof q.id !== 'string' || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)) {
    this.logger.error(
      `"id" property should be string in "#update" action, got "${q.id}"`,
      {diagnosticCode: 'INVALID_IDENTIFIER', id: q.id, space, action: 'update'}
    );
    return;
  }
  let ind = getIndexFromQ(q);
  if (q.class){
    this.logger.error(
      `${ind} "class" property is not allowed for "update": ${q.class}`,
      {diagnosticCode: 'PROPERTY_NOT_ALLOWED_IN_ACTION', action: 'update', property: 'class', value: q.class, id: q.id, space}
    );
    return;
  }
  // set component
  let namespace = this.namespaceStorage.get(space);
  if (namespace === undefined) {
    this.logger.error(
      `${ind} Create namespace "${space}" before use.`,
      {diagnosticCode: 'MISSING_NAMESPACE', space, id: q.id, action: 'update'}
    );
    return;
  }

  let targetComponent = namespace.get(q.id);
  // creation of new components is not allowed
  if (targetComponent === undefined) {
    this.logger.error(
      `${ind} component does not exist which is not allowed for the "update" action.`,
      {diagnosticCode: 'MISSING_REFERENCE', space, id: q.id, reference: q.id, action: 'update'}
    );
    return;
  }
  if (targetComponent.isCore) {
    this.logger.error(
      `${ind} Core component is read-only and cannot be updated.`,
      {diagnosticCode: 'UPDATE_CORE_COMPONENT', space, id: q.id, action: 'update'}
    );
    return;
  }

  // normal flow
  targetComponent.merge(q);
  return targetComponent;
};

/**
 * Inserts a component when `q.class` is present, otherwise updates an existing component.
 * 
 * @param {object} q The `#update` or `#insert` action in JS object format.
 * @param {boolean} isCore Marks inserted components as read-only.
 * 
 * @returns {Component|undefined} Updated or inserted component.
 */
Container.prototype.upsert = function(q = {}, isCore = false){
  if ('class' in q) {
    return this.insert(q, isCore);
  } else {
    return this.update(q);
  }
};

/**
 * Deletes an existing component from a namespace.
 * 
 * @param {object} q The `#delete` action in JS object format.
 * 
 * @returns {boolean|undefined} `true` if the component was deleted, otherwise `undefined`.
 */
Container.prototype.delete = function(q = {}){
  let space = q.space || 'nameless';

  if (q.id == null || q.id === '') {
    this.logger.error(
      `"id" property is not set in "#delete" action:\n\t- ${JSON.stringify(q)}`,
      {diagnosticCode: 'MISSING_IDENTIFIER', id: q.id, space, action: 'delete', path: 'id'}
    );
    return;
  }
  if (typeof q.id !== 'string' || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)) {
    this.logger.error(
      `"id" property should be string in "#delete" action, got "${q.id}"`,
      {diagnosticCode: 'INVALID_IDENTIFIER', id: q.id, space, action: 'delete'}
    );
    return;
  }
  let ind = getIndexFromQ(q);
  if (q.class){
    this.logger.error(
      `${ind} "class" property is not allowed for "delete": ${q.class}`,
      {diagnosticCode: 'PROPERTY_NOT_ALLOWED_IN_ACTION', action: 'delete', property: 'class', value: q.class, id: q.id, space}
    );
    return;
  }
  // set component
  let namespace = this.namespaceStorage.get(space);
  if (namespace === undefined) {
    this.logger.error(
      `${ind} Create namespace "${space}" before use.`,
      {diagnosticCode: 'MISSING_NAMESPACE', space, id: q.id, action: 'delete'}
    );
    return;
  }
  
  var targetComponent = namespace.get(q.id);
  if (!targetComponent) { // if targetComponent===false, element is not exist
    this.logger.error(
      `${ind} Element with id "${q.id}" does not exist and cannot be deleted.`,
      {diagnosticCode: 'MISSING_REFERENCE', space, id: q.id, reference: q.id, action: 'delete'}
    );
    return;
  }
  if(targetComponent.isCore){
    this.logger.error(
      `${ind} Core component is read-only and cannot be deleted.`,
      {diagnosticCode: 'DELETE_CORE_COMPONENT', space: space, id: q.id}
    );
    return;
  }
  
  // normal flow
  return namespace.delete(q.id);
};

/**
 * Creates or updates a namespace.
 *
 * If the namespace is new, a default `t @TimeScale` component is inserted.
 * Existing namespaces keep their components and can switch between
 * `abstract` and `concrete` type.
 * 
 * @param {object} q The `#setNS` action in JS object format.
 *
 * @returns {void}
 */
Container.prototype.setNS = function(q = {}){
  // default space
  let space = q.space !== undefined ? q.space : 'nameless';

  // create namespace if not exists
  let namespace = this.namespaceStorage.get(space);
  if (namespace === undefined){
    namespace = new Namespace(space);
    namespace.container = this; // set parent
    this.namespaceStorage.set(space, namespace);
    
    // set default t @TimeScale in all namespaces
    this.insert({id: 't', space: space, class: 'TimeScale'});
  }
  // it is possible to update type
  namespace._isAbstract = q.type === 'abstract';
  let typeString = namespace._isAbstract ? 'abstract' : 'concrete';
  //this.logger.info(`Namespace "${space}" was set as "${typeString}"`);
};

/**
 * Deletes a namespace by `q.space`.
 *
 * @param {object} q The namespace selector.
 *
 * @returns {Container} This container.
 */
Container.prototype.deleteNS = function(_q = {}) {
  let q = Object.assign({space: 'nameless'}, _q);
  if (this.namespaceStorage.has(q.space)) {
    this.namespaceStorage.delete(q.space);
    //this.logger.info(`Namespace "${q.space}" was deleted.`);
  } else {
    this.logger.error(
      `Namespace "${q.space}" is not found.`,
      {diagnosticCode: 'MISSING_NAMESPACE', space: q.space, action: 'deleteNS'}
    );
  }

  return this;
};

/**
 * Clones all components from one namespace into another namespace.
 * 
 * @example
 * ```
 * let q = {
 *   action: 'importNS'
 *   space: 'two',
 *   fromSpace: 'one',
 *   prefix: '',
 *   suffix: '',
 *   rename: {}
 * };
 * container.importNS(q);
 * ```
 * 
 * @param {object} q The `#importNS` action in JS object format. 
 * 
 * @returns {Component[]|undefined} Array of cloned components, or `undefined` if validation fails.
 */
Container.prototype.importNS = function(_q = {}){
  let q = Object.assign({
    prefix: '',
    suffix: '',
    rename: {}
  }, _q);

  let space = q.space || 'nameless';
  if (q.fromId) {
    this.logger.error(
      `fromId must not be set for #importNS, got "${q.fromId}"`,
      {diagnosticCode: 'PROPERTY_NOT_ALLOWED_IN_ACTION', action: 'importNS', property: 'fromId', value: q.fromId, space}
    );
    return; // BRAKE
  }
  if (q.id) {
    this.logger.error(
      `id must not be set for #importNS, got "${q.id}"`,
      {diagnosticCode: 'PROPERTY_NOT_ALLOWED_IN_ACTION', action: 'importNS', property: 'id', value: q.id, space}
    );
    return; // BRAKE
  }
  let namespace = this.namespaceStorage.get(space);
  if (namespace === undefined) {
    this.logger.error(
      `Create namespace "${space}" before use.`,
      {diagnosticCode: 'MISSING_NAMESPACE', space, action: 'importNS', path: 'space'}
    );
    return;
  }
  if (q.fromSpace == null || q.fromSpace === '') {
    this.logger.error(
      'Source namespace "fromSpace" is required for #importNS.',
      {diagnosticCode: 'MISSING_SOURCE_NAMESPACE', action: 'importNS', space, fromSpace: q.fromSpace}
    );
    return;
  }
  if (typeof q.fromSpace !== 'string') {
    this.logger.error(
      `Source namespace "fromSpace" must be a string for #importNS, got "${q.fromSpace}".`,
      {diagnosticCode: 'INVALID_SOURCE_NAMESPACE', action: 'importNS', space, fromSpace: q.fromSpace}
    );
    return;
  }
  let fromNamespace = this.namespaceStorage.get(q.fromSpace);
  if (fromNamespace === undefined) {
    this.logger.error(
      `Create namespace "${q.fromSpace}" before use.`,
      {diagnosticCode: 'MISSING_NAMESPACE', space, fromSpace: q.fromSpace, action: 'importNS', path: 'fromSpace'}
    );
    return;
  }

  // normal flow
  let clones = fromNamespace.toArray().map((component) => {
    // update id: q.id is ignored, q.rename[component.id], [q.suffix, component.id, q.prefix].join('')
    let newId = q.rename[component.id] 
      || [q.prefix, component.id, q.suffix].join(''); // prefix-id-suffix as default value

    // cloning and update references
    let clone = component.clone().merge({id: newId});
    clone.namespace = namespace;
    clone.updateReferences(q);

    namespace.set(newId, clone);

    return clone;
  });

  return clones;
};

// #import
/**
 * Clones one component from another namespace and rewrites its references.
 * 
 * @example
 * ```
 * q = {
 *    action: 'import',
 *    id: 'k2',
 *    space: 'two'
 *    fromId: k1,
 *    fromSpace: one,
 *    prefix: '',
 *    suffix: '',
 *    rename: {}
 * };
 * 
 * container.import(q);
 * ```
 * 
 * @param {object} q The `#import` action in JS object format.  
 * 
 * @returns {Component|undefined} Cloned component, or `undefined` if validation fails.
 */
Container.prototype.import = function(_q = {}){
  let ind = getIndexFromQ(_q);

  let q = Object.assign({
    prefix: '',
    suffix: '',
    rename: {}
  }, _q);

  let space = q.space || 'nameless';
  // checking arguments
  if (q.fromId == null || q.fromId === '') {
    this.logger.error(
      `${ind} fromId should be string, but have "${q.fromId}"`,
      {diagnosticCode: 'MISSING_IMPORT_SOURCE_ID', fromId: q.fromId, fromSpace: q.fromSpace, id: q.id, space, action: 'import'}
    );
    return;
  }
  if (typeof q.fromId !== 'string' || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.fromId)) {
    this.logger.error(
      `${ind} fromId should be string of type ID, got "${q.fromId}"`,
      {diagnosticCode: 'INVALID_IMPORT_SOURCE_ID', fromId: q.fromId, fromSpace: q.fromSpace, id: q.id, space, action: 'import'}
    );
    return;
  }
  if (q.id == null || q.id === ''){
    this.logger.error(
      `${ind} id should be string, but have "${q.id}"`,
      {diagnosticCode: 'MISSING_IDENTIFIER', id: q.id, space, action: 'import', path: 'id'}
    );
    return;
  }
  if (typeof q.id !== 'string' || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)){
    this.logger.error(
      `${ind} id should be string, but have "${q.id}"`,
      {diagnosticCode: 'INVALID_IDENTIFIER', id: q.id, space, action: 'import'}
    );
    return;
  }

  let namespace = this.namespaceStorage.get(space);
  if (namespace === undefined) {
    this.logger.error(
      `Create namespace "${space}" before use.`,
      {diagnosticCode: 'MISSING_NAMESPACE', space, id: q.id, action: 'import', path: 'space'}
    );
    return;
  }

  if (q.fromSpace == null || q.fromSpace === '') {
    this.logger.error(
      'Source namespace "fromSpace" is required for #import.',
      {diagnosticCode: 'MISSING_SOURCE_NAMESPACE', action: 'import', id: q.id, fromId: q.fromId, space, fromSpace: q.fromSpace}
    );
    return;
  }
  if (typeof q.fromSpace !== 'string') {
    this.logger.error(
      `Source namespace "fromSpace" must be a string for #import, got "${q.fromSpace}".`,
      {diagnosticCode: 'INVALID_SOURCE_NAMESPACE', action: 'import', id: q.id, fromId: q.fromId, space, fromSpace: q.fromSpace}
    );
    return;
  }

  let fromNamespace = this.namespaceStorage.get(q.fromSpace);
  if (fromNamespace === undefined) {
    this.logger.error(
      `Create namespace "${q.fromSpace}" before use.`,
      {diagnosticCode: 'MISSING_NAMESPACE', space, fromSpace: q.fromSpace, id: q.id, action: 'import', path: 'fromSpace'}
    );
    return;
  }
  
  // select component to copy
  let component = fromNamespace.get(q.fromId);
  if (!component) {
    this.logger.error(
      `Element with ${q.fromSpace}::${q.fromId} does not exist and cannot be imported.`,
      {diagnosticCode: 'MISSING_REFERENCE', space, id: q.id, reference: q.fromId, fromSpace: q.fromSpace, action: 'import'}
    );
    return;
  }

  // normal flow
  let clone = component.clone().merge({id: q.id});
  clone.namespace = namespace;
  clone.updateReferences(q);
  namespace.set(q.id, clone);

  return clone;
};

/**
 * Selects a component by id and namespace.
 *
 * @param {object} q Component selector in Q-object format.
 *
 * @returns {Component|undefined} Selected component, or `undefined` if validation fails.
 */
Container.prototype.select = function(q = {}){

  let space = q.space || 'nameless';
  if (q.id == null || q.id === '') {
    this.logger.error(
      `"id" property is not set in "#select" action:\n\t- ${JSON.stringify(q)}`,
      {diagnosticCode: 'MISSING_IDENTIFIER', id: q.id, space, action: 'select', path: 'id'}
    );
    return;
  }
  if (typeof q.id !== 'string' || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)) {
    this.logger.error(
      `"id" property should be string in "#select" action, got "${q.id}"`,
      {diagnosticCode: 'INVALID_IDENTIFIER', id: q.id, space, action: 'select'}
    );
    return;
  }

  let namespace = this.namespaceStorage.get(space);
  let ind = getIndexFromQ(q);
  if (namespace === undefined) {
    this.logger.error(
      `${ind} Create namespace "${space}" before use.`,
      {diagnosticCode: 'MISSING_NAMESPACE', space, id: q.id, action: 'select'}
    );
    return;
  }
  
  // normal flow
  return namespace.get(q.id);
};

/**
 * Accepts metadata records without changing the container.
 *
 * @param {object} q Metadata object.
 *
 * @returns {undefined}
 */
Container.prototype.hasMeta = function(q = {}) {
  // do nothing, just for store meta info
  return;
}

/**
 * Calculates string formatted index.
 * Example: `{id: 'k1', space: 'one'}` => `'one::k1'`
 * 
 * @param {object} q Heta's element in Q-object format.
 * @returns {string} Get index of a component.
 */
function getIndexFromQ(q = {}){
  if (q.space !== undefined) {
    return `${q.space}::${q.id}`;
  } else {
    return q.id;
  }
}
