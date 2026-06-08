/* global describe, it */
const path = require('path');
const { expect } = require('chai');
const fs = require('fs-extra');
const { validateXML } = require('xmllint-wasm');

const registry = require('../cases-build-masters/cases-export-results.json');

const repoDir = path.resolve(__dirname, '../..');
const schemaPath = path.join(__dirname, 'sbml.level-2.version-4.release-1.xsd');
const mathmlRootDir = path.join(__dirname, 'mathml2');

const mathmlBundle = loadMathmlBundle(mathmlRootDir);
const schemaText = patchMathmlImport(fs.readFileSync(schemaPath, 'utf8'), mathmlBundle.entryFileName);

describe('Cases build masters SBML schema', () => {
  registry.forEach((testCase) => {
    const sbmlExport = testCase.exports?.sbml;
    if (!sbmlExport || !sbmlExport.success) return;

    sbmlExport.files.forEach((filePath) => {
      const normalizedPath = normalizePath(filePath);

      it(`${testCase.case} / sbml schema / ${normalizedPath}`, async () => {
        const absolutePath = path.join(repoDir, normalizedPath);
        const xml = fs.readFileSync(absolutePath, 'utf8');
        const virtualFileName = toVirtualFileName(testCase.case, normalizedPath);

        let result;
        try {
          result = await validateXML({
            xml: [{ fileName: virtualFileName, contents: xml }],
            schema: [{ fileName: 'sbml.level-2.version-4.release-1.xsd', contents: schemaText }],
            preload: mathmlBundle.preload,
          });
        } catch (error) {
          const message = error?.message || JSON.stringify(error);
          throw new Error(`SBML schema runtime error for ${normalizedPath}: ${message}`);
        }

        if (!result.valid) {
          const details = result.errors
            .map((error) => {
              const loc = error.loc
                ? `${error.loc.fileName}:${error.loc.lineNumber}`
                : normalizedPath;
              return `${loc} ${error.message}`;
            })
            .join('; ');
          throw new Error(`SBML schema validation failed for ${normalizedPath}: ${details}`);
        }

        expect(result.valid).to.equal(true);
      });
    });
  });
});

function patchMathmlImport(schema, mathmlSchemaLocation) {
  return schema.replace(
    /schemaLocation="http:\/\/www\.w3\.org\/Math\/XMLSchema\/mathml2\/mathml2\.xsd"/,
    `schemaLocation="${mathmlSchemaLocation}"`
  );
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function toVirtualFileName(caseName, filePath) {
  return `${caseName}_${path.basename(filePath)}`.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function loadMathmlBundle(rootDir) {
  const files = [];
  walkDir(rootDir, files);

  const schemaFiles = files.filter((filePath) => filePath.endsWith('.xsd'));
  const relPaths = schemaFiles.map((filePath) => path.relative(rootDir, filePath).replace(/\\/g, '/'));
  const fileNameMap = new Map(
    relPaths.map((relPath) => [relPath, `mathml2__${relPath.replace(/\//g, '__')}`])
  );

  const preload = schemaFiles.map((filePath) => {
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const rewritten = rewriteSchemaLocations(fs.readFileSync(filePath, 'utf8'), relPath, fileNameMap);

    return {
      fileName: fileNameMap.get(relPath),
      contents: rewritten,
    };
  });

  return {
    entryFileName: fileNameMap.get('mathml2.xsd'),
    preload,
  };
}

function rewriteSchemaLocations(schemaText, sourceRelPath, fileNameMap) {
  return schemaText.replace(/schemaLocation\s*=\s*"([^"]+)"/g, (full, ref) => {
    if (/^https?:\/\//i.test(ref)) return full;

    const targetRelPath = path.posix.normalize(path.posix.join(path.posix.dirname(sourceRelPath), ref));
    const mapped = fileNameMap.get(targetRelPath);
    if (!mapped) return full;

    return full.replace(ref, mapped);
  });
}

function walkDir(dirPath, accumulator) {
  fs.readdirSync(dirPath).forEach((entry) => {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath, accumulator);
      return;
    }

    accumulator.push(fullPath);
  });
}
