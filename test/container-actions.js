/* global describe, it */
const Container = require('../src/container');
const should = require('chai').should();
const { _Simple } = require('../src/core/_simple');
const { ContainerError } = require('../src/validation-error');

describe('Unit tests for Container load', () => {
  var c = new Container();

  it('Insert Record k1', () => {
    let simple = c.insert({ // insert new
      class: 'Record',
      id: 'k1',
      space: 'default__',
      title: 'k1 title',
      assignments: {
        start_: {size: {num: 1e-3}}
      }
    });
    c.should.be.lengthOf(1);
    simple.should.have.property('index', 'default__.k1');
  });

  it('Insert Record k2 with space', () => {
    let simple = c.insert({ // insert new
      class: 'Record',
      id: 'k2',
      space: 'one',
      title: 'k2 title',
      assignments: {
        start: {size: {num: 1.2}}
      }
    });
    c.should.be.lengthOf(2);
    simple.should.have.property('index', 'one.k2');
  });

  it('Update Record k1', () => {
    let simple = c.update({ // update old
      id: 'k1',
      space: 'default__',
      assignments: {
        start_: {size: {num: 1}}
      },
      units: '1/h'
    });
    c.should.be.lengthOf(2);
    simple.should.have.nested.property('units', '1/h');
    simple.should.have.property('title', 'k1 title');
  });

  it('Insert Record k2 with replace', () => {
    let simple = c.insert({ // insert new instead of old
      class: 'Record',
      id: 'k2',
      space: 'one',
      assignments: {
        start_: {size: {num: 1.4}}
      }
    });
    c.should.be.lengthOf(2);
    simple.should.have.nested.property('assignments.start_.size.num', 1.4);
    simple.should.not.have.property('title');
  });

  it('Throws wrong insert.', () => {
    should.Throw(() => {
      c.insert({}); // empty
    }, ContainerError);
    should.Throw(() => {
      c.insert({ class: 'Record' }); // no id
    }, ContainerError);
    should.Throw(() => {
      c.insert({ id: 'k0' }); // no class
    }, Error);
  });

  it('Throws wrong update.', () => {
    should.Throw(() => {
      c.update({}); // empty
    }, ContainerError);
    should.Throw(() => {
      c.update({id: 'k0'}); // id is not exists
    }, Error);
    should.Throw(() => {
      c.update({id: 'k1', class: 'Species'}); // class property is not allowed
    }, Error);
    c.should.be.lengthOf(2);
  });

  it('upsert acts like insert if class presented.', () => {
    c.insert({
      class: 'Record',
      id: 'k3',
      space: 'default__',
      title: 'k3 title',
      notes: 'k3 notes'
    });
    let simple = c.upsert({
      class: 'Record',
      space: 'default__',
      id: 'k3',
      title: 'k3 updated title'
    });
    simple.should.have.property('title', 'k3 updated title');
    simple.should.not.have.property('notes');
    c.should.be.lengthOf(3);
  });

  it('upsert acts like update if no class presented.', () => {
    c.insert({
      class: 'Record',
      id: 'k4',
      space: 'default__',
      title: 'k4 title',
      notes: 'k4 notes'
    });
    let simple = c.upsert({
      id: 'k4',
      space: 'default__',
      title: 'k4 updated title'
    });
    c.should.be.lengthOf(4);
    simple.should.have.property('title', 'k4 updated title');
    simple.should.have.property('notes', 'k4 notes');
  });

  it('Throws wrond upsert', () => {
    should.Throw(() => {
      c.upsert({}); // empty
    }, ContainerError);
    should.Throw(() => {
      c.upsert({class: 'Record'}); // no id
    }, ContainerError);
    should.Throw(() => {
      c.upsert({id: 'k10'}); // no class and unknown id
    }, Error);
  });

  it('delete existed element.', () => {
    c.insert({
      class: 'Record',
      id: 'k5',
      space: 'default__',
      title: 'k5 title',
    });
    c.should.be.lengthOf(5);
    let res = c.delete({
      id: 'k5',
      space: 'default__',
    });
    res.should.be.a('boolean').and.true;
    c.should.be.lengthOf(4);
  });

  it('Throws wrong delete', () => {
    should.Throw(() => {
      c.delete({}); // empty
    }, ContainerError);
    should.Throw(() => {
      c.delete({id: 'k3', space: 'default__', class: 'Record'}); // class is not allowed
    }, Error);
    should.Throw(() => {
      c.delete({id: 'k10', space: 'default__'}); // deleting not existed element is not allowed
    }, Error);
  });

  it('DELETE LATER', () => {
    c.should.be.lengthOf(4);
    // console.log(c.storage);
  });
});
