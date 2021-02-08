const { Top } = require('./top');

// TODO: move this to utilites later
const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true, jsonPointers: true});
require('ajv-errors')(ajv);

const validate = ajv.compile({
  type: 'object',
  required: ['format', 'filepath'],
  properties: {
    filepath: {type: 'string'},
    groupConstBy: {type: 'string', pattern: '^[\\w\\d.\\[\\]]+$'},
    powTransform: {type: 'string', enum: ['keep', 'function', 'operator'] },
    omitRows: {type: 'number'},
    splitByClass: {type: 'boolean'},
    noUnitsExpr: {type: 'boolean'},
    version: {type: 'string', pattern: '^L[123]V[12345]$'},
    spaceFilter: { oneOf: [
      { type: 'array', items: { '$ref': '#/definitions/ID' } },
      { '$ref': '#/definitions/ID' }
    ]}
  },
  definitions: {
    ID: {
      description: 'First character is letter, others are letter, digit or underscore.',
      type: 'string',
      minLength: 1,
      pattern: '^[_a-zA-Z][_a-zA-Z0-9]*$',
      example: 'x_12_'
    },
  }
});

/*
  _Export class

  export1 @_Export {
    filepath: ../dir1,
    powTransform: keep // possible values are: keep/operator/function
  };
*/
class _Export extends Top {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    this.powTransform = 'keep';

    // check arguments here
    let logger = this._container.logger;
    let valid = _Export.isValid(q, logger);

    if (valid) {
      if (q.filepath) this.filepath = q.filepath;
      this.format = q.format;
      if (q.powTransform) this.powTransform = q.powTransform;
    }

    return this;
  }
  /*
    Method creates exported files.
    return in format 
    [{
      content: <String>, // output text file
      pathSuffix: <String>, // relative path to output file
      type: 'text' // currently support only text
    }]
  */
  make(){
    throw new TypeError(`No method make() for "${this.className}"`);
  }
  static get validate(){
    return validate;
  }
}

module.exports = { _Export };
