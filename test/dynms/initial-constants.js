/* global describe, it */
const { expect } = require('chai');
const { Builder } = require('../../src');

describe('DynMS initial mathematical constants', () => {
    it('keeps pi and e when substituting initial values', () => {
        const source = `
p1 @Record .= pi;
p2 @Record .= e;
p3 @Record .= exp(e);
`;
        const builder = new Builder({
            importModule: { type: 'heta', source: 'index.heta' }
        }, () => source, () => {}).run();

        expect(builder.container.hetaErrors()).to.be.empty;
        const model = builder.container.namespaceStorage.get('nameless').makeDynMSModel();
        const initials = Object.fromEntries(model.static.map((state) => [state.id, state.initial.expr]));

        expect(initials).to.deep.equal({
            p1: 'Pi',
            p2: 'ExponentialE',
            p3: ['Exp', 'ExponentialE']
        });
    });
});
