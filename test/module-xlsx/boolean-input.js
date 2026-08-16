/* global describe, it */
const { expect } = require('chai');
const XLSX = require('xlsx');
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
