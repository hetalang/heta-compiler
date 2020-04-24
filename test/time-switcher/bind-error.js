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

    expect(c.logger).to.has.property('hasErrors', true);
  });
  
  it('Wrong reference type', () => {
    let c = new Container();

    c.loadMany([
      { id: 'sw1', class: 'TimeSwitcher', start: {} }
    ]);
    expect(c.logger).to.has.property('hasErrors', true);
  });

  it('No reference', () => {
    let c = new Container();
    c.loadMany([
      { id: 'sw1', class: 'TimeSwitcher', start: 'start' },
      { id: 'start', class: 'Record', assignments: { start_: 12 } }
    ]);

    c.knitMany();
    expect(c.logger).to.has.property('hasErrors', true);
  });
});
