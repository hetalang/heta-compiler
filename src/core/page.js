const { Component } = require('./component');
const _ = require('lodash');

class Page extends Component {
  merge(q = {}){
    super.merge(q);
    let logger = _.get(this, 'namespace.container.logger');
    let valid = Page.isValid(q, logger);

    if (valid) {
      if (q.content) this.content = q.content;
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
}

module.exports = {
  Page
};
