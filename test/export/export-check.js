/* global describe, it */
const { Container } = require('../../src');
const { expect } = require('chai');

describe('General argument checking', () => {
  const p = new Container();

  it('Create JSON Export directly', () => {
    let json_export = new p.classes.JSON({
      id: 'json_export',
      filepath: './1.json',
      omit: ['num'],
      noUnitsExpr: true,
      spaceFilter: 'one',
      powTransform: 'function'
    });
    expect(p.logger).to.have.property('hasErrors').false;
    expect(json_export).to.have.property('id', 'json_export');
    expect(json_export).to.have.property('filepath', './1.json');
    expect(json_export).to.have.property('format', 'JSON');
    expect(json_export).to.have.deep.property('omit', ['num']);
    expect(json_export).to.have.property('noUnitsExpr', true);
    expect(json_export).to.have.deep.property('spaceFilter', 'one');
    p.logger.resetErrors();
  });

  it('Create JSON Export with #export', () => {
    let json_export = p.export({
      format: 'JSON',
      filepath: './_1.json'
    });
    expect(p.logger).to.have.property('hasErrors').false;
    expect(json_export).to.have.property('filepath', './_1.json');
    expect(json_export).to.have.property('format', 'JSON');
    expect(json_export).to.be.instanceOf(p.classes.JSON);
    p.logger.resetErrors();
  });
  
  it('Error in #export: no "format"', () => {
    let json_export = p.export({
      filepath: './1.json'
    });
    expect(p.logger).to.have.property('hasErrors').true;
    expect(json_export).to.be.undefined;
    p.logger.resetErrors();
  });
  
  it('Error in #export: wrong "format"', () => {
    let json_export = p.export({
      format: 'XXX',
      filepath: '1'
    });
    expect(p.logger).to.have.property('hasErrors').true;
    expect(json_export).to.be.undefined;
    p.logger.resetErrors();
  });

  it('Error in #export: no "filepath"', () => {
    let json_export = p.export({
      format: 'JSON'
    });
    expect(p.logger).to.have.property('hasErrors').false;
    expect(json_export).to.have.property('filepath', 'json');
    expect(json_export).to.be.instanceOf(p.classes.JSON);
    p.logger.resetErrors();
  });

  it('Error in #export: wrong "filepath"', () => {
    let json_export = p.export({
      format: 'JSON',
      filepath: './@1.xxx'
    });
    expect(p.logger).to.have.property('hasErrors').true;
    expect(json_export).to.be.instanceOf(p.classes.JSON);
    p.logger.resetErrors();
  });
  
  it('Error in #export: wrong "omit"', () => {
    let json_export = p.export({
      format: 'JSON',
      filepath: './1.txt',
      omit: 'xxx'
    });
    expect(p.logger).to.have.property('hasErrors').true;
    expect(json_export).to.not.have.property('omit');
    expect(json_export).to.be.instanceOf(p.classes.JSON);
    p.logger.resetErrors();
  });

  it('Error in #export: wrong "noUnitsExpr"', () => {
    let json_export = p.export({
      format: 'JSON',
      filepath: './1.txt',
      noUnitsExpr: 12
    });
    expect(p.logger).to.have.property('hasErrors').true;
    expect(json_export).to.be.instanceOf(p.classes.JSON);
    p.logger.resetErrors();
  });
  
  it('Error in #export: wrong "spaceFilter"', () => {
    let json_export = p.export({
      format: 'JSON',
      filepath: './1.txt',
      spaceFilter: 12
    });
    expect(p.logger).to.have.property('hasErrors').true;
    expect(json_export).to.be.instanceOf(p.classes.JSON);
    p.logger.resetErrors();
  });
});
