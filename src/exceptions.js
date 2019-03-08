function exception(message){
  console.log(message);
}

class SchemaValidationError extends Error {
  constructor(message, troubles){
    super(message);
    this.troubles = troubles;
  }
}

module.exports = {
  exception,
  SchemaValidationError
};
