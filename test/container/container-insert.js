/* global describe, it */

const { ContainerError, ValidationError } = require('../../src/heta-error');
const Container = require('../../src/container');
const should = require('chai').should();
const { _Component } = require('../../src/core/_component');

describe('Unit tests for Container', () => {
  var c;

  it('Creating empty container.', () => {
    c = new Container();
  });

  describe('Test insert() correct.', () => {
    it('Insert component and check return.', () => {
      /*
      #insert pmid1 @ReferenceDefinition {
        prefix: "https://pubmed.org",
        suffix: /
      };
      */
      let res = c.insert({
        id: 'pmid1',
        class: 'ReferenceDefinition',
        prefix: 'https://pubmed.org/',
        suffix: '/'
      });
      res.should.be.instanceOf(_Component);
      c.storage.size.should.be.eql(1);
      let simple = c.storage.get('pmid1');
      
      simple.should.has.property('prefix', 'https://pubmed.org/');
      simple.should.has.property('suffix', '/');
      simple.should.has.property('className', 'ReferenceDefinition');
      simple.should.has.property('id', 'pmid1');
      simple.should.has.property('space', undefined);
    });

    it('Insert components with the same id.', () => {
      c.insert({
        class: 'ReferenceDefinition',
        id: 'pmid2',
        prefix: 'https://pubmed.org/',
        suffix: '/'
      });
      c.insert({
        class: 'ReferenceDefinition',
        id: 'pmid2',
        prefix: 'https://google.com'
      });
      let simple = c.storage.get('pmid2');
      simple.should.has.property('prefix', 'https://google.com');
      simple.should.has.property('space', undefined);
      c.storage.size.should.be.eql(2);
    });

    it('Insert components with space.', () => {
      c.insert({
        class: 'ReferenceDefinition',
        id: 'pmid4',
        space: 'three',
        prefix: 'xxx',
        suffix: '/'
      });
      let component = c.storage.get('three::pmid4');
      component.should.property('prefix', 'xxx');
      component.should.has.property('space', 'three');
      c.storage.size.should.be.eql(3);
    });

    it('Insert scoped component and check.', () => {
      c.insert({
        class: 'Record',
        id: 'pg1',
        space: 'another'
      });
      let simple = c.storage.get('another::pg1');
      simple.should.has.property('space', 'another');
      c.storage.size.should.be.eql(4);
    });
  });

  describe('All correct components.', () => {
    it('Record', () => {
      c.insert({
        class: 'Record',
        id: 'k1',
        space: 'default__',
        assignments: {
          start_: {expr: 1.2e-2}
        },
        units: '1/h'
      });
    });
    it('Compartment', () => {
      c.insert({
        class: 'Compartment',
        id: 'comp1',
        space: 'default__',
        assignments: {
          start_: {expr: 5.2}
        },
        units: 'L'
      });
    });
    it('Species', () => {
      c.insert({
        class: 'Species',
        id: 's1',
        space: 'default__',
        compartment: 'comp1',
        assignments: {
          ode_: {expr: 10}
        },
        units: 'uM'
      });
    });
    it('Process', () => {
      c.insert({
        class: 'Process',
        id: 'pr1',
        space: 'default__',
        assignments: {
          ode_: {expr: 'k1*s1'}
        },
        units: 'mole/h'
      });
    });
    it('Reaction', () => {
      c.insert({
        class: 'Reaction',
        id: 'r1',
        space: 'default__',
        actors: [
          {target: 's1', stoichiometry: -1},
          {target: 's2', stoichiometry: 2}
        ],
        effectors: [
          {target: 'm1'},
          {target: 'm2'},
          {target: 'm3'}
        ],
        assignments: {
          ode_: {expr: 'k1 * s1'}
        },
        units: 'umole/h'
      });
    });
  });

  describe('Test insert() wrong.', () => {
    it('Insert wrong components.', () => {
      should.Throw(() => {
        c.insert({});
      }, ContainerError);
      should.Throw(() => {
        c.insert({id: 'pmid3'});
      }, Error);
      should.Throw(() => {
        c.insert({class: 'ReferenceDefinition'});
      }, ContainerError);
      should.Throw(() => {
        c.insert({id: 'pmid3', class: 'ReferenceDefinition2'});
      }, Error);
      should.Throw(() => {
        c.insert({id: '1xxx', class: 'ReferenceDefinition'});
      }, ValidationError);
      c.storage.size.should.be.eql(9);

      // console.log(c);
    });
  });
});
