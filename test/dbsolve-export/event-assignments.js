/* global describe, it */
const { Builder } = require('../../src');
const { expect } = require('chai');

describe('DBSolve event assignments', () => {
  it('evaluates each event assignment from the pre-event state', () => {
    const source = `
c1 @Compartment .= 0.5;
s1 @Species { compartment: c1, boundary: true } .= 2;
s2 @Species { compartment: c1 } .= 2;
r1 @Reaction { actors: s2 => } := 0;
x @Record .= 1;
y @Record .= 2;
e0 @DSwitcher { trigger: t >= 0.45 };
c1 [e0]= 0.2;
s1 [e0]= 0.2;
s2 [e0]= 0.3;
x [e0]= y;
y [e0]= x;
e1 @CSwitcher { trigger: t - 0.6 };
x [e1]= y;
y [e1]= x;
`;
    const builder = new Builder({
      options: {},
      importModule: { source: 'index.heta', type: 'heta' },
      export: [{ format: 'DBSolve' }]
    }, () => source, () => {});
    const errors = [];
    builder.logger.addTransport((level, message) => {
      if (level === 'error') errors.push(message);
    });

    builder.run();
    expect(errors, errors.join('\n')).to.be.empty;

    const model = builder.exportArray[0].makeText()[0].content.replace(/\r\n/g, '\n');
    const discrete = model.split('//! Discrete events')[1].split('//! Continuous events')[0];
    const continuous = model.split('//! Continuous events')[1].split('\n#')[0];

    expect(discrete).to.include('e0__next_2__ = 0.2 * c1;');
    expect(discrete).to.include('e0__next_3__ = 0.3 * c1 - s2 * c1 + s2_offset__;');
    expect(discrete).to.include('s1_amt__ = e0__next_2__;');
    expect(discrete).to.include('s2_offset__ = e0__next_3__;');
    expect(discrete.indexOf('e0__next_5__ = x;')).to.be.lessThan(discrete.indexOf('x = e0__next_4__;'));
    expect(continuous.indexOf('e1__next_2__ = x;')).to.be.lessThan(continuous.indexOf('x = e1__next_1__;'));
  });
});
