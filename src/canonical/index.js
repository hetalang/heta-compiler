const Container = require('../container/main');
const pkg = require('../../package');
const { sha256 } = require('js-sha256');

Container.prototype.makeCanonicalObject = function() {
    let nsArray = [...this.namespaceStorage];

    // create qArr from NS
    let qArr_ns = nsArray
      .map(([spaceName, ns]) => ns.toQ({ canon: true }));
    let qArr_components = nsArray
      .map(([spaceName, ns]) => ns.toQArr(true, { useUnitsExpr: false, canon: true })) // remove core components, use canonical units
      .flat();
    let qArr_unitDef = [...this._builder.container.unitDefStorage]
      .filter(([id, unitDef]) => !unitDef.isCore)
      .map(([id, unitDef]) => unitDef.toQ({ useUnitsExpr: false, canon: true })); // use canonical units
    let qArr_functionDef = [...this._builder.container.functionDefStorage]
      .filter(([id, functionDef]) => !functionDef.isCore)
      .map(([id, functionDef]) => functionDef.toQ());
    let qArr_scenario = [...this._builder.container.scenarioStorage]
      .filter(([id, scenario]) => !scenario.isCore)
      .map(([id, scenario]) => scenario.toQ());
    
    let qArr_full = [].concat(
      _sortElements(qArr_ns),
      _sortElements(qArr_components),
      _sortElements(qArr_functionDef),
      _sortElements(qArr_unitDef),
      _sortElements(qArr_scenario)
    );

    return _sortKeys(qArr_full);
};

Container.prototype.makeCanonicalFull = function() {
    // create full object without meta
    let qArr_full = this.makeCanonicalObject();
 
    // create canonical string
    let canonicalString = JSON.stringify(qArr_full);
    // create hash sum
    const hash = sha256(canonicalString); // canonical JSON, hex digest

    let qArr_final = [{
      action: 'hasMeta',
      toolName: pkg.name,
      toolVersion: pkg.version,
      createdAt: new Date().toISOString(),
      platformId: this._builder.id,
      platformVersion: this._builder.version,
      format: 'JSON',
      canonical: true,
      hashSum: hash,
      hashAlgorithm: 'sha256'
    }].concat(qArr_full);

    return qArr_final;
};

// Return array of elements sorted by action/space/id
function _sortElements(array) {
  return array.sort((x, y) => {
    let keyA = x.action + '::' + (x.space || '') + '::' + (x.id || '');
    let keyB = y.action + '::' + (y.space || '') + '::' + (y.id || '');
    return keyA.localeCompare(keyB);
  });
}

// Return object with sorted properties (keys)
function _sortKeys(o) {
  if (Array.isArray(o)) return o.map(_sortKeys);
  if (typeof o === 'string') return o.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (o && typeof o === 'object') {
    const out = {};
    for (const k of Object.keys(o).sort()) out[k] = _sortKeys(o[k]);
    return out;
  }
  return o;
}
