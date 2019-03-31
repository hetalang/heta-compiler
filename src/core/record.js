const { _Scoped } = require('./_scoped');
const { Numeric } = require('./numeric');
const { Expression } = require('./expression');
const { UnitsParser, qspUnits } = require('units-parser');
let uParser = new UnitsParser(qspUnits);
const _ = require('lodash');
const expect = require('chai').expect;
const math = require('mathjs');

class Record extends _Scoped {
  constructor(ind){
    super(ind);
  }
  merge(q, skipChecking){
    if(!skipChecking) Record.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.assignments){ // add new assignments from q
      let newAssignments = _.mapValues(q.assignments, (x) => {
        if(typeof x.size === 'number' || 'num' in x.size){
          var size = new Numeric(x.size);
        }else if(typeof x.size === 'string' || 'expr' in x.size){
          size = new Expression(x.size);
        }else{
          throw new Error('Wrong size argument.');// if code is OK never throws
        }
        return new Assignment({size: size, increment: x.increment, id: this.id}); // set id for increment support
      });
      this.assignments = _.assign(this.assignments, newAssignments); // maybe clone is required
    }

    if(q && q.units!==undefined) this.units = q.units;

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
      res.assignments = _.mapValues(this.assignments, (x) => x.toQ());
    }
    res.units = this.units;
    return res;
  }
  SBMLUnits(){
    return this.units;
  }
  unitsHash(){
    if(this.units){
      return uParser
        .parse(this.units)
        .toHash();
    }else{
      return;
    }
  }
}

class Assignment {
  constructor(q){
    expect(q.size.className).to.be.oneOf(['Numeric', 'Expression', 'Const']);
    this.size = q.size;
    if(q.increment!==undefined) this.increment = q.increment;
    if(q.id!==undefined) this.id = q.id;
  }
  get exprParsed(){
    if(this.size instanceof Expression){
      var exprParsed = this.size.exprParsed.cloneDeep();
    }else{
      exprParsed = math.parse(this.size.num);
    }
    if(!this.increment){
      return exprParsed;
    }else{
      let idSymbol = new math.expression.node.SymbolNode(this.id);
      return new math.expression.node.OperatorNode('+', 'add', [
        idSymbol, exprParsed
      ]);
    }
  }
  toCMathML(){
    return this.exprParsed
      .toCMathML()
      .toString();
  }
  toQ(){
    let res = {size: this.size.toQ()};
    if(this.increment) res.increment = true;
    return res;
  }
}

module.exports = {
  Record,
  Assignment
};
