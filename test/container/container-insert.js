/* global describe, it */
const Container = require('../../src/container');
const { expect } = require('chai');
const { Component } = require('../../src/core/component');

describe('Unit tests for Container', () => {
  let c;

  it('Creating empty container and three namespaces.', () => {
    c = new Container();
    c.setNS({space: 'three'});
    c.setNS({space: 'another'});
    c.setNS({space: 'default__'});
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
        id: 'pmid1', // #1
        class: 'ReferenceDefinition',
        prefix: 'https://pubmed.org/',
        suffix: '/'
      });
      expect(c.logger.hasErrors).to.be.false;
      expect(res).to.be.instanceOf(Component);

      let simple = c.namespaceStorage.get('nameless').get('pmid1');
      expect(simple).to.has.property('prefix', 'https://pubmed.org/');
      expect(simple).to.has.property('suffix', '/');
      expect(simple).to.has.property('className', 'ReferenceDefinition');
      expect(simple).to.has.property('id', 'pmid1');
      expect(simple).to.has.property('space', 'nameless');
      c.logger.resetErrors();
    });

    it('Insert components with the same id.', () => {
      c.insert({ 
        class: 'ReferenceDefinition',
        id: 'pmid2', // #2
        prefix: 'https://pubmed.org/',
        suffix: '/'
      });
      c.insert({ 
        class: 'ReferenceDefinition',
        id: 'pmid2', // #2
        prefix: 'https://google.com'
      });
      expect(c.logger.hasErrors).to.be.false;
      let simple = c.namespaceStorage.get('nameless').get('pmid2');
      expect(simple).to.have.property('prefix', 'https://google.com');
      expect(simple).to.have.property('space', 'nameless');
      c.logger.resetErrors();
    });

    it('Insert components with space.', () => {
      c.insert({ 
        class: 'ReferenceDefinition',
        id: 'pmid4', // #3
        space: 'three',
        prefix: 'xxx',
        suffix: '/'
      });
      expect(c.logger.hasErrors).to.be.false;
      let component = c.namespaceStorage.get('three').get('pmid4');
      expect(component).to.have.property('prefix', 'xxx');
      expect(component).to.have.property('space', 'three');
      c.logger.resetErrors();
    });

    it('Insert scoped component and check.', () => {
      c.insert({ 
        class: 'Record',
        id: 'pg1', // #4
        space: 'another'
      });
      expect(c.logger.hasErrors).to.be.false;
      let simple = c.namespaceStorage.get('another').get('pg1');
      expect(simple).to.has.property('space', 'another');
      c.logger.resetErrors();
    });
  });

  describe('All correct components.', () => {
    it('Record', () => {
      c.insert({
        class: 'Record',
        id: 'k1', // #5
        space: 'default__',
        assignments: {
          start_: 1.2e-2
        },
        units: '1/h'
      });
    });
    it('Compartment', () => {
      c.insert({
        class: 'Compartment',
        id: 'comp1', // #6
        space: 'default__',
        assignments: {
          start_: 5.2
        },
        units: 'L'
      });
    });
    it('Species', () => {
      c.insert({
        class: 'Species',
        id: 's1', // #7
        space: 'default__',
        compartment: 'comp1',
        assignments: {
          ode_: 10
        },
        units: 'uM'
      });
    });
    it('Process', () => {
      c.insert({
        class: 'Process',
        id: 'pr1', // #8
        space: 'default__',
        assignments: {
          ode_: 'k1*s1'
        },
        units: 'mole/h'
      });
    });
    it('Reaction', () => {
      c.insert({
        class: 'Reaction',
        id: 'r1', // #9
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
          ode_: 'k1 * s1'
        },
        units: 'umole/h'
      });
    });
  });

  describe('Test insert() wrong.', () => {
    it('Insert wrong components.', () => {
      c.insert({id: 'pmid3', class: 'ReferenceDefinition2'});
      expect(c.logger.hasErrors).to.be.true;
      c.logger.resetErrors();
  
      c.insert({id: '1xxx', class: 'ReferenceDefinition'});
      expect(c.logger.hasErrors).to.be.true;
      c.logger.resetErrors();
    });

    it('Insert to wrong namespace', () => {
      c.insert({id: 'k1', class: 'Const', space: 'wrong', num: 1});
      expect(c.logger.hasErrors).to.be.true;
      c.logger.resetErrors();
    });
  });
});
