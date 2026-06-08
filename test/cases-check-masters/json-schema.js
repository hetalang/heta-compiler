/* global describe, it */
const path = require('path');
const { expect } = require('chai');
const fs = require('fs-extra');
const Ajv2020 = require('ajv/dist/2020');

const registry = require('../cases-build-masters/cases-export-results.json');

const repoDir = path.resolve(__dirname, '../..');
const schemaPath = path.join(repoDir, 'src', 'json-export', 'heta.json.schema.json');

const ajv = new Ajv2020({
  allErrors: true,
  useDefaults: true,
  strict: false,
  validateFormats: false,
});
require('ajv-errors')(ajv);
ajv.addKeyword({ keyword: 'example' });

const schema = fs.readJsonSync(schemaPath);
const validateJsonExport = ajv.compile(schema);

describe('Cases build masters JSON schema', () => {
  registry.forEach((testCase) => {
    const canonicalExport = testCase.exports?.canonical;
    if (!canonicalExport || !canonicalExport.success) return;

    const jsonFiles = canonicalExport.files
      .map(normalizePath)
      .filter((p) => p.endsWith('/master/json/output.heta.json'));

    jsonFiles.forEach((filePath) => {
      it(`${testCase.case} / json schema / ${filePath}`, () => {
        const absolutePath = path.join(repoDir, filePath);
        const doc = fs.readJsonSync(absolutePath);
        const valid = validateJsonExport(doc);

        if (!valid) {
          const details = (validateJsonExport.errors || [])
            .map((error) => `${error.instancePath || '/'} ${error.message}`)
            .join('; ');
          throw new Error(`JSON schema validation failed for ${filePath}: ${details}`);
        }

        expect(valid).to.equal(true);
      });
    });
  });
});

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}
