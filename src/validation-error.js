class SchemaValidationError extends Error {
  constructor(diagnostics = [], schemaName, fileName, lineNumber){
    let message = `Validation not passed for ${schemaName}\n`
      + JSON.stringify(diagnostics, null, 2);
    super(message, fileName, lineNumber);
    this.name = 'SchemaValidationError';
    this.schemaName = schemaName;
    this.diagnostics = diagnostics;
  }
}

class IndexValidationError extends Error {
  constructor(index, fileName, lineNumber){
    let message = 'Wrong Heta index '
      + JSON.stringify(index);
    super(message, fileName, lineNumber);
    this.name = 'IndexValidationError';
    this.index = index;
  }
}

class RefValidationError extends Error {
  constructor(message, fileName, lineNumber){
    super(message, fileName, lineNumber);
  }
}

module.exports = {
  SchemaValidationError,
  IndexValidationError,
  RefValidationError
};
