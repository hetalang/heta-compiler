const { _Scoped } = require('./_scoped');

class Page extends _Scoped {
  merge(q, skipChecking){
    if(!skipChecking) Page.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.content) this.content = q.content;

    return this;
  }
  static get schemaName(){
    return 'PageP';
  }
  get className(){
    return 'Page';
  }
  toQ(){
    let res = super.toQ();
    if(this.content) res.content = this.content;
    return res;
  }
}

module.exports = {
  Page
};
