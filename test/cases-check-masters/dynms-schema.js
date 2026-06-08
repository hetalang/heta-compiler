/* global describe, it */
const path = require('path');
const { expect } = require('chai');
const fs = require('fs-extra');
const Ajv2020 = require('ajv/dist/2020');

const registry = require('../cases-build-masters/cases-export-results.json');

const repoDir = path.resolve(__dirname, '../..');
const schemaPath = path.join(repoDir, 'src', 'dynms', 'dynms.schema.json');

const ajv = new Ajv2020({
  allErrors: true,
  useDefaults: true,
  strict: false,
  validateFormats: false,
});
require('ajv-errors')(ajv);
ajv.addKeyword({ keyword: 'example' });

const schema = fs.readJsonSync(schemaPath);
const validateDynms = ajv.compile(schema);

describe('Cases build masters DynMS schema', () => {
  registry.forEach((testCase) => {
    const dynmsExport = testCase.exports?.dynms;
    if (!dynmsExport || !dynmsExport.success) return;

    dynmsExport.files.forEach((filePath) => {
      const normalizedPath = normalizePath(filePath);

      it(`${testCase.case} / dynms schema / ${normalizedPath}`, () => {
        const absolutePath = path.join(repoDir, normalizedPath);
        const doc = fs.readJsonSync(absolutePath);
        const valid = validateDynms(doc);

        if (!valid) {
          const details = (validateDynms.errors || [])
            .map((error) => `${error.instancePath || '/'} ${error.message}`)
            .join('; ');
          throw new Error(`DynMS schema validation failed for ${normalizedPath}: ${details}`);
        }

        expect(valid).to.equal(true);
      });
    });
  });
});

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}
