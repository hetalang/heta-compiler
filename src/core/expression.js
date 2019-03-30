const math = require('mathjs');
const mathjsTranslate = require('mathjs-translate');
math.import(mathjsTranslate);
const mathjsCMathML = require('mathjs-cmathml');
math.import(mathjsCMathML);
const _ = require('lodash');

class Expression {
  constructor(q){ // string or object
    if(typeof q!=='string' && !('expr' in q))
      throw new Error('Wrong Expression input: ' + q);

    if(typeof q==='string'){
      this._exprInput = q;
      this._inputLang = 'qs3p';
    }else{
      this._exprInput = q.expr;
      this._langInput = q.lang
        ? q.lang
        : 'qs3p';
    }
    this.exprParsed = math.parse(this._exprInput);
    if(q.units) this.units = q.units;
  }
  get expr(){
    return this.exprParsed.toString();
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
    return res;
  }
}

module.exports = {
  Expression
};
