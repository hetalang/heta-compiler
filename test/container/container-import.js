/* global describe, it */
const Container = require('../../src/container');
const { expect } = require('chai');
const { _Component } = require('../../src/core/_component');

describe('Unit tests for Container load', () => {
  var c;
  c = new Container();

  it('Load component and check return.', () => {
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
    expect(res).to.be.instanceOf(_Component);
    expect(c).to.be.lengthOf(1);
  });
});
