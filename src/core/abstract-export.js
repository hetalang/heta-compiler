const { Top } = require('./top');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  required: ['filepath'],
  properties: {
    filepath: {type: 'string', pattern: '^[\\w\\d\\\\/._!-]+$'},
    spaceFilter: { type: 'string' }
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
    
    this.spaceFilter = q.spaceFilter || '.+';
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
  makeText(){
    throw new TypeError(`No method makeText() for "${this.className}"`);
  }
  make(){ // Buffer
    let text = this.makeText();
    let buffer = text.map((x) => {
      return {
        content: Buffer.from(x.content, 'utf-8'),
        pathSuffix: x.pathSuffix,
        type: 'buffer'
      };
    });
    
    return buffer;
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = { AbstractExport };
