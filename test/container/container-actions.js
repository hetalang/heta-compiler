/* global describe, it */
const Container = require('../../src/container');
const { expect } = require('chai');

describe('Unit tests for Container load', () => {
  var c;

  it('Create container', () => {
    c = new Container();
    c.setNS({space: 'default__'});
    c.setNS({space: 'one'});
    expect(c.hetaErrors()).to.be.lengthOf(0);
  });

  it('Insert Record k1', () => {
    let simple = c.insert({ // insert new
      class: 'Record',
      id: 'k1',
      space: 'default__',
      title: 'k1 title',
      assignments: {
        start_: 1e-3
      }
    });
    expect(c.logger.hasErrors).to.be.false;
    expect(simple).to.have.property('index', 'default__::k1');
    c.logger.resetErrors();
  });

  it('Insert Record k2 with space', () => {
    let simple = c.insert({ // insert new
      class: 'Record',
      id: 'k2',
      space: 'one',
      title: 'k2 title',
      assignments: {
        start: 1.2
      }
    });
    expect(c.logger.hasErrors).to.be.false;
    expect(simple).to.have.property('index', 'one::k2');
    c.logger.resetErrors();
  });

  it('Update Record k1', () => {
    let simple = c.update({ // update old
      id: 'k1',
      space: 'default__',
      assignments: {
        start_: 1
      },
      units: '1/h'
    });
    expect(c.logger.hasErrors).to.be.false;
    expect(simple).to.have.nested.property('units', '1/h');
    expect(simple).to.have.property('title', 'k1 title');
    c.logger.resetErrors();
  });

  it('Insert Record k2 with replace', () => {
    let simple = c.insert({ // insert new instead of old
      class: 'Record',
      id: 'k2',
      space: 'one',
      assignments: {
        start_: 1.4
      }
    });
    expect(c.logger.hasErrors).to.be.false;
    expect(simple).to.have.nested.property('assignments.start_');
    expect(simple.assignments.start_.toString()).to.be.equal('1.4');
    expect(simple).not.to.have.property('title');
    c.logger.resetErrors();
  });

  it('Throws wrong insert.', () => {
    c.insert({});
    expect(c.logger.hasErrors).to.be.true;
    c.logger.resetErrors();

    c.insert({ class: 'Record' });
    expect(c.logger.hasErrors).to.be.true;
    c.logger.resetErrors();

    c.insert({ id: 'k0' });
    expect(c.logger.hasErrors).to.be.true;
    c.logger.resetErrors();
  });

  it('Throws wrong update.', () => {
    c.update({});
    expect(c.logger.hasErrors).to.be.true;
    c.logger.resetErrors();

    c.update({id: 'k0'});
    expect(c.logger.hasErrors).to.be.true;
    c.logger.resetErrors();

    c.update({id: 'k1', class: 'Species'});
    expect(c.logger.hasErrors).to.be.true;
    c.logger.resetErrors();
  });

  it('upsert acts like insert if class presented.', () => {
    c.defaultLogs.length = 0;
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
    expect(c.logger.hasErrors).to.be.false;
    expect(simple).to.have.property('title', 'k3 updated title');
    expect(simple).not.to.have.property('notes');
    c.logger.resetErrors();
  });

  it('upsert acts like update if no class presented.', () => {
    c.defaultLogs.length = 0;
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
    expect(c.logger.hasErrors).to.be.false;
    expect(simple).to.have.property('title', 'k4 updated title');
    expect(simple).to.have.property('notes', 'k4 notes');
    c.logger.resetErrors();
  });

  it('Throws wrong upsert', () => {
    c.upsert({});
    expect(c.logger.hasErrors).to.be.true;
    c.logger.resetErrors();

    c.upsert({class: 'Record'});
    expect(c.logger.hasErrors).to.be.true;
    c.logger.resetErrors();
    
    c.upsert({id: 'k10'});
    expect(c.logger.hasErrors).to.be.true;
    c.logger.resetErrors();
  });

  it('delete existed element.', () => {
    c.insert({
      class: 'Record',
      id: 'k5',
      space: 'default__',
      title: 'k5 title',
    });
    let res = c.delete({
      id: 'k5',
      space: 'default__',
    });
    expect(c.logger.hasErrors).to.be.false;
    expect(res).to.be.a('boolean').and.true;
    c.logger.resetErrors();
  });

  it('Throws wrong delete', () => {
    // empty
    c.delete({});
    expect(c.logger.hasErrors).to.be.true;
    c.logger.resetErrors();

    // class is not allowed
    c.delete({id: 'k3', space: 'default__', class: 'Record'});
    expect(c.logger.hasErrors).to.be.true;
    c.logger.resetErrors();
    
    // deleting not existed element is not allowed
    c.delete({id: 'k10', space: 'default__'});
    expect(c.logger.hasErrors).to.be.true;
    c.logger.resetErrors();
  });

  it('Select existed element', () => {
    let res = c.select({id: 'k2', space: 'one'});
    expect(c.logger.hasErrors).to.be.false;
    expect(res).to.have.property('className', 'Record');
    c.logger.resetErrors();
  });

  it('Select non existed element', () => {
    let res = c.select({id: 'k99', space: 'one'});
    expect(c.logger.hasErrors).to.be.false;
    expect(res).to.be.undefined;
    c.logger.resetErrors();
  });

  it('Select with empty id throws.', () => {
    c.select({});
    expect(c.logger.hasErrors).to.be.true;
    c.logger.resetErrors();
  });

  it('Select from not existed namespace throws', () => {
    c.select({id: 'k1', space: 'error'});
    expect(c.logger.hasErrors).to.be.true;
    c.logger.resetErrors();
  });
});

describe('Test deleting NS', () => {
  let c = new Container();

  it('Create NS', () => {
    c.setNS({space: 'one'});
    c.setNS({space: 'two'});

    expect(c.namespaceStorage.size).to.equal(3);
  });

  it('Delete NS one', () => {
    c.deleteNS({space: 'one'});

    expect(c.namespaceStorage.size).to.equal(2);
  });

  it('Delete not existed NS', () => {
    c.deleteNS({space: 'one'});
    c.deleteNS({space: 'three'});

    expect(c.logger.hasErrors).to.be.true;
    expect(c.namespaceStorage.size).to.equal(2);
  });

});
