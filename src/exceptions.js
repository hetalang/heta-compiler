function exception(message){
  console.log(message);
}

class ValidationError extends Error {
  constructor(message, troubles = []){
    super(message);
    this.troubles = troubles;
  }
}

class SchemaValidationError extends Error {
  constructor(message, diagnostics = []){
    super(
      message + ' Diagnostics:\n'
      + JSON.stringify(diagnostics, null, 2)
    );
    this.diagnostics = diagnostics;
  }
}

module.exports = {
  exception,
  ValidationError,
  SchemaValidationError
};
