/* global describe, it */
/*
  It compiles the platform located in /cases/0-hello-world/ and compare the exported fils with /cases/0-hello-world/master content
  Tested export formats:
  - JSON
  - YAML
  - SBML L2V4
  - SLV
  - XLSX
*/
const { Builder } = require('../../src');
const { expect, use } = require('chai');
const chaiXml = require('chai-xml');
use(chaiXml);
const { load } = require('js-yaml');
const fs = require('fs-extra');
const { slvParse } = require('slv-utils');
const XLSX = require('xlsx');

const sbml_l2v4_correct = fs.readFileSync('cases/0-hello-world/master/mm_sbml_l2v4/mm.xml','utf8');
const sbml_l3v1_correct = fs.readFileSync('cases/0-hello-world/master/mm_sbml_l3v1/mm.xml','utf8');
const json_correct = require('../../cases/0-hello-world/master/output.heta.json');
const yaml_correct_text = fs.readFileSync('cases/0-hello-world/master/output.heta.yml','utf8');
const yaml_correct = load(yaml_correct_text);
const slv_correct_text = fs.readFileSync('cases/0-hello-world/master/mm_slv.slv','utf8');
const slv_correct = slvParse.parse(slv_correct_text);
const xlsx_correct = XLSX.readFile('cases/0-hello-world/master/output.heta.xlsx');
const mrgsolve_correct = fs.readFileSync('cases/0-hello-world/master/mm_mrg/mm.cpp','utf8');
const julia_correct = fs.readFileSync('cases/0-hello-world/master/mm_julia/model.jl','utf8');

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
        {format: 'SBML', version: 'L2V4', filepath: 'mm_sbml_l2v4', spaceFilter: '^mm$'},
        {format: 'SBML', version: 'L3V1', filepath: 'mm_sbml_l3v1', spaceFilter: '^mm$'},
        {format: 'JSON', spaceFilter: '^mm$'},
        {format: 'YAML', spaceFilter: '^mm$'},
        {format: 'SLV', version: '25', spaceFilter: '^mm$'},
        {format: 'XLSX', splitByClass: true, spaceFilter: '^mm$'},
        {format: 'Mrgsolve', spaceFilter: '^mm$'},
        {format: 'Julia', spaceFilter: '^mm$'}]
    };
    process.chdir('cases/0-hello-world');
    b = new Builder(declaration, fs.readFileSync, () => {});
  });

  it('Run include', () => {
    b.run();
    process.chdir('../..');
  });

  it('Run {format: SBML}, check and compare.', () => {
    let sbml_export = b.exportArray[0];
    let code = sbml_export.makeText(true)[0].content;
    expect(code).xml.to.to.be.valid();
    expect(code).xml.be.deep.equal(sbml_l2v4_correct);
  });

  it('Run export {format: SBML}, check and compare.', () => {
    let sbml_export = b.exportArray[1];
    let code = sbml_export.makeText(true)[0].content;
    expect(code).xml.to.to.be.valid();
    expect(code).xml.be.deep.equal(sbml_l3v1_correct);
  });

  it('Run export {format: JSON}, check and compare.', () => {
    let json_export = b.exportArray[2];
    let code = json_export.makeText(true)[0].content;
    let obj = JSON.parse(code).slice(1); // skip meta
    expect(obj).to.be.deep.equal(json_correct.slice(1));
    //console.log(obj);
  });

  it('Run export {format: YAML}, check and compare.', () => {
    let yaml_export = b.exportArray[3];
    let code = yaml_export.makeText(true)[0].content;
    let obj = load(code).slice(1); // skip meta
    expect(obj).to.be.deep.equal(yaml_correct.slice(1));
    //console.log(code);
  });

  it('Run export {format: SLV}, check and compare.', () => {
    let slv_export = b.exportArray[4];
    let code = slv_export.makeText(true)[0].content;
    let obj = slvParse.parse(code);
    expect(obj).to.be.deep.equal(slv_correct);
    //console.log(obj);
  });

  it('Run export {format: XLSX}, check and compare.', () => {
    let xlsx_export = b.exportArray[5];
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
    let mm_mrg = b.exportArray[6];
    let code = mm_mrg.makeText(true);
    // compare model.cpp text content
    expect(code[0].pathSuffix).to.be.equal('/mm.cpp');
    expect(code[0].type).to.be.equal('text');
    expect(code[0].content).to.be.equal(mrgsolve_correct);
  });

  it('Run export {format: Julia}, check and compare.', () => {
    let mm_mrg = b.exportArray[7];
    let code = mm_mrg.makeText(true);
    // compare model.js text content
    expect(code[0].pathSuffix).to.be.equal('/model.jl');
    expect(code[0].type).to.be.equal('text');
    expect(code[0].content).to.be.equal(julia_correct);
  });

});
