/* global describe, it */
const Container = require('../../src/container');
require('chai').should();
const { _Component } = require('../../src/core/_component');

describe('Unit tests for Container load', () => {
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
    let res = c.load({
      action: 'insert',
      class: 'ReferenceDefinition',
      id: 'pmid2',
      prefix: 'https://pubmed.org/',
      suffix: '/'
    });
    res.should.be.instanceOf(_Component);
    c.should.be.lengthOf(1);
  });
});
