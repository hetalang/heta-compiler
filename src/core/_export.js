const { Component } = require('./component');

/*
  _Export class

  export1 @_Export {
    filepath: ../dir1,
    powTransform: keep // possible values are: keep/operator/function
  };
*/
class _Export extends Component {
  constructor(isCore = false){
    super(isCore);
    this.powTransform = 'keep';
  }
  merge(q = {}){
    let logger = this.container.logger;
    let valid = _Export.isValid(q, logger);

    if (valid) {
      this.format = q.format;
      if (q.filepath) this.filepath = q.filepath;
      if (q.powTransform) this.powTransform = q.powTransform;
    }

    return this;
  }
  static get schemaName(){
    return '_ExportP';
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
}

module.exports = { _Export };
