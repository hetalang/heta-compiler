const { _Component } = require('./_component');

class Page extends _Component {
  merge(q = {}){
    super.merge(q);
    let validationLogger = Page.isValid(q);

    this.logger.pushMany(validationLogger);
    if (!validationLogger.hasErrors) {
      if(q.content) this.content = q.content;
    }
    
    return this;
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
