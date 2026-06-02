/* global describe, it */
/*
  It compiles the platform located in /cases/0-hello-world/ and compare the exported files with /cases/0-hello-world/master content
  Tested export formats:
  - JSON
  - YAML
  - SLV
  - XLSX
*/
const { Builder } = require('../../src');
const { expect } = require('chai');
const { load } = require('js-yaml');
const fs = require('fs-extra');
const { slvParse } = require('slv-utils');
const XLSX = require('xlsx');

const json_correct = require('../../cases/0-hello-world/master/json/output.heta.json');
const yaml_correct_text = fs.readFileSync('cases/0-hello-world/master/yaml/output.heta.yml','utf8');
const yaml_correct = load(yaml_correct_text);
const slv_correct_text = fs.readFileSync('cases/0-hello-world/master/slv/mm.slv','utf8');
const slv_correct = slvParse.parse(slv_correct_text);
const xlsx_correct = XLSX.readFile('cases/0-hello-world/master/xlsx/output.heta.xlsx');
const mrgsolve_correct = fs.readFileSync('cases/0-hello-world/master/mrgsolve/mm.cpp','utf8');
const julia_correct = fs.readFileSync('cases/0-hello-world/master/julia/model.jl','utf8');

describe('Testing "cases/0-hello-world"', () => {
  let b;

  it('Create builder.', () => {
    let declaration = {
      id: 'test',
      builderVersion: '*',
      options: {
      },
      importModule: {
        type: 'heta',
        source: 'src/index.heta'
      },
      export: [
        {format: 'json', spaceFilter: '^mm$', useUnitsExpr: true},
        {format: 'yaml', spaceFilter: '^mm$', useUnitsExpr: true},
        {format: 'slv', version: '25', spaceFilter: '^mm$'},
        {format: 'xlsx', splitByClass: true, spaceFilter: '^mm$'},
        {format: 'mrgsolve', spaceFilter: '^mm$'},
        {format: 'julia', spaceFilter: '^mm$'}]
    };
    process.chdir('cases/0-hello-world');
    b = new Builder(declaration, fs.readFileSync, () => {});
  });

  it('Run include', () => {
    b.run();
    process.chdir('../..');
  });

  it('Run export {format: JSON}, check and compare.', () => {
    let json_export = b.exportArray[0];
    let code = json_export.makeText(true)[0].content;
    let obj = JSON.parse(code).slice(1); // skip hasMeta
    expect(obj).to.be.deep.equal(json_correct.slice(1)); // skip hasMeta
    //console.log(obj);
  });

  it('Run export {format: YAML}, check and compare.', () => {
    let yaml_export = b.exportArray[1];
    let code = yaml_export.makeText(true)[0].content;
    let obj = load(code).slice(1); // skip hasMeta
    expect(obj).to.be.deep.equal(yaml_correct.slice(1)); // skip hasMeta
    //console.log(code);
  });

  it('Run export {format: SLV}, check and compare.', () => {
    let slv_export = b.exportArray[2];
    let code = slv_export.makeText(true)[0].content;
    let obj = slvParse.parse(code);
    expect(obj).to.be.deep.equal(slv_correct);
    //console.log(obj);
  });

  it('Run export {format: XLSX}, check and compare.', () => {
    let xlsx_export = b.exportArray[3];
    let code = xlsx_export.makeSheet(true); // check only sheet #0

    // check number of sheets
    let correctSheetsCount = Object.keys(xlsx_correct.Sheets).length;
    expect(code).to.be.lengthOf(correctSheetsCount);

    // check sheets names
    let sheetNames = code.map((x) => x.name);
    let correctSheetNames = Object.keys(xlsx_correct.Sheets);
    expect(sheetNames).to.be.deep.equal(correctSheetNames);

    // check other parts
    code.forEach((x, i) => {
      let worksheet_i = xlsx_correct.Sheets[correctSheetNames[i]];
      let correctJSON_i = XLSX.utils.sheet_to_json(worksheet_i, { blankrows: true })
        .filter(x => x.action !== 'hasMeta'); // remove meta row
      let content = x.content.filter(x => x.action !== 'hasMeta'); // remove meta row
      expect(content).to.be.deep.equal(correctJSON_i);
    });

    //console.log(code[0]);
    //console.log(correctJSON_0);
  });

  it('Run export {format: Mrgsolve}, check and compare.', () => {
    let mm_mrg = b.exportArray[4];
    let code = mm_mrg.makeText(true);
    // compare model.cpp text content
    expect(code[0].pathSuffix).to.be.equal('/mm.cpp');
    expect(code[0].type).to.be.equal('text');
    expect(code[0].content).to.be.equal(mrgsolve_correct);
  });

  it('Run export {format: Julia}, check and compare.', () => {
    let mm_mrg = b.exportArray[5];
    let code = mm_mrg.makeText(true);
    // compare model.js text content
    expect(code[0].pathSuffix).to.be.equal('/model.jl');
    expect(code[0].type).to.be.equal('text');
    expect(code[0].content).to.be.equal(julia_correct);
  });

});
