/* global describe, it*/
const { Model } = require('../../src/core/model');
const { SchemaValidationError } = require('../../src/validation-error');
const should = require('chai').should();

describe('Unit test for Model.', () => {
  it('Create minimal', () => {
    let simple = new Model({id: 'm1'});
    simple.should.has.property('id', 'm1');
    simple.should.not.has.property('space');
  });

  it('Merge with empty.', () => {
    let simple = (new Model({id: 'm1', space: 'one'})).merge({});
    simple.should.has.property('id', 'm1');
    simple.should.not.has.property('space');
  });

  it('Method property and toQ().', () => {
    let simple = (new Model({id: 'm1', space: 'one'})).merge({
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
    simple.toQ().should.be.deep.equal({
      class: 'Model',
      id: 'm1',
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
    should.Throw(() => {
      (new Model({id: 'm1'})).merge({
        method: {
          timeRange: [1,2,3]
        }
      });
    }, SchemaValidationError);
    should.Throw(() => {
      (new Model({id: 'm1'})).merge({
        method: {
          timeStep: -1
        }
      });
    }, SchemaValidationError);
    should.Throw(() => {
      (new Model({id: 'm1'})).merge({
        method: {
          solver: 'xxx'
        }
      });
    }, SchemaValidationError);
    should.Throw(() => {
      (new Model({id: 'm1'})).merge({
        method: {
          abstol: '1'
        }
      });
    }, SchemaValidationError);
  });
});
