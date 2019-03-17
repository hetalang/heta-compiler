/* global describe, it */
const Container = require('../src/container');
const should = require('chai').should();
const { _Simple } = require('../src/core/_simple');

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
    c.storage.should.be.lengthOf(2);
  });

  it('upsert acts like insert if class presented.', () => {
    c.insert({
      class: 'Quantity',
      id: 'k3',
      title: 'k3 title',
      notes: 'k3 notes'
    });
    let simple = c.upsert({
      class: 'Quantity',
      id: 'k3',
      title: 'k3 updated title'
    });
    simple.should.have.property('title', 'k3 updated title');
    simple.should.not.have.property('notes');
    c.storage.should.be.lengthOf(3);
  });

  it('upsert acts like update if no class presented.', () => {
    c.insert({
      class: 'Quantity',
      id: 'k4',
      title: 'k4 title',
      notes: 'k4 notes'
    });
    let simple = c.upsert({
      id: 'k4',
      title: 'k4 updated title'
    });
    c.storage.should.be.lengthOf(4);
    simple.should.have.property('title', 'k4 updated title');
    simple.should.have.property('notes', 'k4 notes');
  });

  it('Throws wrond upsert', () => {
    should.Throw(() => {
      c.upsert({}); // empty
    });
    should.Throw(() => {
      c.upsert({class: 'Quantity'}); // no id
    });
    should.Throw(() => {
      c.upsert({id: 'k10'}); // no class and unknown id
    });
  });

  it('delete existed element.', () => {
    c.insert({
      class: 'Quantity',
      id: 'k5',
      title: 'k5 title',
    });
    c.storage.should.be.lengthOf(5);
    let simple = c.delete({
      id: 'k5'
    });
    simple.should.be.instanceOf(_Simple);
    simple.should.have.property('title', 'k5 title');
    c.storage.should.be.lengthOf(4);
  });

  it('Throws wrong delete', () => {
    should.Throw(() => {
      c.delete({}); // empty
    });
    should.Throw(() => {
      c.delete({id: 'k3', class: 'Quantity'}); // class is not allowed
    });
    should.Throw(() => {
      c.delete({id: 'k10'}); // deleting not existed element is not allowed
    });
  });

  it('DELETE LATER', () => {
    c.storage.should.be.lengthOf(4);
    // console.log(c.storage);
  });
});
