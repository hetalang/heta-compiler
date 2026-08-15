/* global describe, it */
const { Container } = require('../../src');
const { expect } = require('chai');

describe('Variadic core add()', () => {
  it('accepts zero through three arguments', () => {
    const container = new Container();
    container.loadMany([
      { id: 'add0', class: 'Record', assignments: { start_: 'add()' } },
      { id: 'add1', class: 'Record', assignments: { start_: 'add(1)' } },
      { id: 'add2', class: 'Record', assignments: { start_: 'add(1, 2)' } },
      { id: 'add3', class: 'Record', assignments: { start_: 'add(1, 2, 3)' } }
    ]);
    container.knitMany();

    expect(container.hetaErrors()).to.have.lengthOf(0);
    expect(container.functionDefStorage.get('add').arguments).to.deep.equal([]);

    const add0 = container.namespaceStorage.get('nameless').get('add0');
    expect(add0.assignments.start_.calcUnit(add0).toString()).to.equal('dimensionless');
  });
});

describe('Variadic core multiply()', () => {
  it('accepts zero through three arguments', () => {
    const container = new Container();
    container.loadMany([
      { id: 'multiply0', class: 'Record', assignments: { start_: 'multiply()' } },
      { id: 'multiply1', class: 'Record', assignments: { start_: 'multiply(1)' } },
      { id: 'multiply2', class: 'Record', assignments: { start_: 'multiply(1, 2)' } },
      { id: 'multiply3', class: 'Record', assignments: { start_: 'multiply(1, 2, 3)' } }
    ]);
    container.knitMany();

    expect(container.hetaErrors()).to.have.lengthOf(0);
    expect(container.functionDefStorage.get('multiply').arguments).to.deep.equal([]);

    const multiply0 = container.namespaceStorage.get('nameless').get('multiply0');
    expect(multiply0.assignments.start_.calcUnit(multiply0).toString()).to.equal('dimensionless');
  });
});
