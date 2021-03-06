const { Top } = require('./top');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  required: ['filepath'],
  properties: {
    filepath: {type: 'string', pattern: '^[\\w\\d\\\\/._!-]+$'},
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
};

/*
  AbstractExport class

  export1 @AbstractExport {
    filepath: ../dir1,
    powTransform: keep // possible values are: keep/operator/function
  };
*/
class AbstractExport extends Top {
  constructor(q = {}, isCore = false){
    super(q, isCore);

    // check arguments here
    let logger = this._container.logger;
    let valid = AbstractExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    if (q.filepath) this.filepath = q.filepath;
  } 
  get className(){
    return 'AbstractExport';
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
    return ajv.compile(schema);
  }
}

module.exports = { AbstractExport };
