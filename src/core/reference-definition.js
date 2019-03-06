const _ = require('lodash');
const { markdown } = require('markdown');
const { validator } = require('./utilities.js');
const { exception } = require('../exceptions');

const { _Simple } = require('./_simple');

class ReferenceDefinition extends _Simple {
  merge(q){
    ReferenceDefinition.isValid(q);
    if(q && q.prefix) this.prefix = q.prefix;
    if(q && q.suffix) this.suffix = q.suffix;

    return this;
  }
  static get schemaName(){
    return 'ReferenceDefinition';
  }
  get className(){
    return 'ReferenceDefinition';
  }
}

module.exports = {
  ReferenceDefinition
};
