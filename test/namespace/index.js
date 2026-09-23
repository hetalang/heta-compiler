/* global describe, it */
const { expect } = require('chai');
const { Namespace } = require('../../src/namespace');
const { Record } = require('../../src/core/record');
const { Compartment } = require('../../src/core/compartment');
const { Species } = require('../../src/core/species');

describe('Namespace sort testing.', () => {
  let x;
  it('Create empty and push four Records.', () => {
    x = new Namespace('one');
    let rec1 = (new Record).merge({
      assignments: {
        ode_: 1
      }
    });
    rec1._id = 'p1';
    rec1.namespace = x;
    x.set(rec1._id, rec1);
    let rec2 = (new Record).merge({
      assignments: {
        ode_: 'p1'
      }
    });
    rec2._id = 'p2';
    rec2.namespace = x;
    x.set(rec2._id, rec2);
    let rec3 = (new Record).merge({
      assignments: {
        ode_: 'p1*p4'
      }
    });
    rec3._id = 'p3';
    rec3.namespace = x;
    x.set(rec3._id, rec3);
    let rec4 = (new Record).merge({
      assignments: {
        ode_: 'p1*p2'
      }
    });
    rec4._id = 'p4';
    rec4.namespace = x;
    x.set(rec4._id, rec4);
    expect(x).to.be.lengthOf(4);
  });

  it('sortExpressionsByContext for "ode_"', () => {
    let res = x.sortExpressionsByContext('ode_');
    expect(res).to.be.instanceOf(Array);
    let sequence = res.map((x) => x.id);
    expect(sequence).to.be.deep.equal(['p1', 'p2', 'p4', 'p3']);
  });

  it('cycle in "ode_"', () => {
    let cycle = new Namespace('one');
    let rec1 = (new Record).merge({
      assignments: {
        ode_: 'p2'
      }
    });
    rec1._id = 'p1';
    rec1.namespace = cycle;
    cycle.set(rec1._id, rec1);
    let rec2 = (new Record).merge({
      assignments: {
        ode_: 'p1'
      }
    });
    rec2._id = 'p2';
    rec2.namespace = cycle;
    cycle.set(rec2._id, rec2);
    expect(() => {
      cycle.sortExpressionsByContext('ode_');
    }).to.throw(Error); // ExportError?
  });

  it('cycle in "ode_" 2', () => {
    let cycle = new Namespace('one');
    let rec1 = (new Record).merge({
      assignments: {
        ode_: '2*p1'
      }
    });
    rec1._id = 'p1';
    rec1.namespace = cycle;
    cycle.set(rec1._id, rec1);
    expect(() => {
      cycle.sortExpressionsByContext('ode_');
    }).to.throw(Error); // ExportError?
  });
  
  it('cycle in "start_"', () => {
    let cycle = new Namespace('one');
    let rec1 = (new Record).merge({
      assignments: {
        start_: 'p2'
      }
    });
    rec1._id = 'p1';
    rec1.namespace = cycle;
    cycle.set(rec1._id, rec1);
    let rec2 = (new Record).merge({
      assignments: {
        start_: 'p1'
      }
    });
    rec2._id = 'p2';
    rec2.namespace = cycle;
    cycle.set(rec2._id, rec2);
    expect(() => {
      cycle.sortExpressionsByContext('start_');
    }).to.throw(Error); // ExportError?
  });

  it('shows an implicit compartment dependency in start and ODE cycles', () => {
    let cycle = new Namespace('one');
    let compartment = (new Compartment).merge({
      assignments: {
        ode_: 'species'
      }
    });
    compartment._id = 'compartment';
    compartment.namespace = cycle;
    cycle.set(compartment._id, compartment);
    let species = (new Species).merge({
      compartment: 'compartment',
      assignments: {
        start_: 1
      }
    });
    species._id = 'species';
    species.namespace = cycle;
    cycle.set(species._id, species);

    expect(() => {
      cycle.sortExpressionsByContext('start_', true);
    }).to.throw(Error)
      .with.property('message')
      .that.includes('species (compartment) ~ 1;');

    expect(() => {
      cycle.sortExpressionsByContext('ode_', true);
    }).to.throw(Error)
      .with.property('message')
      .that.includes('species (compartment);');
  });
});
