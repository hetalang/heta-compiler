/* global describe, it */
const Container = require('../src/container');
const should = require('chai').should();

describe('Unit tests for Container import', () => {
  var c = new Container();

  it('Insert Quantity k1', () => {
    let simple = c.insert({ // insert new
      class: 'Quantity',
      id: 'k1',
      title: 'k1 title',
      variable: {
        kind: 'static',
        size: {num: 1e-3}
      }
    });
    c.storage.should.be.lengthOf(1);
    simple.should.have.property('index', 'default__.k1');
  });

  it('Insert Quantity k2 with space', () => {
    let simple = c.insert({ // insert new
      class: 'Quantity',
      id: 'k2',
      space: 'one',
      title: 'k2 title',
      variable: {
        kind: 'static',
        size: {num: 1.2}
      }
    });
    c.storage.should.be.lengthOf(2);
    simple.should.have.property('index', 'one.k2');
  });

  it('Update Quantity k1', () => {
    let simple = c.update({ // update old
      id: 'k1',
      variable: {
        kind: 'static',
        size: {num: 1},
        units: '1/h'
      }
    });
    c.storage.should.be.lengthOf(2);
    simple.should.have.nested.property('variable.units', '1/h');
    simple.should.have.property('title', 'k1 title');
  });

  it('Insert Quantity k2 with replace', () => {
    let simple = c.insert({ // insert new instead of old
      class: 'Quantity',
      id: 'k2',
      space: 'one',
      variable: {
        kind: 'static',
        size: {num: 1.4}
      }
    });
    c.storage.should.be.lengthOf(2);
    simple.should.have.nested.property('variable.size.num', 1.4);
    simple.should.not.have.property('title');
  });

  it('Throws wrong insert.', () => {
    should.Throw(() => {
      c.insert({}); // empty
    });
    should.Throw(() => {
      c.insert({ class: 'Quantity' }); // no id
    });
    should.Throw(() => {
      c.insert({ id: 'k0' }); // no class
    });
  });

  it('Throws wrong update.', () => {
    should.Throw(() => {
      c.update({}); // empty
    });
    should.Throw(() => {
      c.update({id: 'k0'}); // id is not exists
    });
    should.Throw(() => {
      c.update({id: 'k1', class: 'Species'}); // class property is not allowed
    });
  });

  it('DELETE LATER', () => {
    c.storage.should.be.lengthOf(2);
    // console.log(c.storage);
  });
});
