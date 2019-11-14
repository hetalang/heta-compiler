/* global describe, it */
const { expect } = require('chai');
const { Record } = require('../../src/core/record');
const XArray = require('../../src/x-array');
const { BindingError } = require('../../src/heta-error');

describe('XArray testing.', () => {
  let x;
  it('Create empty and push four Records.', () => {
    x = new XArray();
    let rec1 = (new Record).merge({
      assignments: {
        ode_: 1
      }
    });
    rec1._id = 'p1';
    rec1._space = 'one';
    x.push(rec1);
    let rec2 = (new Record).merge({
      assignments: {
        ode_: 'p1'
      }
    });
    rec2._id = 'p2';
    rec2._space = 'one';
    x.push(rec2);
    let rec3 = (new Record).merge({
      assignments: {
        ode_: 'p1*p4'
      }
    });
    rec3._id = 'p3';
    rec3._space = 'one';
    x.push(rec3);
    let rec4 = (new Record).merge({
      assignments: {
        ode_: 'p1*p2'
      }
    });
    rec4._id = 'p4';
    rec4._space = 'one';
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
    let rec1 = (new Record).merge({
      assignments: {
        ode_: 'p2'
      }
    });
    rec1._id = 'p1';
    rec1._space = 'one';
    cycle.push(rec1);
    let rec2 = (new Record).merge({
      assignments: {
        ode_: 'p1'
      }
    });
    rec2._id = 'p2';
    rec2._space = 'one';
    cycle.push(rec2);
    expect(() => {
      cycle.sortExpressionsByContext('ode_');
    }).to.throw(Error); // ExportError?
  });
});
