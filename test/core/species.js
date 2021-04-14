/* global describe, it */
const { Species } = require('../../src/core/species');
const { expect } = require('chai');

describe('Testing dependOn() for Record and Species', () => {
  it('for Species isAmount=true', () => {
    let species = (new Species).merge({
      isAmount: true,
      assignments: {
        start_: 'x*y*exp(z*t)',
        evt1: 'x+y+z+x',
        evt2: 1.4
      }
    });
    let deps1 = species.dependOn('start_');
    let deps2 = species.dependOn('evt1');
    let deps3 = species.dependOn('evt2');
    let deps4 = species.dependOn('evt3');
    expect(deps1).to.have.members(['x', 'y', 'z', 't']);
    expect(deps2).to.have.members(['x', 'y', 'z']);
    expect(deps3).to.be.deep.equal([]);
    expect(deps4).to.be.lengthOf(0);
  });
  it('for Species isAmount=undefined', () => {
    let species = (new Species).merge({
      compartment: 'comp',
      assignments: {
        start_: 'x*y*exp(z)',
        evt1: 'x+y+z+x',
        evt2: 1.4
      }
    });
    let deps1 = species.dependOn('start_', true);
    let deps2 = species.dependOn('evt1', true);
    let deps3 = species.dependOn('evt2', true);
    let deps4 = species.dependOn('evt3', true);
    expect(deps1).to.have.members(['x', 'y', 'z', 'comp']);
    expect(deps2).to.have.members(['x', 'y', 'z', 'comp']);
    expect(deps3).to.have.members(['comp']);
    expect(deps4).to.be.lengthOf(1);
  });

  it('Do not Throws for Species without compartment', () => {
    let species = new Species;
    let deps = species.dependOn('start_');
    expect(deps).to.be.lengthOf(0);
  });
});
