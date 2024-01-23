/* global describe, it */
const Container = require('../../src/container');
const { expect } = require('chai');

describe('Unit test for FunctionDef', () => {
  const p = new Container();
  it('Error: Empty FunctionDef', () => {
    let simple = new p.classes.FunctionDef();
    
    expect(simple._container.logger).property('hasErrors').true;
    simple._container.logger.resetErrors();
  });

  it('Correct FunctionDef', () => {
    let simple = new p.classes.FunctionDef({
      id: 'ud1',
      arguments: ['x1', 'x2'],
      math: 'sqrt(x1^2 + x2^2)'
    });

    expect(simple._container.logger).to.has.property('hasErrors', false);
    expect(simple.toQ()).to.be.deep.equal({
      action: 'defineFunction',
      id: 'ud1',
      arguments: ['x1', 'x2'],
      math: 'sqrt(x1 ^ 2 + x2 ^ 2)'
    });
    
    expect(simple._container.logger).property('hasErrors').false;
    simple._container.logger.resetErrors();
  });

  it('defineFunction without math is ok.', () => {
    let simple = new p.classes.FunctionDef({
      id: 'ud1',
      arguments: ['x']
    });
    expect(simple._container.logger).to.has.property('hasErrors', false);
  });

  it('Error: wrong input 1 (bad arguments).', () => {
    let simple1 = new p.classes.FunctionDef({
      id: 'u1',
      arguments: 'xxx'
    });
    
    expect(simple1._container.logger).to.has.property('hasErrors').true;
    simple1._container.logger.resetErrors();
  });

  it('Error: wrong input 2 (no id).', () => {
    let simple2 = new p.classes.FunctionDef({
      arguments: ['xxx']
    });
    expect(simple2._container.logger).to.has.property('hasErrors', true);
    simple2._container.logger.resetErrors();
  });

  it('Error: error input 3 (math without arguments).', () => {
    let simple3 = new p.classes.FunctionDef({
      id: 'u3',
      math: '1*1'
    });
    expect(simple3._container.logger).to.has.property('hasErrors', true);
    simple3._container.logger.resetErrors();
  });
});


let input0 = [
  {
    action: 'defineFunction',
    id: 'fun1',
    arguments: []
  },
  {
    action: 'defineFunction',
    id: 'fun2',
    arguments: [],
    math: '1'
  },
  {
    action: 'defineFunction',
    id: 'fun3',
    arguments: [],
    math: '1'
  },
  {
    action: 'defineFunction',
    id: 'fun4',
    arguments: ['x1'],
    math: 'x1*x1*5'
  }
];

describe('Testing loading FunctionDef', () => {
  const p = new Container();
  let counter = p.functionDefStorage.size;

  it('Load FunctionDef', () => {
    p.loadMany(input0);
    expect(p.functionDefStorage.size - counter).to.be.eq(4);
    //console.log([...p.functionDefStorage])
    p.logger.resetErrors();
  });
});

describe('Testing arguments vs math', () => {

  const p = new Container();

  it('3 vs 3', () => {
    let simple = new p.classes.FunctionDef({
      id: 'ud1',
      arguments: ['x1', 'x2', 'x3'],
      math: 'sqrt(x1^2 + x2^2 + x3^2 + x3^2)'
    });
    
    expect(simple._container.logger).property('hasErrors').false;
    simple._container.logger.resetErrors();
  });

  it('3 vs 2', () => {
    let simple = new p.classes.FunctionDef({
      id: 'ud1',
      arguments: ['x1', 'x2', 'x3'],
      math: 'sqrt(x1^2 + x2^2)'
    });
    
    expect(simple._container.logger).property('hasErrors').false;
    simple._container.logger.resetErrors();
  });

  it('Error: 2 vs 3', () => {
    let simple = new p.classes.FunctionDef({
      id: 'ud1',
      arguments: ['x1', 'x2'],
      math: 'sqrt(x1^2 + x2^2 + x3^2 + x3^2)'
    });
    
    expect(simple._container.logger).property('hasErrors').true;
    simple._container.logger.resetErrors();
  });

  
  it('Error: 3 vs 3 but wrong', () => {
    let simple = new p.classes.FunctionDef({
      id: 'ud1',
      arguments: ['x1', 'x2', 'x666'],
      math: 'sqrt(x1^2 + x2^2 + x3^2 + x3^2)'
    });
    
    expect(simple._container.logger).property('hasErrors').true;
    simple._container.logger.resetErrors();
  });
});