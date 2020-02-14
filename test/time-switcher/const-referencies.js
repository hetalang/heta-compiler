/* global describe, it*/
const { expect } = require('chai');
const { Container } = require('../../src');

describe('TimeSwitcher uses referencies.', () => {
  let c;

  it('Create container', () => {
    c = new Container();
    c.loadMany([
      { id: 'sw1', class: 'TimeSwitcher', start: 'start', period: 'period' },
      { id: 'sw2', class: 'TimeSwitcher', start: 12, period: 6 },
      { id: 'sw3', class: 'TimeSwitcher' },
      { id: 'start', class: 'Const', num: 12 },
      { id: 'period', class: 'Const', num: 6 }
    ]);
    c.knitMany();
  });

  it('Bound period and start', () => {
    let sw1 = c.namespaces.get('nameless').get('sw1');

    expect(sw1).to.have.property('start', 'start');
    expect(sw1).to.have.property('startObj').which.has.property('id', 'start');
    expect(sw1).to.have.property('period', 'period');
    expect(sw1).to.have.property('periodObj').which.has.property('id', 'period');
    expect(sw1).to.not.have.property('stopObj');
    expect(sw1).to.not.have.property('repeatCountObj');

    expect(sw1.toQ()).to.be.deep.equal({
      id: 'sw1',
      class: 'TimeSwitcher',
      start: 'start',
      period: 'period'
    });
  });

  it('Anon period and start', () => {
    let sw2 = c.namespaces.get('nameless').get('sw2');

    expect(sw2).to.not.have.property('start');
    expect(sw2).to.have.property('startObj').which.has.property('num', 12);
    expect(sw2).to.not.have.property('period');
    expect(sw2).to.have.property('periodObj').which.has.property('num', 6);
    expect(sw2).to.not.have.property('stopObj');
    expect(sw2).to.not.have.property('repeatCountObj');

    expect(sw2.toQ()).to.be.deep.equal({
      id: 'sw2',
      class: 'TimeSwitcher',
      start: 12,
      period: 6
    });
  });

  
  it('No properties', () => {
    let sw3 = c.namespaces.get('nameless').get('sw3');

    expect(sw3).to.not.have.property('start');
    expect(sw3).to.have.property('startObj').which.has.property('num', 0);
    expect(sw3).to.not.have.property('period');
    expect(sw3).to.not.have.property('periodObj');
    expect(sw3).to.not.have.property('stop');
    expect(sw3).to.not.have.property('stopObj');
    expect(sw3).to.not.have.property('repeatCount');
    expect(sw3).to.not.have.property('repeatCountObj');
    
    expect(sw3.toQ()).to.be.deep.equal({
      id: 'sw3',
      class: 'TimeSwitcher',
      start: 0
    });
  });
});
