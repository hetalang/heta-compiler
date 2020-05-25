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
    super.merge(q);
    let logger = this.namespace.container.logger;
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
  toQ(options = {}){
    let res = super.toQ(options);
    if(this.filepath) res.filepath = this.filepath;
    if(this.powTransform!=='keep') res.powTransform = this.powTransform;

    return res;
  }
}

_Export._requirements = {
  defaultTask: { 
    required: false,
    isReference: true, targetClass: 'SimpleTask', setTarget: true 
  }
};

module.exports = { _Export };
