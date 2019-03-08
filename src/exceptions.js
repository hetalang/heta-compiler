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
  constructor(message, troubles = []){
    super(message);
    this.troubles = troubles;
  }
}

module.exports = {
  exception,
  ValidationError,
  SchemaValidationError
};
