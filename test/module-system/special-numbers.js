/* global describe, it */
const { expect } = require('chai');
const { Builder, Container } = require('../../src');
const jsonLoader = require('../../src/module-system/json-module');
const yamlLoader = require('../../src/module-system/yaml-module');

function loadIntoContainer(loader, text) {
  let container = new Container();
  container.loadMany(loader(Buffer.from(text)));
  return container;
}

describe('Special numbers in JSON and YAML modules', () => {
  it('imports JSON num markers as special numbers', () => {
    let container = loadIntoContainer(jsonLoader, JSON.stringify([
      { id: 'positive', class: 'Const', num: 'Infinity' },
      { id: 'positiveAlias', class: 'Const', num: '+Infinity' },
      { id: 'negative', class: 'Const', num: '-Infinity' },
      { id: 'invalid', class: 'Const', num: 'NaN' }
    ]));
    let namespace = container.namespaceStorage.get('nameless');

    expect(namespace.get('positive').num).to.equal(Infinity);
    expect(namespace.get('positiveAlias').num).to.equal(Infinity);
    expect(namespace.get('negative').num).to.equal(-Infinity);
    expect(namespace.get('invalid').num).to.be.NaN;
  });

  it('imports native YAML special numbers', () => {
    let container = loadIntoContainer(yamlLoader, `
- id: positive
  class: Const
  num: .inf
- id: negative
  class: Const
  num: -.inf
- id: invalid
  class: Const
  num: .nan
`);
    let namespace = container.namespaceStorage.get('nameless');

    expect(namespace.get('positive').num).to.equal(Infinity);
    expect(namespace.get('negative').num).to.equal(-Infinity);
    expect(namespace.get('invalid').num).to.be.NaN;
  });

  it('exports special nums as JSON strings and YAML values', () => {
    let declaration = {
      id: 'special-numbers',
      builderVersion: '*',
      options: {},
      importModule: { type: 'heta', source: 'unused.heta' },
      export: []
    };
    let builder = new Builder(declaration);
    builder.container.loadMany([
      { id: 'positive', class: 'Const', num: Infinity },
      { id: 'negative', class: 'Const', num: -Infinity },
      { id: 'invalid', class: 'Const', num: NaN }
    ]);

    let JSONExport = builder.exportClasses.json;
    let json = JSON.parse(new JSONExport().makeText()[0].content);
    let jsonById = new Map(json.map((q) => [q.id, q]));
    expect(jsonById.get('positive').num).to.equal('Infinity');
    expect(jsonById.get('negative').num).to.equal('-Infinity');
    expect(jsonById.get('invalid').num).to.equal('NaN');

    let YAMLExport = builder.exportClasses.yaml;
    let yaml = new YAMLExport().makeText()[0].content;
    expect(yaml).to.include('num: .inf');
    expect(yaml).to.include('num: -.inf');
    expect(yaml).to.include('num: .nan');

    let CanonicalExport = builder.exportClasses.canonical;
    let canonical = JSON.parse(new CanonicalExport().makeText()[0].content);
    let canonicalById = new Map(canonical.map((q) => [q.id, q]));
    expect(canonicalById.get('positive').num).to.equal('Infinity');
    expect(canonicalById.get('negative').num).to.equal('-Infinity');
    expect(canonicalById.get('invalid').num).to.equal('NaN');
  });
});
