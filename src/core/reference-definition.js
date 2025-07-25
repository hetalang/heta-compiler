const { Component } = require('./component');
const { ajv } = require('../ajv');

const schema = {
  type: 'object',
  properties: {
    prefix: { type: 'string' },
    suffix: { type: 'string' }
  }
};

class ReferenceDefinition extends Component {
  merge(q = {}){
    super.merge(q);
    let logger = this._container?.logger;
    let valid = ReferenceDefinition.isValid(q, logger);

    if (valid) {
      if (q.prefix === null) {
        delete this.prefix;
      } else if (q.prefix !== undefined) {
        this.prefix = q.prefix;
      }
      if (q.suffix === null) {
        delete this.suffix;
      } else if (q.suffix !== undefined) {
        this.suffix = q.suffix;
      }
    }

    return this;
  }
  get className() {
    return 'ReferenceDefinition';
  }
  clone(){
    let clonedComponent = super.clone();
    if (typeof this.prefix !== 'undefined')
      clonedComponent.prefix = this.prefix;
    if (typeof this.suffix !== 'undefined')
      clonedComponent.suffix = this.suffix;
      
    return clonedComponent;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if(this.prefix) res.prefix = this.prefix;
    if(this.suffix) res.suffix = this.suffix;

    return res;
  }
  static get validate() {
    return ajv.compile(schema);
  }
}

module.exports = {
  ReferenceDefinition
};
