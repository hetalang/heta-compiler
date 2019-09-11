/* global describe, it */
const { Species } = require('../../src/core/species');
const { expect } = require('chai');

describe('Testing dependOnIds() for Record and Species', () => {
  it('for Species isAmount=true', () => {
    let species = new Species({id: 'S1', space: 'one'}).merge({
      isAmount: true,
      assignments: {
        start_: 'x*y*exp(z*t)',
        evt1: 'x+y+z+x',
        evt2: 1.4
      }
    });
    let deps1 = species.dependOnIds('start_');
    let deps2 = species.dependOnIds('evt1');
    let deps3 = species.dependOnIds('evt2');
    let deps4 = species.dependOnIds('evt3');
    expect(deps1).to.be.deep.equal(['x', 'y', 'z']);
    expect(deps2).to.be.deep.equal(['x', 'y', 'z']);
    expect(deps3).to.be.deep.equal([]);
    expect(deps4).to.be.an('undefined');
  });
  it('for Species isAmount=undefined', () => {
    let species = new Species({id: 'S1', space: 'one'}).merge({
      compartment: 'comp',
      assignments: {
        start_: 'x*y*exp(z)',
        evt1: 'x+y+z+x',
        evt2: 1.4
      }
    });
    let deps1 = species.dependOnIds('start_');
    let deps2 = species.dependOnIds('evt1');
    let deps3 = species.dependOnIds('evt2');
    let deps4 = species.dependOnIds('evt3');
    expect(deps1).to.be.deep.equal(['x', 'y', 'z', 'comp']);
    expect(deps2).to.be.deep.equal(['x', 'y', 'z', 'comp']);
    expect(deps3).to.be.deep.equal(['comp']);
    expect(deps4).to.be.an('undefined');
  });
  it('Throws for Species when  isAmount=undefined and no compartment', () => {
    let species = new Species({id: 'S1', space: 'one'});
    expect(() => species.dependOnIds('start_')).throw(Error);
  });
});
