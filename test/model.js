/* global describe, it*/
const { Model } = require('../src/core/model');
const should = require('should');

describe('Unit test for Model.', () => {
  it('Merge with empty', () => {
    let simple = (new Model).merge({});
    simple.should.not.has.property('id');
    simple.should.not.has.property('space');
  });

  it('Merge with empty.', () => {
    let simple = (new Model).merge({});
    simple.should.not.has.property('id');
    simple.should.not.has.property('space');
  });

  it('Method property and toQ().', () => {
    let simple = (new Model).merge({
      method: {
        timeRange: [0, 120],
        timeStep: 2,
        solver: 'lsoda',
        abstol: 1e-3,
        reltol: 1e-3,
        dt: 0.1,
        dtmin: 1e-6,
        dtmax: 1
      }
    });
    simple.should.has.property('method');
    simple.toQ().should.be.deepEqual({
      class: 'Model',
      aux: {},
      tags: [],
      method: {
        timeRange: [0, 120],
        timeStep: 2,
        solver: 'lsoda',
        abstol: 1e-3,
        reltol: 1e-3,
        dt: 0.1,
        dtmin: 1e-6,
        dtmax: 1
      }
    });
  });

  it('Wrong input.', () => {
    should.throws(() => {
      (new Model).merge({
        method: {
          timeRange: [1,2,3]
        }
      });
    });
    should.throws(() => {
      (new Model).merge({
        method: {
          timeStep: -1
        }
      });
    });
    should.throws(() => {
      (new Model).merge({
        method: {
          solver: 'xxx'
        }
      });
    });
    should.throws(() => {
      (new Model).merge({
        method: {
          abstol: '1'
        }
      });
    });
  });
});
