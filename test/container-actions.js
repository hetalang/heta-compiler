/* global describe, it, should */

const { Container } = require('../src/container');

describe('Unit tests for Container', () => {
  var c;

  it('Creating empty container.', () => {
    c = new Container();
  });

  describe('Test insert().', () => {
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
      let simple = c.storage.get({id: 'pmid1'});
      simple.should.has.property('prefix', 'https://pubmed.org/');
      simple.should.has.property('suffix', '/');
      simple.should.has.property('className', 'ReferenceDefinition');
      simple.should.has.property('id', 'pmid1');
      simple.should.not.has.property('space');
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
      c.storage.get({id: 'pmid2'}).should.property('prefix', 'https://google.com');
      c.storage.get({id: 'pmid2'}).should.not.property('space');
      c.storage.should.be.lengthOf(2);
    });

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
      let component = c.storage.get({id: 'pmid4'});
      component.should.property('prefix', 'xxx');
      component.should.not.has.property('space');
      c.storage.should.be.lengthOf(3);
    });

    it('Insert scoped component and check.', () => {
      c.insert({
        class: 'Page',
        id: 'pg1',
        space: 'another',
        content: 'content'
      });
      let simple = c.storage.get({id: 'pg1', space: 'another'});
      simple.should.has.property('content', 'content');
      simple.should.has.property('space', 'another');
      c.storage.should.be.lengthOf(4);
    });

    it('Insert scoped component without space and check.', () => {
      c.insert({
        class: 'Page',
        id: 'pg1',
        content: 'content'
      });
      let simple = c.storage.get({id: 'pg1', space: 'default__'});
      should(c.storage.get({id: 'pg1'})).be.undefined(); // to check wrong index
      simple.should.has.property('content', 'content');
      simple.should.has.property('space', 'default__');
      c.storage.should.be.lengthOf(5);
    });

    it('DELETE LATER', () => {
      // console.log(c);
    });
  });
});
