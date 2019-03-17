/* global describe, it */
const Container = require('../src/container');
require('chai').should();

describe('Unit tests for Container import', () => {
  var c = new Container();

  it('Insert Quantity k1', () => {
    c.insert({ // insert new
      class: 'Quantity',
      id: 'k1',
      variable: {
        kind: 'static',
        size: {num: 1e-3}
      }
    });
  });

  it('Insert Quantity k2', () => {
    c.insert({ // insert new
      class: 'Quantity',
      id: 'k2',
      title: 'k2 title',
      variable: {
        kind: 'static',
        size: {num: 1.2}
      }
    });
  });

  it('Update Quantity k1', () => {
    c.update({ // update old
      id: 'k1',
      variable: {
        kind: 'static',
        size: {num: 1},
        units: '1/h'
      }
    });
  });

  it('Insert Quantity k2', () => {
    c.insert({ // insert new instead of old
      class: 'Quantity',
      id: 'k2',
      variable: {
        kind: 'static',
        size: {num: 1.2}
      }
    });
  });

  it('DELETE LATER', () => {
    c.storage.should.be.lengthOf(2);
    // console.log(c.storage);
  });
});
