const Container = require('./main');
const { Namespace } = require('../namespace');

// they cannot be used as id, when 
const reservedWords = [
  'include', 'block', 'namespace', 'abstract', 'concrete', 'begin', 'end',
  'NaN', 'Infinity',
  'e', 'E', 'pi', 'PI',
  'time', 'SOLVERTIME', 'default' // mrgsolve specific reserved words
];

/**
 * Creates one of inheritors of `AbstractExport` and put it in `container.exportStorage`.
 * The inheritor depends on `q.format` property.
 * For example `{id: 'output', format: 'JSON', ...}` creates the object of `JSONExport` type.
 * 
 * @param {object} q The `#export` statement in JS object format.
 * @param {Boolean} isCore Set element as a "core" which means you cannot rewrite or delete it.
 * 
 * @returns {AbstractExport} The created object.
 */
Container.prototype.export = function(q = {}, isCore = false){
  if (q.format === undefined) {
    this.logger.error(
      'Empty "format" option in #export',
      {type: 'QError'}
    );
    return;
  }
  if (typeof this.classes[q.format] !== 'function') {
    this.logger.error(
      `Unknown format "${q.format}" in #export action.`,
      {type: 'QError'}
    );
    return;
  }

  // create and push to storage
  let exportInstance = new this.classes[q.format](q, isCore);
  if (!exportInstance.errored) this.exportStorage.set(exportInstance.id, exportInstance);
  
  return exportInstance;
};

/**
 * Creates `UnitDef` instance and puts it in `container.unitDefStorage`.
 * 
 * @param {object} q The `#defineUnit` statement in JS object format.
 * @param {Boolean} isCore Set element as a "core" which means you cannot rewrite or delete it.
 * 
 * @returns {UnitDef} The created object.
 */
Container.prototype.defineUnit = function(q = {}, isCore = false){
  // normal flow
  let unitDefInstance = new this.classes.UnitDef(q, isCore);
  if (!unitDefInstance.errored) this.unitDefStorage.set(unitDefInstance.id, unitDefInstance);

  return unitDefInstance;
};

/**
 * Creates `FunctionDef` instance and puts it in `container.functionDefStorage`.
 * 
 * @param {object} q The `#defineFunction` statement in JS object format.
 * @param {Boolean} isCore Set element as a "core" which means you cannot rewrite or delete it.
 * 
 * @returns {FunctionDef} The created object.
 */
Container.prototype.defineFunction = function(q = {}, isCore = false){
  // normal flow
  let functionDefInstance = new this.classes.FunctionDef(q, isCore);
  if (!functionDefInstance.errored) this.functionDefStorage.set(functionDefInstance.id, functionDefInstance);

  return functionDefInstance;
};

/**
 * Creates `Scenario` instance and puts it in `container.scenarioStorage`.
 * 
 * @param {object} q The `#setScenario` statement in JS object format.
 * @param {Boolean} isCore Set element as a "core" which means you cannot rewrite or delete it.
 * 
 * @returns {Scenario} The created object.
 */
Container.prototype.setScenario = function(q = {}, isCore = false){
  // normal flow
  let scenarioInstance = new this.classes.Scenario(q, isCore);
  if (!scenarioInstance.errored) this.scenarioStorage.set(scenarioInstance.id, scenarioInstance);

  return scenarioInstance;
};

/**
 * Creates one of inheritors of `Component` and put it in a namespace.
 * The inheritor depends on `q.class` property.
 * For example `{id: 'k1', class: 'Const', namespace: 'one'}` creates the object of `Const` type
 * and puts it into namespace `one`.
 * 
 * @param {object} q The `#insert` statement in JS object format.
 * @param {Boolean} isCore Set element as a "core" which means you cannot rewrite or delete it.
 * 
 * @returns {Component} The created object.
 */
Container.prototype.insert = function(q = {}, isCore = false){
  let ind = getIndexFromQ(q);

  let space = q.space || 'nameless';
  // check index
  if (!q.id || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)) {
    this.logger.error(
      `${ind} id should be string of type ID, but have "${q.id}"\n\t- ${JSON.stringify(q)}`,
      {type: 'QError', space: space}
    );
    return;
  }
  if (reservedWords.indexOf(q.id) !== -1) {
    this.logger.error(
      `id must not be a reserved word, got "${ind}". Reserved words list: \n\t ${reservedWords.join(', ')}`,
      {type: 'QError', space: space}
    );
    return;
  }
  if (!q.class || typeof q.class !== 'string'){
    this.logger.error(
      `${ind} No class or unsuitable class for "insert": ${q.class}`,
      {type: 'QError', space: space}
    );
    return;
  }

  // old style export
  let exportCheck = q.class.match(/^(\w+)Export$/);
  if (exportCheck !== null) { // check if old export syntax is used
    this.logger.warn(`Usage of Export is deprecated starting from v0.5.0, use syntax: #export {format: ${exportCheck[1]}, ...}`)
    let exportQ = Object.assign({
      format: exportCheck[1],
      filepath: q.id
    }, q);
    delete exportQ.class;
    delete exportQ.id;
    return this.export(exportQ);
  }

  // check if class is in the list
  let selectedClass = this._componentClasses[q.class];
  if (selectedClass === undefined){
    this.logger.error(
      `"${ind}" Unknown class "${q.class}" for the component.`,
      {type: 'QError', space: space}
    );
    return;
  }

  // get in namespace
  let namespace = this.namespaceStorage.get(space);
  if (namespace === undefined) {
    this.logger.error(
      `"${ind}" create namespace "${space}" before use.`,
      {type: 'QError', space: space}
    );
    return;
  }

  // normal flow
  let component = new selectedClass(isCore);
  component._id = q.id;
  component.namespace = namespace; // set parent space directly to component
  component.merge(q);
  namespace.set(q.id, component);
  return component;
};

/**
 * Searches a component with the index and updates its properties.
 * 
 * @param {object} q The `#update` action in JS object format.
 * 
 * @returns {Component} Updated component.
 */
Container.prototype.update = function(q = {}){
  let space = q.space || 'nameless';
  if (!q.id) {
    this.logger.error(
      `"id" property is not set in "#update" action:\n\t- ${JSON.stringify(q)}`,
      {type: 'QError', space: space}
    );
    return;
  } else if (!/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)) {
    this.logger.error(
      `"id" property should be string in "#update" action, got "${q.id}"`,
      {type: 'QError', space: space}
    );
    return;
  }
  let ind = getIndexFromQ(q);
  if (q.class){
    this.logger.error(
      `${ind} "class" property is not allowed for "update": ${q.class}`,
      {type: 'QError', space: space}
    );
    return;
  }
  // set component
  let namespace = this.namespaceStorage.get(space);
  if (namespace === undefined) {
    this.logger.error(
      `${ind} Create namespace "${space}" before use.`,
      {type: 'QError', space: space}
    );
    return;
  }

  let targetComponent = namespace.get(q.id);
  // creation of new components is not allowed
  if (targetComponent === undefined) {
    this.logger.error(
      `${ind} component does not exist which is not allowed for the "update" action.`,
      {type: 'QError', space: space}
    );
    return;
  }
  if (targetComponent.isCore) {
    this.logger.error(
      `${ind} Core component is read-only and cannot be updated.`,
      {type: 'QError', space: space}
    );
    return;
  }

  // normal flow
  targetComponent.merge(q);
  return targetComponent;
};

/**
 * If `q.class` property is set it acts as `#insert` action. If not it works as `#update`.
 * 
 * @param {object} q The `#update` or `#insert` action in JS object format.
 * @param  {Boolean} isCore Set element as a "core" which means you cannot rewrite or delete it.
 * 
 * @returns {Component} Updated or inserted component.
 */
Container.prototype.upsert = function(q = {}, isCore = false){
  if ('class' in q) {
    return this.insert(q, isCore);
  } else {
    return this.update(q);
  }
};

/**
 * Deletes the `Component` with the index. If it is not exist it throws an error.
 * 
 * @param {*} q The `#delete` action in JS object format.
 * 
 * @returns {Component} Deleted component.
 */
Container.prototype.delete = function(q = {}){
  let space = q.space || 'nameless';

  if (!q.id) {
    this.logger.error(
      `"id" property is not set in "#delete" action:\n\t- ${JSON.stringify(q)}`,
      {type: 'QError', space: space}
    );
    return;
  } else if (!/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)) {
    this.logger.error(
      `"id" property should be string in "#delete" action, got "${q.id}"`,
      {type: 'QError', space: space}
    );
    return;
  }
  let ind = getIndexFromQ(q);
  if (q.class){
    this.logger.error(
      `${ind} "class" property is not allowed for "delete": ${q.class}`,
      {type: 'QError', space: space}
    );
    return;
  }
  // set component
  let namespace = this.namespaceStorage.get(space);
  if (namespace === undefined) {
    this.logger.error(
      `${ind} Create namespace "${space}" before use.`,
      {type: 'QError', space: space}
    );
    return;
  }
  
  var targetComponent = namespace.get(q.id);
  if (!targetComponent) { // if targetComponent===false, element is not exist
    this.logger.error(
      `${ind} Element with id "${q.id}" does not exist and cannot be deleted.`,
      {type: 'QError', space: space}
    );
    return;
  }
  if(targetComponent.isCore){
    this.logger.error(
      `${ind} Core component is read-only and cannot be deleted.`,
      {type: 'QError', space: space}
    );
    return;
  }
  
  // normal flow
  return namespace.delete(q.id);
};

/**
 * Creates namespace with id from `q.space` and push it to `container.namespaceStorage`.
 * If the namespace already exists it does not create anything but updates namespace properties.
 * It can also change `type` of a namespace. 
 * 
 * @param {object} The `#setNS` action in JS object format. 
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
  this.logger.info(`Namespace "${space}" was set as "${typeString}"`);
};

/**
 * Clones and rename all components to another space.
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
 * @returns {Component[]} Array of cloned components.
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
      {type: 'QError', space: space}
    );
    return; // BRAKE
  }
  if (q.id) {
    this.logger.error(`id must not be set for #importNS, got "${q.id}"`);
    return; // BRAKE
  }
  let namespace = this.namespaceStorage.get(space);
  if (namespace === undefined) {
    this.logger.error(
      `Create namespace "${space}" before use.`,
      {type: 'QError', space: space}
    );
    return;
  }
  if (!q.fromSpace || (typeof q.fromSpace !== 'string')) {
    this.logger.error(
      `space should be string, got "${q.fromSpace}"`,
      {type: 'QError', space: space}
    );
    return;
  }
  let fromNamespace = this.namespaceStorage.get(q.fromSpace);
  if (fromNamespace === undefined) {
    this.logger.error(
      `Create namespace "${q.fromSpace}" before use.`,
      {type: 'QError', space: space}
    );
    return;
  }

  // normal flow
  let clones = fromNamespace.toArray().map((component) => {
    // update id: q.id is ignored, q.rename[component.id], [q.suffix, component.id, q.prefix].join('')
    let newId = q.rename[component.id] 
      || [q.prefix, component.id, q.suffix].join(''); // prefix-id-suffix as default value

    // cloning and update references
    let clone = component.clone();
    clone._id = newId;
    clone.namespace = namespace;
    clone.updateReferences(q);

    namespace.set(newId, clone);

    return clone;
  });

  return clones;
};

// #moveNS
/*
  the same as importNS but delete all elements from source namespace
Container.prototype.moveNS = function(q = {}){
  let toClone = this.storage.selectBySpace(q.fromSpace);
  let clones = this.importNS(q);

  toClone.forEach((component) => {
    this.storage.delete(component.index);
  });

  return clones;
};
*/

// #import
/**
 * Clone a component to another space.
 * It also renames id and references stored in a component.
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
 * @returns {Component} Cloned component.
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
  if (!q.fromId || (typeof q.fromId !== 'string')) {
    this.logger.error(
      `${ind} fromId should be string, but have "${q.fromId}"`,
      {type: 'QError', space: space}
    );
    return;
  }
  if (!q.id || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)){
    this.logger.error(
      `${ind} id should be string, but have "${q.id}"`,
      {type: 'QError', space: space}
    );
    return;
  }

  let namespace = this.namespaceStorage.get(space);
  if (namespace === undefined) {
    this.logger.error(
      `Create namespace "${space}" before use.`,
      {type: 'QError', space: space}
    );
    return;
  }

  if (!q.fromSpace || (typeof q.fromSpace !== 'string')) {
    this.logger.error(
      `fromSpace should be string, but have "${q.fromSpace}"`,
      {type: 'QError', space: space}
    );
    return;
  }

  let fromNamespace = this.namespaceStorage.get(q.fromSpace);
  if (fromNamespace === undefined) {
    this.logger.error(
      `Create namespace "${q.fromSpace}" before use.`,
      {type: 'QError', space: space}
    );
    return;
  }
  
  // select component to copy
  let component = fromNamespace.get(q.fromId);
  if (!component) {
    this.logger.error(
      `Element with ${q.fromSpace}::${q.fromId} does not exist and cannot be imported.`,
      {type: 'QError', space: space}
    );
    return;
  }

  // normal flow
  let clone = component.clone();
  clone._id = q.id;
  clone.namespace = namespace;
  clone.updateReferences(q);
  namespace.set(q.id, clone);

  return clone;
};

// #move
/*
  the same as import but delete source component

Container.prototype.move = function(q = {}){
  let clone = this.import(q);

  // delete component
  this.delete({id: q.fromId, space: q.fromSpace});

  return clone;
}
*/

// #select
// XXX: don't really used
Container.prototype.select = function(q = {}){

  let space = q.space || 'nameless';
  if (!q.id) {
    this.logger.error(
      `"id" property is not set in "#select" action:\n\t- ${JSON.stringify(q)}`,
      {type: 'QError', space: space}
    );
    return;
  } else if (!/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)) {
    this.logger.error(
      `"id" property should be string in "#select" action, got "${q.id}"`,
      {type: 'QError', space: space}
    );
    return;
  }

  let namespace = this.namespaceStorage.get(space);
  let ind = getIndexFromQ(q);
  if (namespace === undefined) {
    this.logger.error(
      `${ind} Create namespace "${space}" before use.`,
      {type: 'QError', space: space}
    );
    return;
  }
  
  // normal flow
  return namespace.get(q.id);
};

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
