/* global describe, it */
const { Builder } = require('../../src');
const { expect } = require('chai');

describe('mrgsolve event assignments', () => {
  it('evaluates event values before changing static and dynamic states', () => {
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
e1 @TimeSwitcher { start: 0.8 };
x [e1]= y;
y [e1]= x;
`;
    const builder = new Builder({
      options: {},
      importModule: { source: 'index.heta', type: 'heta' },
      export: [{ format: 'Mrgsolve' }]
    }, () => source, () => {});
    const errors = [];
    builder.logger.addTransport((level, message) => {
      if (level === 'error') errors.push(message);
    });

    builder.run();
    expect(errors, errors.join('\n')).to.be.empty;

    const model = builder.exportArray[0].makeText()[0].content.replace(/\r\n/g, '\n');
    const events = model.split('$EVENT')[1].split('$TABLE')[0];
    const table = model.split('$TABLE')[1];
    const timed = events.split('// e1 //')[1].split('// e0 //')[0];
    const conditional = events.split('// e0 //')[1];

    expect(model).to.include('bool e0__trigger__ = (SOLVERTIME >= 0.45);');
    expect(conditional).to.include('double e0__next_2__ = 0.2 * c1;');
    expect(conditional).to.include('double e0__next_3__ = 0.3 * c1;');
    expect(conditional).to.include('s1_amt_ = e0__next_2__;');
    expect(conditional).to.include('evt_s2_amt__.amt = e0__next_3__;');
    expect(conditional.indexOf('double e0__next_5__ = x;'))
      .to.be.lessThan(conditional.indexOf('x = e0__next_4__;'));
    expect(timed.indexOf('double e1__next_2__ = x;'))
      .to.be.lessThan(timed.indexOf('x = e1__next_1__;'));
    expect(table).to.include('s1 = s1_amt_ / c1;');
  });
});
