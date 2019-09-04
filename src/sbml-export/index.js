const Container = require('../container');
const { _Export } = require('../core/_export');
//const { IndexedHetaError } = require('../heta-error');
const nunjucks = require('../nunjucks-env');
const XArray = require('../x-array');
const { Record } = require('../core/record');
const { Const } = require('../core/const');
const _ = require('lodash');

class SBMLExport extends _Export{
  merge(q, skipChecking){
    super.merge(q, skipChecking);
    if(q && q.model===undefined){
      throw new TypeError(`"model" property in SBMLExport ${this.id} should be declared.`);
    }
    this.model = q.model;
    if(q && q.skipMathChecking)
      this.skipMathChecking = q.skipMathChecking;

    return this;
  }
  get className(){
    return 'SBMLExport';
  }
  get ext(){
    return 'xml';
  }
  do(){
    this._model_ = this._getSBMLImage(this.model);
    return this.getSBMLCode();
  }
  _getSBMLImage(targetSpace){
    // creates empty model image
    let _model_ = {};

    let children = [...this._storage]
      .filter((x) => x[1].space===targetSpace)
      .map((x) => x[1]);
    _model_.population = new XArray(...children);

    // add Const to population
    let messages = []; // messages for reference errors
    _model_.population
      .selectByInstance(Record)
      .filter((record) => record.assignments)
      .forEach((record) => {
        _.forEach(record.assignments, (value, key) => {
          let deps = value.exprParsed
            .getSymbols()
            .filter((symbol) => ['t'].indexOf(symbol)===-1); // remove t from the search
          deps.forEach((id, i) => {
            let _component_ = _model_.population.getById(id);
            if(!_component_){ // component inside space is not found
              let _global_ = this._storage.get(id);
              if(!_global_){
                if(!this.skipMathChecking) messages.push(`Component "${id}" is not found in space "${record.space}" or in global as expected in expression\n`
                + `${record.id}$${record.space} [${key}]= ${value.expr};`);
              }else if(!(_global_ instanceof Const)){
                messages.push(`Component "${id}" is not a Const class as expected in expression\n`
                  + `${record.id}$${record.space} [${key}]= ${value.expr};`);
              }else{
                _model_.population.push(_global_);
              }
            }else if(!(_component_ instanceof Record)){
              messages.push(`Component "${id}$${record.space}" is not a Record class as expected in expression\n`
                + `${record.id}$${record.space} [${key}]= ${value.expr};`);
            }
          });
        });
      });
    if(messages.length>0){
      throw new Error('References error in expressions:\n' + messages.map((m, i) => `(${i}) `+ m).join('\n\n'));
    }
   
    return _model_;
  }
  getSBMLCode(){
    return nunjucks.render(
      'sbml-export/template.xml.njk',
      this
    );
  }
  toQ(){
    let res = super.toQ();
    if(this.model) res.model = this.model;
    if(this.skipMathChecking) res.skipMathChecking = this.skipMathChecking;

    return res;
  }
}

Container.prototype.classes.SBMLExport = SBMLExport;

module.exports = { SBMLExport };
