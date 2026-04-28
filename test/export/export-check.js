/* global describe, it */
const { Builder } = require('../../src');
const { expect } = require('chai');

describe('General argument checking', () => {
  it('Create JSON Export directly', () => {
    const b = new Builder();
    const p = b.container;
    let json_export = new b.exportClasses['json']({
      id: 'json_export',
      filepath: './1.json',
      omit: ['num'],
      useUnitsExpr: false,
      spaceFilter: 'one',
      powTransform: 'function'
    });
    expect(p.logger).to.have.property('hasErrors').false;
    expect(json_export).to.have.property('filepath', './1.json');
    expect(json_export).to.have.property('format', 'json');
    expect(json_export).to.have.deep.property('omit', ['num']);
    //expect(json_export).to.have.property('useUnitsExpr', false); // undefined by default
    expect(json_export).to.have.deep.property('spaceFilter', 'one');
    p.logger.resetErrors();
  });
  
  it('Create JSON Export with export', () => {
    const b = new Builder({export: [{ format: 'json', filepath: './_1.json'}]});
    let { logger } = b.container;
    json_export = b.exportArray[0];
    expect(logger).to.have.property('hasErrors').false;
    expect(json_export).to.have.property('filepath', './_1.json');
    expect(json_export).to.have.property('format', 'json');
    expect(json_export).to.be.instanceOf(b.exportClasses['json']);
  });
 
  it('Error in export: no "format"', () => {
    expect(() => new Builder({export: [{ filepath: './1.json'}]})).to.throw(/Wrong structure/);
  });
  
  it('Error in export: wrong "format"', () => {
    let b = new Builder({export: [{ format: 'xxx', filepath: './1.json'}]})
    let { logger } = b.container;
    expect(logger).to.have.property('hasErrors').true;
  });

  it('Error in export: no "filepath"', () => {
    let b = new Builder({export: [{ format: 'json'}]});
    let { logger } = b.container;
    expect(logger).to.have.property('hasErrors').false;
    let json_export = b.exportArray[0];
    expect(json_export).to.have.property('filepath', 'json');
    expect(json_export).to.have.property('format', 'json');
    expect(json_export).to.be.instanceOf(b.exportClasses['json']);
  });

  it('Error in export: wrong "filepath"', () => {
    let b = new Builder({export: [{ format: 'json', filepath: '/@1.xxx'}]});
    //expect(() => new Builder({export: [{ format: 'json', filepath: './@1.json'}]})).to.throw();
    let { logger } = b.container;
    expect(logger).to.have.property('hasErrors').true;
  });
  
  it('Error in export: wrong "omit"', () => {
    let b = new Builder({export: [{ format: 'json', filepath: './1.json', omit: 'xxx'}]});
    let { logger } = b.container;
    expect(logger).to.have.property('hasErrors').true;
  });
  
  it('Error in export: wrong "useUnitsExpr"', () => {
    let b = new Builder({export: [{ format: 'json', filepath: './1.json', useUnitsExpr: 12}]} );
    let { logger } = b.container;
    expect(logger).to.have.property('hasErrors').true;
  });
  
  it('Error in export: wrong "spaceFilter"', () => {
    expect(() => new Builder({export: [{ format: 'json', filepath: './1.json', spaceFilter: 12}]})).to.throw(/Wrong structure/);
  });
});
