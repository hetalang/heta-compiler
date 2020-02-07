/* global describe, it */
const { Builder } = require('../../src');
const { expect, use } = require('chai');
const chaiXml = require('chai-xml');
use(chaiXml);
const { safeLoad } = require('js-yaml');
const fs = require('fs-extra');
const { slvParse } = require('slv-utils');

const sbml_correct = fs.readFileSync('cases/0-hello-world/master/mm_sbml.xml','utf8');
const json_correct = require('../../cases/0-hello-world/master/full_json.json');
const yaml_correct_text = fs.readFileSync('cases/0-hello-world/master/full_yaml.yml','utf8');
const yaml_correct = safeLoad(yaml_correct_text);
const slv_correct_text = fs.readFileSync('cases/0-hello-world/master/mm_slv.slv','utf8');
const slv_correct = slvParse.parse(slv_correct_text);

describe('Testing "cases/0-hello-world"', () => {
  let b;

  it('Create builder.', () => {
    let declaration = {
      'id': 'test',
      'builderVersion': '^0.4',
      'options': {
        'logLevel': 'error'
      },
      'importModule': {
        'type': 'heta',
        'source': 'src/index.heta'
      }
    };
    b = new Builder(declaration, 'cases/0-hello-world', '../../test/cases/1/dist');
    //console.log(b);
  });

  it('Run include', async () => {
    await b.compileAsync();
  });

  it('Run @SBMLExport, check and compare.', () => {
    let sbml_export = b.container.select({id: 'mm_sbml', space: 'mm'});
    let code = sbml_export.make()[0].content;
    expect(code).xml.to.to.be.valid();
    expect(code).xml.be.deep.equal(sbml_correct);
    //console.log(code);
  });
/*
  it('Run @MrgsolveExport, check and compare.', () => {
    let mm_mrg = b.container.select({id: 'mm_mrg', space: 'mm'});
    let code = mm_mrg.make()[0].content;
    let filename = './diagnostics/0/mm_mrg.cpp';
    fs.outputFileSync(filename, code);
    // the simulations will be checked later in R
  });
*/
  it('Run @JSONExport, check and compare.', () => {
    const JSONExport = b.container.classes.JSONExport;
    let json_export = new JSONExport;
    json_export._id = 'json_export';
    json_export.namespace = b.container.namespaces.get('mm');

    let code = json_export.make()[0].content;
    let obj = JSON.parse(code);
    expect(obj).to.be.deep.equal(json_correct);
    //console.log(obj);
  });

  it('Run @YAMLExport, check and compare.', () => {
    const YAMLExport = b.container.classes.YAMLExport;
    let yaml_export = new YAMLExport;
    yaml_export._id = 'yaml_export';
    yaml_export.namespace = b.container.namespaces.get('mm');

    let code = yaml_export.make()[0].content;
    let obj = safeLoad(code);
    expect(obj).to.be.deep.equal(yaml_correct);
    //console.log(code);
  });

  it('Run @SLVExport, check and compare.', () => {
    const SLVExport = b.container.classes.SLVExport;
    let slv_export = new SLVExport;
    slv_export._id = 'slv_export';
    slv_export.namespace = b.container.namespaces.get('mm');

    let code = slv_export.make()[0].content;
    let obj = slvParse.parse(code);
    expect(obj).to.be.deep.equal(slv_correct);
    //console.log(obj);
  });
});
