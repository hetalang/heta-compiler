/* global describe, it */
const { expect } = require('chai');
const fs = require('fs');

const { Builder } = require('../../src');
require('../../src/mrgsolve-export/namespace');

describe('mrgsolve rename of reserved words', () => {
  it('matches expected mrgsolve DynMS snapshot', () => {
    let declaration = {
      importModule: { type: 'heta', source: 'cases/36-mrgsolve-rename/src/index.heta' }
    };
    let builder = new Builder(declaration, fs.readFileSync, () => {}).run();

    let ns = builder.container.namespaceStorage.get('nameless');
    let model = ns.getMrgsolveImage();

    let expected = require('./output.dynms.json');
    expect(_normalize(model)).to.deep.equal(expected);
  });
});

function _normalize(x) {
  return JSON.parse(JSON.stringify(x));
}
