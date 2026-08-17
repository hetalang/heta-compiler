/* global describe, it */
const { expect } = require('chai');
const XLSX = require('xlsx');
const { Container } = require('../../src');
const tableLoader = require('../../src/module-system/table-module');

describe('Table boolean input normalization', () => {
  it('normalizes only supported textual boolean literals', () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      { on: 1, output: '0' },
      { on: 1, output: '1' },
      { on: 1, output: 'true' },
      { on: 1, output: 'false' },
      { on: 1, output: 5.7 },
      { on: 1, output: '5.7' }
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const content = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const rows = tableLoader(content);
    expect(rows.map((row) => row.output)).to.deep.equal([
      0, 1, true, false, 5.7, '5.7'
    ]);
  });
});

describe('Table special number input', () => {
  it('normalizes special num strings after loading the table', () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      { on: 1, id: 'positive', class: 'Const', num: 'Infinity' },
      { on: 1, id: 'negative', class: 'Const', num: '-Infinity' },
      { on: 1, id: 'invalid', class: 'Const', num: 'NaN' }
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const content = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const container = new Container();

    container.loadMany(tableLoader(content));
    const namespace = container.namespaceStorage.get('nameless');
    expect(namespace.get('positive').num).to.equal(Infinity);
    expect(namespace.get('negative').num).to.equal(-Infinity);
    expect(namespace.get('invalid').num).to.be.NaN;
  });
});
