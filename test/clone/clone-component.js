/*global  describe, it */
const { expect } = require('chai');
const { Record } = require('../../src/core/record');
const { Species } = require('../../src/core/species');

describe('Clone components', () => {
  it('clone @Record without rename', () => {
    let record = new Record().merge({
      id: 'test_id',
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

    expect(clonedComponent).to.not.have.property('boundary');
    expect(clonedComponent).to.not.have.property('ss');
    expect(clonedComponent).to.not.have.property('output');
  });

  it('clone @Record with rename', () => {
    let record = new Species().merge({
      id: 'test_id',
      compartment: 'comp1',
      title: 'test title',
      aux: {x: 1.1, y: 'qwerty', z: {}},
      assignments: {start_: 'x*y', ode_: '12.3', evt1: 'x/y'},
      units: 'kg/mole*min'
    });

    let clonedComponent = record.clone();
    clonedComponent.updateReferences({rename: {
      comp1: 'comp2',
      x: 'x2',
      y: 'y2'
    }});

    // check record
    expect(record).to.have.property('compartment', 'comp1');
    expect(record).to.have.property('title', 'test title');
    expect(record).to.have.deep.property('aux', {x: 1.1, y: 'qwerty', z: {}});
    expect(record.assignments.start_.toString()).to.be.equal('x * y');
    expect(record.assignments.ode_.toString()).to.be.equal('12.3');
    expect(record.assignments.evt1.toString()).to.be.equal('x / y');
    expect(record).to.have.property('units', 'kg/mole*min');

    // check clone
    expect(clonedComponent).to.have.property('compartment', 'comp2');
    expect(clonedComponent).to.have.property('title', 'test title');
    expect(clonedComponent).to.have.deep.property('aux', {x: 1.1, y: 'qwerty', z: {}});
    expect(clonedComponent.assignments.start_.toString()).to.be.equal('x2 * y2');
    expect(clonedComponent.assignments.ode_.toString()).to.be.equal('12.3');
    expect(clonedComponent.assignments.evt1.toString()).to.be.equal('x2 / y2');
    expect(clonedComponent).to.have.property('units', 'kg/mole*min');
  });  

  it('clone @Record with boundary/ss/output', () => {
    let record = new Record().merge({
      id: 'test_id',
      assignments: {start_: '1'},
      boundary: true,
      ss: true,
      output: true
    });

    let clonedComponent = record.clone();

    expect(clonedComponent).to.have.property('boundary', true);
    expect(clonedComponent).to.have.property('ss', true);
    expect(clonedComponent).to.have.property('output', true);
  });
});
