/* global describe, it, should */

const { Container } = require('../src/container');

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
      res.should.be.instanceOf(Container);
      c.storage.should.be.lengthOf(1);
      let simple = c.storage.get({id: 'pmid1', space: 'global__'});
      simple.should.has.property('prefix', 'https://pubmed.org/');
      simple.should.has.property('suffix', '/');
      simple.should.has.property('className', 'ReferenceDefinition');
      simple.should.has.property('id', 'pmid1');
      simple.should.has.property('space');
    });

    it('Insert components with the same id.', () => {
      c.insert({
        class: 'ReferenceDefinition',
        id: 'pmid2',
        prefix: 'https://pubmed.org/',
        suffix: '/'
      }).insert({
        class: 'ReferenceDefinition',
        id: 'pmid2',
        prefix: 'https://google.com'
      });
      let simple = c.storage.get({id: 'pmid2', space: 'global__'});
      simple.should.has.property('prefix', 'https://google.com');
      simple.should.has.property('space');
      c.storage.should.be.lengthOf(2);
    });

    it('Insert unscoped components with space.', () => {
      c.insert({
        class: 'ReferenceDefinition',
        id: 'pmid4',
        space: 'three',
        prefix: 'xxx',
        suffix: '/'
      });
      let component = c.storage.get({id: 'pmid4', space: 'global__'});
      component.should.property('prefix', 'xxx');
      component.should.has.property('space');
      c.storage.should.be.lengthOf(3);
    });

    it('Insert scoped component and check.', () => {
      c.insert({
        class: 'Quantity',
        id: 'pg1',
        space: 'another'
      });
      let simple = c.storage.get({id: 'pg1', space: 'another'});
      simple.should.has.property('space', 'another');
      c.storage.should.be.lengthOf(4);
    });

    it('Insert scoped component without space and check.', () => {
      c.insert({
        class: 'Quantity',
        id: 'pg1'
      });
      let simple = c.storage.get({id: 'pg1', space: 'default__'});
      should(c.storage.get({id: 'pg1'})).be.undefined();
      simple.should.has.property('space', 'default__');
      c.storage.should.be.lengthOf(5);
    });
  });

  describe('All correct components.', () => {
    it('Quantity', () => {
      c.insert({
        class: 'Quantity',
        id: 'k1',
        variable: {
          kind: 'static',
          size: {num: 1.2e-2, free: true},
          units: '1/h'
        }
      });
    });
    it('Compartment', () => {
      c.insert({
        class: 'Compartment',
        id: 'comp1',
        variable: {
          kind: 'static',
          size: {num: 5.2, free: false},
          units: 'L'
        }
      });
    });
    it('Species', () => {
      c.insert({
        class: 'Species',
        id: 's1',
        compartment: 'comp1',
        variable: {
          kind: 'dynamic',
          size: {num: 10, free: false},
          units: 'uM'
        }
      });
    });
    it('Process', () => {
      c.insert({
        class: 'Process',
        id: 'pr1',
        variable: {
          kind: 'rule',
          size: {expr: 'k1*s1'},
          units: 'mole/h'
        }
      });
    });
  });

  describe('Test insert() wrong.', () =>{
    it('Insert wrong components.', () => {
      should.throws(() => {
        c.insert({});
      });
      should.throws(() => {
        c.insert({id: 'pmid3'});
      });
      should.throws(() => {
        c.insert({class: 'ReferenceDefinition'});
      });
      should.throws(() => {
        c.insert({id: 'pmid3', class: 'ReferenceDefinition2'});
      });
      should.throws(() => {
        c.insert({id: '1xxx', class: 'ReferenceDefinition'});
      });
      c.storage.should.be.lengthOf(9);

      console.log(c);
    });
  });
});
