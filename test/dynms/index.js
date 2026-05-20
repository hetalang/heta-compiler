/* global describe, it */
const { expect } = require('chai');
const fs = require('fs');

let { Builder } = require('../../src');

// to generate expected output, run 
// heta build test/dynms --source=input-5.heta --export=DynMS
let testCases = [
    { input: 'input-1.heta', output: 'output-1.json' },
    { input: 'input-2.heta', output: 'output-2.json' },
    { input: 'input-3.heta', output: 'output-3.json' },
    { input: 'input-4.heta', output: 'output-4.json' },
    { input: 'input-5.heta', output: 'output-5.json' },
    { input: 'input-6.heta', output: 'output-6.json' },
    { input: 'input-7.heta', output: 'output-7.json' }
];

describe('DynMS test sets', () => {
    for (let testCase of testCases) {
        it(`Test case ${testCase.input}`, () => {
            let declaration = {
                importModule: { type: 'heta', source: `test/dynms/${testCase.input}` }
            };
            let b = new Builder(declaration, fs.readFileSync, () => {}).run();

            let ns = b.container.namespaceStorage.get('nameless');
            let generated = ns.getDynMSModel();

            let expected = require(`./${testCase.output}`);
            expect(_normalize(generated)).to.deep.equal(expected);
        });
    }
});

function _normalize(x) {
    return JSON.parse(JSON.stringify(x));
}
