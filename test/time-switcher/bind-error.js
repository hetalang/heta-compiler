/* global describe, it*/
const { expect } = require('chai');
const { Container } = require('../../src');

describe('TimeSwitcher errors', () => {

  it('No reference', () => {
    let c = new Container();
    c.loadMany([
      { id: 'sw1', class: 'TimeSwitcher', start: 'start' }
    ]);
    c.knitMany();

    expect(c.hetaErrors()).to.be.lengthOf(1);
  });
  
  it('Wrong reference type', () => {
    let c = new Container();

    let sw1 = c.load(
      { id: 'sw2', class: 'TimeSwitcher', start: {} }
    );
    //console.log(sw1.namespace);
    expect(c.hetaErrors()).to.be.lengthOf(1);
  });

  it('No reference', () => {
    let c = new Container();
    c.loadMany([
      { id: 'sw3', class: 'TimeSwitcher', start: 'start' },
      { id: 'start', class: 'Record', assignments: { start_: 12 } }
    ]);

    c.knitMany();
    expect(c.hetaErrors()).to.be.lengthOf(1);
  });
});
