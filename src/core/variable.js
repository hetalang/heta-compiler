const _ = require('lodash');
const { Numeric } = require('./numeric');
const { Expression } = require('./expression');
const {UnitsParser, qspUnits} = require('units-parser');
let uParser = new UnitsParser(qspUnits);

class Variable {
  constructor(q){
    this.kind = q.kind
      ? q.kind
      : 'static'; // default kind

    if(q.units) this.units = q.units;
    this.id = q.id;

    // different combinations of sizes

    /*if(q.size instanceof Numeric || q.size instanceof Expression){
      this.size = q.size;
    }else*/ if(typeof q.size==='number'){
      this.size = new Numeric(q.size);
    }else if(typeof q.size==='string'){
      this.size = new Expression(q.size);
    }else if('num' in q.size){
      this.size = new Numeric(q.size);
    }else if('expr' in q.size){
      this.size = new Expression(q.size);
    }else{
      // if code is OK never throws
      throw new Error('Wrong Variable argument.');
    }

  }
  get unitsHash(){
    if(this.units){
      return uParser
        .parse(this.units)
        .toHash();
    }else{
      return;
    }
  }
  toQ(){
    let res = _.pick(this, ['id', 'kind', 'units']);
    res.size = this.size.toQ();
    return res;
  }
}

module.exports = {
  Variable
};
