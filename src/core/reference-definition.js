const _ = require('lodash');
// const { markdown } = require('markdown');
// const { validator } = require('./utilities.js');
// const { exception } = require('../exceptions');

const { _Simple } = require('./_simple');

class ReferenceDefinition extends _Simple {
  merge(q, skipChecking){
    if(!skipChecking) ReferenceDefinition.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.prefix) this.prefix = q.prefix;
    if(q && q.suffix) this.suffix = q.suffix;

    return this;
  }
  static get schemaName(){
    return 'ReferenceDefinitionP';
  }
  get className(){
    return 'ReferenceDefinition';
  }
  toQ(){
    let res = super.toQ();
    if(this.prefix) res.prefix = this.prefix;
    if(this.suffix) res.suffix = this.suffix;

    return res;
  }
}

module.exports = {
  ReferenceDefinition
};
