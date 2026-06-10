/* global describe, it */
const path = require('path');
const { expect } = require('chai');
const fs = require('fs-extra');
const YAML = require('js-yaml');

const { Builder } = require('../../src');

const repoDir = path.resolve(__dirname, '../..');
const registry = require('./cases-export-results.json');

describe('Cases build masters', () => {
  registry.forEach((testCase) => {
    Object.entries(testCase.exports).forEach(([exportName, expected]) => {
      it(`${testCase.case} / ${exportName}`, () => {
        let result = buildCase(testCase.case, exportName);

        expect(result.success).to.equal(expected.success);
        if (!expected.success) return;

        let expectedFiles = expected.files.map(normalizePath).sort();
        let actualFiles = Object.keys(result.files)
          .filter((x) => x.startsWith(normalizePath(`dist/${exportName}/`)))
          .map((x) => toMasterPath(testCase.case, exportName, x))
          .sort();

        expect(actualFiles).to.deep.equal(expectedFiles);

        expectedFiles.forEach((file) => {
          let suffix = file.split(normalizePath(`cases/${testCase.case}/master/${exportName}/`))[1];
          let actual = result.files[normalizePath(`dist/${exportName}/${suffix}`)];
          let expectedContent = fs.readFileSync(path.join(repoDir, file));

          expect(normalizeContent(exportName, actual, file)).to.deep.equal(
            normalizeContent(exportName, expectedContent, file)
          );
        });
      });
    });
  });
});

function buildCase(caseName, exportName) {
  let caseDir = path.join(repoDir, 'cases', caseName);
  let previousCwd = process.cwd();
  let files = {};

  try {
    process.chdir(caseDir);

    let declaration = loadDeclaration(caseDir);
    declaration.export = [{ format: exportName }];

    let builder = new Builder(
      declaration,
      fs.readFileSync,
      (filePath, content) => {
        files[normalizePath(filePath)] = Buffer.from(content);
      }
    ).run();

    return { success: !builder.logger.hasErrors, files };
  } catch (error) {
    return { success: false, files, error };
  } finally {
    process.chdir(previousCwd);
  }
}

function loadDeclaration(caseDir) {
  let jsonPath = path.join(caseDir, 'platform.json');
  let yamlPath = path.join(caseDir, 'platform.yml');

  if (fs.existsSync(jsonPath)) return fs.readJsonSync(jsonPath);
  if (fs.existsSync(yamlPath)) return YAML.load(fs.readFileSync(yamlPath, 'utf8'));

  throw new Error(`No platform declaration in ${caseDir}`);
}

function normalizeContent(exportName, content, filePath) {
  let text = Buffer.isBuffer(content) ? content.toString('utf8') : String(content);

  if (filePath.endsWith('.json')) {
    return normalizeJson(JSON.parse(text));
  }

  if (exportName === 'sbml') {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/<hetalang:hasMeta\b[^>]*>.*?<\/hetalang:hasMeta>/g, '<hetalang:hasMeta/>')
      .trim();
  }

  return text.replace(/\r\n/g, '\n').trim();
}

function normalizeJson(value) {
  if (Array.isArray(value)) return value.map(normalizeJson);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !['created', 'generator'].includes(key))
      .map(([key, item]) => [key, normalizeJson(item)])
  );
}

function toMasterPath(caseName, exportName, distPath) {
  let prefix = normalizePath(`dist/${exportName}/`);
  return normalizePath(`cases/${caseName}/master/${exportName}/${distPath.slice(prefix.length)}`);
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}
