/* global describe, it */
const Container = require('../../src/container');
const { expect } = require('chai');

describe('Unit tests for Container load', () => {
  var c;

  it('Create container', () => {
    c = new Container();
    c.setNS({space: 'default__'});
    c.setNS({space: 'one'});
    expect(c.logger).to.have.property('hasErrors', false);
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
    expect(c.logger).to.have.property('hasErrors', false);
    expect(c).to.be.lengthOf(1);
    expect(simple).to.have.property('index', 'default__::k1');
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
    expect(c.logger).to.have.property('hasErrors', false);
    expect(c).to.be.lengthOf(2);
    expect(simple).to.have.property('index', 'one::k2');
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
    expect(c.logger).to.have.property('hasErrors', false);
    expect(c).to.be.lengthOf(2);
    expect(simple).to.have.nested.property('units', '1/h');
    expect(simple).to.have.property('title', 'k1 title');
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
    expect(c.logger).to.have.property('hasErrors', false);
    expect(c).to.be.lengthOf(2);
    expect(simple).to.have.nested.property('assignments.start_');
    expect(simple.assignments.start_.toString()).to.be.equal('1.4');
    expect(simple).not.to.have.property('title');
  });

  it('Throws wrong insert.', () => {
    c.logger.reset();
    c.insert({});
    expect(c.logger).to.have.property('hasErrors', true);

    c.logger.reset();
    c.insert({ class: 'Record' });
    expect(c.logger).to.have.property('hasErrors', true);

    c.logger.reset();
    c.insert({ id: 'k0' });
    expect(c.logger).to.have.property('hasErrors', true);
  });

  it('Throws wrong update.', () => {
    c.logger.reset();
    c.update({});
    expect(c.logger).to.have.property('hasErrors', true);

    c.logger.reset();
    c.update({id: 'k0'});
    expect(c.logger).to.have.property('hasErrors', true);

    c.logger.reset();
    c.update({id: 'k1', class: 'Species'});
    expect(c.logger).to.have.property('hasErrors', true);

    expect(c).to.be.lengthOf(2);
  });

  it('upsert acts like insert if class presented.', () => {
    c.logger.reset();
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
    expect(c.logger).to.have.property('hasErrors', false);
    expect(simple).to.have.property('title', 'k3 updated title');
    expect(simple).not.to.have.property('notes');
    expect(c).to.be.lengthOf(3);
  });

  it('upsert acts like update if no class presented.', () => {
    c.logger.reset();
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
    expect(c.logger).to.have.property('hasErrors', false);
    expect(c).to.be.lengthOf(4);
    expect(simple).to.have.property('title', 'k4 updated title');
    expect(simple).to.have.property('notes', 'k4 notes');
  });

  it('Throws wrong upsert', () => {
    c.logger.reset();
    c.upsert({});
    expect(c.logger).to.have.property('hasErrors', true);

    c.logger.reset();
    c.upsert({class: 'Record'});
    expect(c.logger).to.have.property('hasErrors', true);
    
    c.logger.reset();
    c.upsert({id: 'k10'});
    expect(c.logger).to.have.property('hasErrors', true);
  });

  it('delete existed element.', () => {
    c.logger.reset();
    c.insert({
      class: 'Record',
      id: 'k5',
      space: 'default__',
      title: 'k5 title',
    });
    expect(c).to.be.lengthOf(5);
    let res = c.delete({
      id: 'k5',
      space: 'default__',
    });
    expect(c.logger).to.have.property('hasErrors', false);
    expect(res).to.be.a('boolean').and.true;
    expect(c).to.be.lengthOf(4);
  });

  it('Throws wrong delete', () => {
    // empty
    c.logger.reset();
    c.delete({});
    expect(c.logger).to.have.property('hasErrors', true);

    // class is not allowed
    c.logger.reset();
    c.delete({id: 'k3', space: 'default__', class: 'Record'});
    expect(c.logger).to.have.property('hasErrors', true);
    
    // deleting not existed element is not allowed
    c.logger.reset();
    c.delete({id: 'k10', space: 'default__'});
    expect(c.logger).to.have.property('hasErrors', true); 
  });

  it('final length', () => {
    expect(c).to.be.lengthOf(4);
  });

  it('Select existed element', () => {
    c.logger.reset();
    let res = c.select({id: 'k2', space: 'one'});
    expect(c.logger).to.have.property('hasErrors', false); 
    expect(res).to.have.property('className', 'Record');
  });

  it('Select non existed element', () => {
    c.logger.reset();
    let res = c.select({id: 'k99', space: 'one'});
    expect(c.logger).to.have.property('hasErrors', false); 
    expect(res).to.be.undefined;
  });

  it('Select with empty id throws.', () => {
    c.logger.reset();
    c.select({});
    expect(c.logger).to.have.property('hasErrors', true);
  });

  it('Select from not existed namespace throws', () => {
    c.logger.reset();
    c.select({id: 'k1', space: 'error'});
    expect(c.logger).to.have.property('hasErrors', true);
  });
});
