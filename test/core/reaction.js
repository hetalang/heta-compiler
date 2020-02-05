/* global describe, it */
const { Reaction } = require('../../src/core/reaction');
const { expect } = require('chai');

describe('Unit tests for Reaction.', () => {
  it('Check toQ.', () => {
    let simple = (new Reaction).merge({
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
    simple._id = 'r1';

    expect(simple.toQ()).to.be.deep.equal({
      class: 'Reaction',
      id: 'r1',
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
