/* global describe, it*/
const { expect } = require('chai');
const { Container } = require('../../src');
const { BindingError, ValidationError } = require('../../src/heta-error');

describe('TimeSwitcher errors', () => {

  it('No reference', () => {
    let c = new Container();
    c.loadMany([
      { id: 'sw1', class: 'TimeSwitcher', start: 'start' }
    ]);

    expect(() => c.knitMany()).throw(BindingError);
  });
  
  it('Wrong reference type', () => {
    let c = new Container();

    expect(() => c.loadMany([
      { id: 'sw1', class: 'TimeSwitcher', start: {} }
    ])).throw(ValidationError);
  });

  it('No reference', () => {
    let c = new Container();
    c.loadMany([
      { id: 'sw1', class: 'TimeSwitcher', start: 'start' },
      { id: 'start', class: 'Record', assignments: { start_: 12 } }
    ]);

    expect(() => c.knitMany()).throw(BindingError);
  });
});
