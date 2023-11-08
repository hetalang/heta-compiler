const _ = require('lodash');

const { Component } = require('./component');

class ReferenceDefinition extends Component {
  merge(q = {}){
    super.merge(q);
    let logger = this.namespace?.container?.logger;
    let valid = ReferenceDefinition.isValid(q, logger);

    if (valid) {
      if(q.prefix) this.prefix = q.prefix;
      if(q.suffix) this.suffix = q.suffix;
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
}

module.exports = {
  ReferenceDefinition
};
