/* global describe, it */
const { expect } = require('chai');
const { Record } = require('../../src/core/record');
const XArray = require('../../src/x-array');

describe('XArray testing.', () => {
  let x;
  it('Create empty and push four Records.', () => {
    x = new XArray();
    let rec1 = new Record({id: 'p1', space: 'one'}).merge({
      assignments: {
        ode_: 1
      }
    });
    x.push(rec1);
    let rec2 = new Record({id: 'p2', space: 'one'}).merge({
      assignments: {
        ode_: 'p1'
      }
    });
    x.push(rec2);
    let rec3 = new Record({id: 'p3', space: 'one'}).merge({
      assignments: {
        ode_: 'p1*p4'
      }
    });
    x.push(rec3);
    let rec4 = new Record({id: 'p4', space: 'one'}).merge({
      assignments: {
        ode_: 'p1*p2'
      }
    });
    x.push(rec4);
    expect(x).to.be.lengthOf(4);
  });
  it('getById with result.', () => {
    let res = x.getById('p2');
    expect(res).to.be.instanceOf(Record);
  });
  it('getById with no result.', () => {
    let res = x.getById('p0');
    expect(res).to.be.undefined;
  });
  it('sortExpressionsByContext for "ode_"', () => {
    let res = x.sortExpressionsByContext('ode_');
    expect(res).to.be.instanceOf(XArray);
    let sequence = res.map((x) => x.id);
    expect(sequence).to.be.deep.equal(['p1', 'p2', 'p4', 'p3']);
  });
  it('cycle in "ode_"', () => {
    let cycle = new XArray();
    let rec1 = new Record({id: 'p1', space: 'one'}).merge({
      assignments: {
        ode_: 'p2'
      }
    });
    cycle.push(rec1);
    let rec2 = new Record({id: 'p2', space: 'one'}).merge({
      assignments: {
        ode_: 'p1'
      }
    });
    cycle.push(rec2);
    expect(() => {
      cycle.sortExpressionsByContext('ode_');
    }).to.throw();
  });
});
