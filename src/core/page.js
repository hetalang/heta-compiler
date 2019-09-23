const { _Simple } = require('./_simple');

class Page extends _Simple {
  merge(q, skipChecking){
    if(!skipChecking) Page.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.content) this.content = q.content;

    return this;
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
