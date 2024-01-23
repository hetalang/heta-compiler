/* global describe, it*/
const { expect } = require('chai');
const { Container } = require('../../src');

let qArr1 = [
  // #defineFunction
  { id: 'pow7', action: 'defineFunction', arguments: ['x'], math: 'pow(x, 7)' },
  { id: 'f3', action: 'defineFunction', arguments: ['x1', 'x2', 'x3'], math: 'sqrt(x1^2 + x2^2 + x3^2)' },
  { id: 'f4', action: 'defineFunction', arguments: [], math: '15*2' },
  { id: 'f5', action: 'defineFunction', arguments: ['x', 'y'], math: 'f4(x)^2' },
  // @Record
  { id: 'rec1', class: 'Record', assignments: {ode_: '1.1 * pow7(2) * 2.2'} },
  { id: 'rec2', class: 'Record', assignments: {ode_: '1.1 * sin(2) * 2.2'} }
];
let qArr2 = [
  { id: 'f7', action: 'defineFunction', arguments: ['x', 'y'], math: 'sss(x)^2' },
];
describe('Proper binding of functionDefinition', () => {
  var c1;
  it('Load proper elements', () => {
    c1 = new Container();
    c1.loadMany(qArr1);
    c1.knitMany();

    expect(c1.defaultLogs).lengthOf(1);
    c1.defaultLogs.length = 0;
  });
  
  it('ref to wrong function', () => {
    c1.load({
      id: 'f7', action: 'defineFunction', arguments: ['x', 'y'], math: 'sss(x)^2'
    });
    c1.knitMany();

    expect(c1.defaultLogs).lengthOf(1);
    c1.defaultLogs.length = 0;
  });

  it('lost argument inside math', () => {
    c1.load({
      id: 'f12', action: 'defineFunction', arguments: ['x', 'y'], math: 'f5()*pow(x,y)'
    });
    c1.knitMany();

    expect(c1.defaultLogs).lengthOf(2);
    c1.defaultLogs.length = 0;
  });

  it('lost argument inside ode_', () => {
    c1.load({
      id: 'rec3', class: 'Record', assignments: { ode_: 'f5()*pow(rec1, rec2)'}
    });
    c1.knitMany();

    expect(c1.defaultLogs).lengthOf(3);
    c1.defaultLogs.length = 0;
  });
  
  it('circular function', () => {
    c1.load({
      id: 'f6', action: 'defineFunction', arguments: ['x'], math: 'f6(x)^2'
    });
    c1.checkCircFunctionDef();
    
    expect(c1.defaultLogs).lengthOf(1);
    c1.defaultLogs.length = 0;
  });
  
  //it('Debugging', () => console.log(c1.hetaErrors()));
});