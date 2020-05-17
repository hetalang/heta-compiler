const { Component } = require('./component');

class Page extends Component {
  merge(q = {}){
    super.merge(q);
    let validationLogger = Page.isValid(q);

    this.logger.pushMany(validationLogger);
    if (!validationLogger.hasErrors) {
      if(q.content) this.content = q.content;
    }
    
    return this;
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
