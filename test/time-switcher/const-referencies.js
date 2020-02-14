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

  it('add ref', () => {
    let sw1 = c.namespaces.get('nameless').get('sw1');
    let sw2 = c.namespaces.get('nameless').get('sw2');
    let sw3 = c.namespaces.get('nameless').get('sw3');

    //console.log(sw1.toQ());
    //console.log(sw2.toQ());
    //console.log(sw3);
  });

});
