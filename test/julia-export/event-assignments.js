/* global describe, it */
const { Builder } = require('../../src');
const { expect } = require('chai');

describe('Julia event assignments', () => {
  it('uses the pre-event compartment volume for static and dynamic species', () => {
    const source = `
c1 @Compartment .= 0.5;
s1 @Species { compartment: c1, boundary: true } .= 2;
s2 @Species { compartment: c1 } .= 2;
r1 @Reaction { actors: s2 => } := 0;
e0 @DSwitcher { trigger: t >= 0.45 };
c1 [e0]= 0.2;
s1 [e0]= 0.2;
s2 [e0]= 0.3;
`;
    const builder = new Builder({
      options: {},
      importModule: { source: 'index.heta', type: 'heta' },
      export: [{ format: 'Julia' }]
    }, () => source, () => {});
    const errors = [];
    builder.logger.addTransport((level, message) => {
      if (level === 'error') errors.push(message);
    });

    builder.run();
    expect(errors, errors.join('\n')).to.be.empty;

    const model = builder.exportArray[0].makeText(true)[0].content;
    const affect = model.replace(/\r\n/g, '\n')
      .split('function nameless_e0_affect_func_')[1].split('\nend')[0];

    expect(affect).to.include('(c1,s1_,s2_,) = (0.2,0.2*c1,0.3*c1,)');
    expect(affect).to.include('c1,\n        s1_,');
    expect(affect).to.include('s2_,');
    expect(affect).not.to.include('s1*c1,');
  });
});
