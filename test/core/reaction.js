/* global describe, it */
const { Reaction } = require('../../src/core/reaction');
const { expect } = require('chai');

describe('Unit tests for Reaction.', () => {
  it('Check toQ.', () => {
    let simple = (new Reaction({id: 'r1', space: 'default__'})).merge({
      class: 'Reaction',
      actors: [
        {target: 's1', stoichiometry: -1},
        {target: 's2', stoichiometry: 2}
      ],
      modifiers: [
        {target: 'm1'},
        {target: 'm2'},
        {target: 'm3'}
      ],
      assignments: {
        ode_: { expr: 'k1*s1' }
      },
      units: 'umole/h'
    });
    expect(simple.toQ()).to.be.deep.equal({
      class: 'Reaction',
      id: 'r1',
      space: 'default__',
      actors: [
        {target: 's1', stoichiometry: -1},
        {target: 's2', stoichiometry: 2}
      ],
      modifiers: [
        {target: 'm1'},
        {target: 'm2'},
        {target: 'm3'}
      ],
      assignments: {
        ode_: { expr: 'k1 * s1' }
      },
      units: 'umole/h'
    });
  });
});
