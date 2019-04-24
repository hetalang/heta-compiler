// default error but available for heta users
class HetaError extends Error {
  constructor(...params){
    super(...params);
  }
}
HetaError.prototype.name = 'HetaError';

class IndexedHetaError extends HetaError {
  constructor(q, message, filename, lineNumber){
    let index = _getIndex(q);
    let indexedMessage = `(${index}) ${message}`;
    super(indexedMessage, filename, lineNumber);
    this.index = index;
  }
}
IndexedHetaError.prototype.name = 'IndexedHetaError';

// error for matching heta schema
class SchemaValidationError extends IndexedHetaError {
  constructor(diagnostics = [], schemaName, q, filename, lineNumber){
    let message = `Element does not satisfy schema "${schemaName}"\n`
      + diagnostics
        .map((x, i) => `\t${i+1}. ${x.dataPath} ${x.message}`)
        .join('\n');
    super(q, message, filename, lineNumber);
    this.schemaName = schemaName;
    this.diagnostics = diagnostics;
  }
}
SchemaValidationError.prototype.name = 'SchemaValidationError';

module.exports = {
  SchemaValidationError,
  IndexedHetaError,
  HetaError
};

function _getIndex(q = {}){
  if(q.space!==undefined){
    return `${q.space}.${q.id}`;
  }else{
    return q.id;
  }
}
