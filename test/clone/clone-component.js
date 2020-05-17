/*global  describe, it */
const { expect } = require('chai');
const { Record } = require('../../src/core/record');

describe('Clone components', () => {
  it('clone record', () => {
    let record = new Record().merge({
      title: 'test title',
      notes: '**test** notes',
      tags: ['a', 'b', 'c'],
      aux: {x: 1.1, y: 'qwerty', z: {}},
      assignments: {start_: 'x*y', ode_: '12.3', evt1: 'x/y'},
      units: 'kg/mole*min'
    });

    let clonedComponent = record.clone();

    expect(clonedComponent).to.have.property('title', 'test title');
    expect(clonedComponent).to.have.property('notes', '**test** notes');
    expect(clonedComponent).to.have.deep.property('tags', ['a', 'b', 'c']);
    expect(clonedComponent).to.have.deep.property('aux', {x: 1.1, y: 'qwerty', z: {}});

    expect(clonedComponent.assignments.start_.toString()).to.be.equal('x * y');
    expect(clonedComponent.assignments.ode_.toString()).to.be.equal('12.3');
    expect(clonedComponent.assignments.evt1.toString()).to.be.equal('x / y');

    expect(clonedComponent).to.have.property('units', 'kg/mole*min');
  });
});
