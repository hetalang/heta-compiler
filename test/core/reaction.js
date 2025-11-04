/* global describe, it */
const { Reaction } = require('../../src/core/reaction');
const { expect } = require('chai');

describe('Unit tests for Reaction.', () => {
  it('Check toQ.', () => {
    let simple = (new Reaction).merge({
      id: 'r1',
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
      assignments: { ode_: 'k1*s1' },
      units: 'umole/h'
    });

    expect(simple.toQ({useUnitsExpr: true})).to.be.deep.equal({
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
      assignments: { ode_: 'k1 * s1' },
      units: 'umole/h'
    });
  });
});
