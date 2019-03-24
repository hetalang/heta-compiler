const { _Scoped } = require('./_scoped');
const { Numeric } = require('./numeric');
const { Expression } = require('./expression');
const { UnitsParser, qspUnits } = require('units-parser');
let uParser = new UnitsParser(qspUnits);
const _ = require('lodash');

class Record extends _Scoped {
  constructor(ind){
    super(ind);
    /*
    this.variable = {
      kind: 'static',
      size: new Numeric(0)
    };
    */
    // this.variable.parent = this; // this is cyclic ref

  }
  merge(q, skipChecking){
    if(!skipChecking) Record.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.assignments){
      let assignments = _.mapValues(q.assignments, (size) => {
        if(typeof size === 'number'){
          return new Numeric(size, true); // skip checking because already checked
        }else if(typeof size === 'string'){
          return new Expression(size, true);
        }else if('num' in size){
          return new Numeric(size, true);
        }else if('expr' in size){
          return new Expression(size, true);
        }else{
          // if code is OK never throws
          throw new Error('Wrong Variable argument.');
        }
      });
      this.assignments = _.assign(this.assignments, assignments); // maybe clone is required
    }

    if(q && q.units!==undefined){
      this.units = q.units;
    }

    return this;
  }
  static get schemaName(){
    return 'RecordP';
  }
  get className(){
    return 'Record';
  }
  toQ(){
    let res = super.toQ();
    if(this.assignments){
      res.assignments = _.mapValues(this.assignments, (value) => value.toQ());
    }
    res.units = this.units;
    return res;
  }
  get unitsHash(){
    if(this.variable.units){
      return uParser
        .parse(this.variable.units)
        .toHash();
    }else{
      return;
    }
  }
}

module.exports = {
  Record
};
