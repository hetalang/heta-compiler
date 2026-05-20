/* global describe, it */
const { expect } = require('chai');
const fs = require('fs');

let { Builder } = require('../../src');

// to generate expected output, run 
// heta build test/dynms --source=input-5.heta --export=DynMS
let testCases = [
    { input: 'input-01.heta', output: 'output-01.json' },
    { input: 'input-02.heta', output: 'output-02.json' },
    { input: 'input-03.heta', output: 'output-03.json' },
    { input: 'input-04.heta', output: 'output-04.json' },
    { input: 'input-05.heta', output: 'output-05.json' },
    { input: 'input-06.heta', output: 'output-06.json' },
    { input: 'input-07.heta', output: 'output-07.json' },
    { input: 'input-08.heta', output: 'output-08.json' },
    { input: 'input-09.heta', output: 'output-09.json' }
];

describe('DynMS test sets', () => {
    for (let testCase of testCases) {
        it(`Test case ${testCase.input}`, () => {
            let declaration = {
                importModule: { type: 'heta', source: `test/dynms/${testCase.input}` }
            };
            let b = new Builder(declaration, fs.readFileSync, () => {}).run();

            let ns = b.container.namespaceStorage.get('nameless');
            let generated = ns.makeDynMSModel();

            let expected = require(`./${testCase.output}`);
            expect(_normalize(generated)).to.deep.equal(expected);
        });
    }
});

function _normalize(x) {
    return JSON.parse(JSON.stringify(x));
}
