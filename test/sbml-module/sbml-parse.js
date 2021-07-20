/* global describe, it */
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
  { expectation: '(-1)' },
  { expectation: '(-x)' },
  // PART 2
  { expectation: '1 + 2 + 3 + 4' }, // <= 1 + (2 + 3) + 4
  { expectation: '1 - (2 + 3)' },
  { expectation: '1 * (2 + 3)' },
  { expectation: '1 / (2 + 3)' },
  { expectation: '(-(2 + 3))' },
  { expectation: '1 + 2 + 3' }, // <= (1 + 2) + 3
  { expectation: '2 + 3 - 1' }, // <=  (2 + 3) - 1
  { expectation: '(2 + 3) * 1' },
  { expectation: '(2 + 3) / 1' },
  // PART 3
  { expectation: '1 + (-2) + (-3) + 4' }, // => 1 -2 -3 + 4 
  { expectation: '1 - (-2)' },
  { expectation: '(-2) - 1' }, // => -2 - 1
  { expectation: '(-(-2))' },
  { expectation: '1 * (-2)' },
  { expectation: '(-2) * 1' },
  { expectation: '1 / (-2)' },
  { expectation: '(-2) / 1' },
  // PART 4
  { expectation: '1 + 2 * 3 + 4' },
  { expectation: '2 * 3 + 4' },
  { expectation: '1 + 2 / 3' },
  { expectation: '2 / 3 + 1' },
  // PART 5
  { expectation: 'sin(a + 2 + 3)' },
  { expectation: 'pow(a + 2 + 3, 1 - 2)' },
  // PART 6
  { expectation: 'x / (2 * 3)' },
  { expectation: '1 + (-2)' },
  { expectation: 'x + (-y)' },
  // PART 7
  { expectation: '(a > 10 ? 666 : 0)'},
  { expectation: 'piecewise(666, a > 10, 777, a > 11, 0)'},
  { expectation: 'piecewise(666, a > 10, 777, a > 11)'}
];

describe('test sbmlParse() operators', () => {
  let res = SBMLParse('sbml0', sbml0Text);
  //console.log(res)

  res.forEach((x, i) => {
    it('Expect: ' + master[i].expectation, () => {
      expect(x).to.have.nested.property('assignments.ode_', master[i].expectation);
    });
  });
});

const sbml1Text = fs.readFileSync(path.join(__dirname, 'sbml1.xml'), 'utf8');
describe('parse speciesType', () => {
  let res = SBMLParse('sbml1', sbml1Text);
  // console.log(res);
  it('Should be of class "Component"', () => {
    expect(res[0]).to.have.property('class', 'Component');
  });
});

const sbml2Text = fs.readFileSync(path.join(__dirname, 'sbml2.xml'), 'utf8');
describe('parse units', () => {
  let res = SBMLParse('sbml2', sbml2Text);

  it('Use units from UnitDef', () => {
    expect(res[6])
      .to.have.property('units').and
      .to.be.deep.equal([{ kind: 'second', exponent: 1, multiplier: 1 }]);
  });

  it('Use base units', () => {
    expect(res[7])
      .to.have.property('units').and
      .to.be.deep.equal([{ kind: 'second', exponent: 1, multiplier: 1 }]);
  });

  it('Use units that can be simplified', () => {
    expect(res[8])
      .to.have.property('units').and
      .to.be.deep.equal([
        { kind: 'item', exponent: 1, multiplier: 1 },
        { kind: 'item', exponent: -1, multiplier: 1000 }
      ]);
  });

  it('Check different units for Species', () => {
    expect(res[2])
      .to.have.property('units').and
      .to.be.deep.equal([
        { kind: 'mole', exponent: 1, multiplier: 1 },
        { kind: 'litre', exponent: -1, multiplier: 1 }
      ]);
    expect(res[3])
      .to.have.property('units').and
      .to.be.deep.equal([
        { kind: 'mole', exponent: 1, multiplier: 1 },
        { kind: 'litre', exponent: -1, multiplier: 1e-3 }
      ]);
    expect(res[4])
      .to.have.property('units').and
      .to.be.deep.equal([
        { kind: 'mole', exponent: 1, multiplier: 1e-6 },
        { kind: 'litre', exponent: -1, multiplier: 1 }
      ]);
    expect(res[5])
      .to.have.property('units').and
      .to.be.deep.equal([
        { kind: 'mole', exponent: 1, multiplier: 1e-6 },
        { kind: 'litre', exponent: -1, multiplier: 1e-3 }
      ]);

    expect(res[9])
      .to.have.property('units').and
      .to.be.deep.equal([
        { kind: 'dimensionless', exponent: 1, multiplier: 1 }
      ]);
    expect(res[10])
      .to.have.property('units').and
      .to.be.deep.equal([
        { kind: 'dimensionless', exponent: 1, multiplier: 1 }
      ]);
  });
});
