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
const { Builder } = require('../../src/builder');
const { expect, use } = require('chai');
const chaiXml = require('chai-xml');
use(chaiXml);
const { safeLoad } = require('js-yaml');
const fs = require('fs-extra');
const { slvParse } = require('slv-utils');
const XLSX = require('xlsx'); 

const sbml_correct = fs.readFileSync('cases/0-hello-world/master/mm_sbml.xml','utf8');
const json_correct = require('../../cases/0-hello-world/master/full_json.json');
const yaml_correct_text = fs.readFileSync('cases/0-hello-world/master/full_yaml.yml','utf8');
const yaml_correct = safeLoad(yaml_correct_text);
const slv_correct_text = fs.readFileSync('cases/0-hello-world/master/mm_slv.slv','utf8');
const slv_correct = slvParse.parse(slv_correct_text);
const xlsx_correct = XLSX.readFile('cases/0-hello-world/master/table.xlsx');
const mrgsolve_correct = fs.readFileSync('cases/0-hello-world/master/mm_mrg/model.cpp','utf8');
const julia_correct = fs.readFileSync('cases/0-hello-world/master/mm_julia/model.jl','utf8');

describe('Testing "cases/0-hello-world"', () => {
  let b;
  let exportArray;

  it('Create builder.', () => {
    let declaration = {
      id: 'test',
      builderVersion: '*',
      options: {
        logLevel: 'panic',
        skipExport: true
      },
      importModule: {
        type: 'heta',
        source: 'src/index.heta'
      }
    };
    b = new Builder(declaration, 'cases/0-hello-world');
    //console.log(b);
  });

  it('Run include', () => {
    b.run();
    exportArray = [...b.container.exportStorage].map((x) => x[1]);
  });

  it('Run #export {format: SBML}, check and compare.', () => {
    let sbml_export = exportArray[0];
    let code = sbml_export.make(true)[0].content;
    expect(code).xml.to.to.be.valid();
    expect(code).xml.be.deep.equal(sbml_correct);
  });

  it('Run #export {format: JSON}, check and compare.', () => {
    let json_export = exportArray[2];
    let code = json_export.make(true)[0].content;
    let obj = JSON.parse(code);
    expect(obj).to.be.deep.equal(json_correct);
    //console.log(obj);
  });

  it('Run #export {format: YAML}, check and compare.', () => {
    let yaml_export = exportArray[3];
    let code = yaml_export.make(true)[0].content;
    let obj = safeLoad(code);
    expect(obj).to.be.deep.equal(yaml_correct);
    //console.log(code);
  });

  it('Run #export {format: SLV}, check and compare.', () => {
    let slv_export = exportArray[4];
    let code = slv_export.make(true)[0].content;
    let obj = slvParse.parse(code);
    expect(obj).to.be.deep.equal(slv_correct);
    //console.log(obj);
  });

  it('Run #export {format: XLSX}, check and compare.', () => {
    let xlsx_export = exportArray[9];
    let code = xlsx_export.make(true); // check only sheet #0

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
      let correctJSON_i = XLSX.utils.sheet_to_json(worksheet_i, { blankrows: true });
      expect(x.content).to.be.deep.equal(correctJSON_i);
    });

    //console.log(code[0]);
    //console.log(correctJSON_0);
  });

  it('Run #export {format: Mrgsolve}, check and compare.', () => {
    let mm_mrg = exportArray[7];
    let code = mm_mrg.make(true);
    // compare model.cpp text content
    expect(code[0].pathSuffix).to.be.equal('/model.cpp');
    expect(code[0].type).to.be.equal('text');
    expect(code[0].content).to.be.equal(mrgsolve_correct);
  });

  it('Run #export {format: Julia}, check and compare.', () => {
    let mm_mrg = exportArray[5];
    let code = mm_mrg.make(true);
    // compare model.js text content
    expect(code[0].pathSuffix).to.be.equal('/model.jl');
    expect(code[0].type).to.be.equal('text');
    expect(code[0].content).to.be.equal(julia_correct);
  });
});
