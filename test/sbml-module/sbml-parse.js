/* global mocha */
const { expect } = require('chai');
const { SBMLParse } = require('../../src/module-system/sbml-parse');
const fs = require('fs');
const path = require('path');

const sbml0Text = fs.readFileSync(path.join(__dirname, 'sbml0.xml'), 'utf8');
const master = [
  // PART 1
  { expectation: '1 + 2 + 3' },
  { expectation: 'a + b + c' },
  { expectation: '1 - 2' },
  { expectation: 'a - b' },
  { expectation: '1 * 2 * 3' },
  { expectation: '1 / 2' },
  { expectation: '-1' },
  { expectation: '-x' },
  // PART 2
  { expectation: '1 + 2 + 3 + 4' }, // <= 1 + (2 + 3) + 4
  { expectation: '1 - (2 + 3)' },
  { expectation: '1 * (2 + 3)' },
  { expectation: '1 / (2 + 3)' },
  { expectation: '-(2 + 3)' },
  { expectation: '1 + 2 + 3' }, // <= (1 + 2) + 3
  { expectation: '2 + 3 - 1' }, // <=  (2 + 3) - 1
  { expectation: '(2 + 3) * 1' },
  { expectation: '(2 + 3) / 1' },
  // PART 3
  { expectation: '1 + (-2) + (-3) + 4' }, // => 1 -2 -3 + 4 
  { expectation: '1 - (-2)' },
  { expectation: '(-2) - 1' }, // => -2 - 1
  { expectation: '-(-2)' },
  { expectation: '1 * (-2)' },
  { expectation: '(-2) * 1' },
  { expectation: '1 / (-2)' },
  { expectation: '(-2) / 1' },
  // PART 4
  { expectation: '1 + 2 * 3 + 4' },
  { expectation: '2 * 3 + 4' },
  { expectation: '1 + 2 / 3' },
  { expectation: '2 / 3 + 1' },
]

describe('test sbmlParse() operators', () => {
  let res = SBMLParse('sbml0', sbml0Text);
  console.log(res)

  res.forEach((x, i) => {
    it('Expect: ' + master[i].expectation, () => {
      expect(x).to.have.nested.property('assignments.ode_', master[i].expectation);
    });
  });
});
