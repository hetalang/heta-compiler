const _ = require('lodash');

class Numeric {
  constructor(q){
    if(typeof q!=='number' && !('num' in q))
      throw new Error('Wrong Numeric input: ' + q);

    if(typeof q==='number'){
      this.num = q;
    }else{
      this.num = q.num;
    }
    if(q.units) this.units = q.units;
  }
  get toCMathML(){
    return `<math xmlns="http://www.w3.org/1998/Math/MathML"><cn>${this.num}</cn></math>`;
  }
  static get schemaName(){
    return 'Numeric';
  }
  get className(){
    return 'Numeric';
  }
  toQ(){
    let res = { num: this.num };
    if(this.units) res.units = this.units;
    return res;
  }
}

module.exports = {
  Numeric
};
