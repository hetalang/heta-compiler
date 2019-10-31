/* global describe, it */
const { Container } = require('../src');
let c = new Container();
const { Page } = c.classes;
const { expect } = require('chai');

describe('Test for instanceOf', () => {
  it('Check Page parents', () => {
    let page1 = new Page({id: 'page1'});
    expect(page1.instanceOf('Page'))
      .to.be.true;
    expect(page1.instanceOf('_Component'))
      .to.be.true;  
    expect(page1.instanceOf('Object'))
      .to.be.true;  
    expect(page1.instanceOf('Record'))
      .to.be.false;  
    expect(page1.instanceOf('XXX'))
      .to.be.false;  
  });
  it('Check Page className', () => {
    let page1 = new Page({id: 'page1'});
    expect(page1)
      .to.have.property('className', 'Page');
  });
});
