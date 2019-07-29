const math = require('mathjs');
const mathjsTranslate = require('mathjs-translate');
math.import(mathjsTranslate);
const mathjsCMathML = require('mathjs-cmathml');
math.import(mathjsCMathML);

class Expression {
  constructor(q = {}){ // string or object
    if(typeof q!=='string' && typeof q!=='number' && !('expr' in q))
      throw new TypeError('Expected <string> or <number> or {expr: <string>}, but get ' + JSON.stringify(q));

    if(typeof q==='string'){
      this._exprInput = q;
      this._inputLang = 'qs3p';
    }else if(typeof q==='number'){
      this._exprInput = q + ''; // implicit transformation to string
      this._inputLang = 'qs3p';
    }else{
      this._exprInput = q.expr;
      this._langInput = q.lang
        ? q.lang
        : 'qs3p';
    }
    try{
      this.exprParsed = math.parse(this._exprInput);
    }catch(e){
      throw new TypeError('Cannot parse .expr property. ' + e.message);
    }
    if(q.units) this.units = q.units;
    if(q.increment) this.increment = q.increment;
  }
  get expr(){
    return this.exprParsed.toString();
  }
  get num(){ // if it is constant than return number
    if(this.exprParsed.isConstantNode){
      return this.exprParsed.value;
    }
  }
  set expr(v){
    this._exprInput = v;
    this._langInput = 'qs3p';
    this.exprParsed = math.parse(this._exprInput);
  }
  get toCMathML(){
    return this.exprParsed
      .toCMathML()
      .toString();
  }
  static get schemaName(){
    return 'Expression';
  }
  get className(){
    return 'Expression';
  }
  toQ(){
    let res = {expr: this.expr};
    if(this.units) res.units = this.units;
    if(this.increment) res.increment = this.increment;
    return res;
  }
}

module.exports = {
  Expression
};
