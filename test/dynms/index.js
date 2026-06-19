/* global describe, it */
const { expect } = require('chai');
const fs = require('fs');

let { Builder } = require('../../src');

// to generate expected output, run 
// heta build test/dynms --source=input-10.heta --export=DynMS
let testCases = [
    { input: 'input-01.heta', output: 'output-01.json' },
    { input: 'input-02.heta', output: 'output-02.json' },
    { input: 'input-03.heta', output: 'output-03.json' },
    { input: 'input-04.heta', output: 'output-04.json' },
    { input: 'input-05.heta', output: 'output-05.json' },
    { input: 'input-06.heta', output: 'output-06.json' },
    { input: 'input-07.heta', output: 'output-07.json' },
    { input: 'input-08.heta', output: 'output-08.json' },
    { input: 'input-09.heta', output: 'output-09.json' },
    { input: 'input-10.heta', output: 'output-10.json' },
    { input: 'input-11.heta', output: 'output-11.json' },
    { input: 'input-12.heta', output: 'output-12.json' },
    { input: 'input-13.heta', output: 'output-13.json' },
    { input: 'input-14.heta', output: 'output-14.json' },
    { input: 'input-15.heta', output: 'output-15.json' },
    { input: 'input-16.heta', output: 'output-16.json' },
    { input: 'input-17.heta', output: 'output-17.json' },
    { input: 'input-18.heta', output: 'output-18.json' },
    { input: 'input-19.heta', output: 'output-19.json' },
    { input: 'input-20.heta', output: 'output-20.json' },
    { input: 'input-21.heta', output: 'output-21.json' },
    { input: 'input-22.heta', output: 'output-22.json' },
    { input: 'input-23.heta', output: 'output-23.json' },
    { input: 'input-24.heta', output: 'output-24.json' },
    { input: 'input-25.heta', output: 'output-25.json' },
    { input: 'input-26.heta', output: 'output-26.json' },
    { input: 'input-27.heta', output: 'output-27.json' },
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
