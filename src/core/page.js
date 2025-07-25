const { Component } = require('./component');
const { ajv } = require('../ajv');

const schema = {
  type: 'object',
  properties: {
    content: { anyOf: [
      { type: 'string' },
      { type: 'null' }
    ]}
  }
};

class Page extends Component {
  merge(q = {}){
    super.merge(q);
    let logger = this._container?.logger;
    let valid = Page.isValid(q, logger);

    if (valid) {
      if (q.content === null) {
        delete this.content;
      } else if (q.content !== undefined) {
        this.content = q.content;
      }
    }
    
    return this;
  }
  get className() {
    return 'Page';
  }
  clone(){
    let clonedComponent = super.clone();
    if (typeof this.content !== 'undefined')
      clonedComponent.content = this.content;
    
    return clonedComponent;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if(this.content) res.content = this.content;
    return res;
  }
  static get validate() {
    return ajv.compile(schema);
  }
}

module.exports = {
  Page
};
