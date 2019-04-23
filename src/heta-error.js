// default error but available for heta users
class HetaError extends Error {
  constructor(...params){
    super(...params);
  }
  logMessage(){
    return `${this.message}`;
  }
}
HetaError.prototype.name = 'HetaError';

class IndexedHetaError extends HetaError {
  constructor(q, ...params){
    super(...params);
    this.index = _getIndex(q);
  }
  logMessage(){
    return `(${this.index}) ${this.message}`;
  }
}
IndexedHetaError.prototype.name = 'IndexedHetaError';

// error for matching heta schema
class SchemaValidationError extends IndexedHetaError {
  constructor(diagnostics = [], schemaName, index, ...params){
    super(index, ...params);
    this.schemaName = schemaName;
    this.diagnostics = diagnostics;
  }
  logMessage(){
    return `(${this.index}) Element does not satisfy schema "${this.schemaName}"\n` + this.diagnostics
      .map((x, i) => `\t${i+1}. ${x.dataPath} ${x.message}`)
      .join('\n');
  }
}
SchemaValidationError.prototype.name = 'SchemaValidationError';

module.exports = {
  SchemaValidationError,
  IndexedHetaError,
  HetaError
};

function _getIndex(q={}){
  if(q.space!==undefined){
    return `${q.space}.${q.id}`;
  }else{
    return q.id;
  }
}
