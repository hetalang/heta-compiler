// const _ = require('lodash');

const { Component } = require('./component');

class ReferenceDefinition extends Component {
  merge(q = {}){
    super.merge(q);
    let validationLogger = ReferenceDefinition.isValid(q);

    this.logger.pushMany(validationLogger);
    if (!validationLogger.hasErrors) {
      if(q.prefix) this.prefix = q.prefix;
      if(q.suffix) this.suffix = q.suffix;
    }

    return this;
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
