/* global describe, it */
const Container = require('../src/container');
const should = require('chai').should();

describe('Unit tests for Container import', () => {
  var c;
  c = new Container();

  it('Import component and check return.', () => {
    /*
    {
      action: insert,
      id: pmid2,
      class: ReferenceDefinition,
      prefix: "https://pubmed.org",
      suffix: /
    }
    */
    let res = c.import({
      action: 'insert',
      class: 'ReferenceDefinition',
      id: 'pmid2',
      prefix: 'https://pubmed.org/',
      suffix: '/'
    });
    res.should.be.instanceOf(Container);
    c.storage.should.be.lengthOf(1);
  });
});
