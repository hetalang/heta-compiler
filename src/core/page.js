const { _Component } = require('./_component');

class Page extends _Component {
  merge(q, skipChecking){
    if(!skipChecking) Page.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.content) this.content = q.content;

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
