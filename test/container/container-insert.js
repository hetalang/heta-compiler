/* global describe, it */

const { ContainerError } = require('../../src/heta-error');
const Container = require('../../src/container');
const { expect } = require('chai');
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
      expect(res).to.be.instanceOf(_Component);
      expect(c.storage.size).to.be.eql(1);

      let simple = c.storage.get('pmid1');
      expect(simple).to.has.property('prefix', 'https://pubmed.org/');
      expect(simple).to.has.property('suffix', '/');
      expect(simple).to.has.property('className', 'ReferenceDefinition');
      expect(simple).to.has.property('id', 'pmid1');
      expect(simple).to.has.property('space', undefined);
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
      expect(simple).to.have.property('prefix', 'https://google.com');
      expect(simple).to.have.property('space', undefined);
      expect(c.storage.size).to.be.eql(2);
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
      expect(component).to.have.property('prefix', 'xxx');
      expect(component).to.have.property('space', 'three');
      expect(c.storage.size).to.be.eql(3);
    });

    it('Insert scoped component and check.', () => {
      c.insert({
        class: 'Record',
        id: 'pg1',
        space: 'another'
      });
      let simple = c.storage.get('another::pg1');
      expect(simple).to.has.property('space', 'another');
      expect(c.storage.size).to.be.eql(4);
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
      expect(() => c.insert({})).to.throw(ContainerError);
      expect(() => c.insert({id: 'pmid3'})).to.throw(ContainerError);
      expect(() => c.insert({class: 'ReferenceDefinition'})).to.throw(ContainerError);
      expect(() => c.insert({id: 'pmid3', class: 'ReferenceDefinition2'})).to.throw(ContainerError);
      expect(() => c.insert({id: '1xxx', class: 'ReferenceDefinition'})).to.throw(ContainerError);

      expect(c.storage.size).to.be.eql(9);

      // console.log(c);
    });
  });
});
