// error for wrong constructor args
class HetaValidationError extends Error {}
HetaValidationError.prototype.name = 'HetaValidationError';

// error for matching heta schema
class SchemaValidationError extends HetaValidationError {
  constructor(diagnostics = [], schemaName, fileName, lineNumber){
    let message = `Validation not passed for ${schemaName}\n`
      + JSON.stringify(diagnostics, null, 2);
    super(message, fileName, lineNumber);
    this.schemaName = schemaName;
    this.diagnostics = diagnostics;
  }
}
SchemaValidationError.prototype.name = 'SchemaValidationError';

// errors in container and actions
class ContainerError extends Error {}
ContainerError.prototype.name = 'ContainerError';

// error for checking internal references
class RefValidationError extends Error {}
RefValidationError.prototype.name = 'RefValidationError';

module.exports = {
  SchemaValidationError,
  HetaValidationError,
  RefValidationError,
  ContainerError
};
