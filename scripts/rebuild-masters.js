const path = require('path');
const fs = require('fs-extra');
const YAML = require('js-yaml');

const { Builder } = require('../src');

const repoDir = path.resolve(__dirname, '..');
const registry = require('../test/cases-build-masters/cases-export-results.json');

async function main() {
  let stats = {
    total: 0,
    success: 0,
    failed: 0,
    filesWritten: 0,
    skipped: 0,
  };

  for (const testCase of registry) {
    for (const exportName of Object.keys(testCase.exports || {})) {
      stats.total += 1;

      const result = buildCase(testCase.case, exportName);
      if (!result.success) {
        stats.failed += 1;
        console.log(`[FAIL] ${testCase.case} / ${exportName}`);
        if (result.error && result.error.message) {
          console.log(`       ${result.error.message}`);
        }
        continue;
      }

      const outputFiles = Object.entries(result.files)
        .filter(([filePath]) => filePath.startsWith(normalizePath(`dist/${exportName}/`)));

      const masterDir = path.join(repoDir, 'cases', testCase.case, 'master', exportName);
      await fs.remove(masterDir);
      await fs.ensureDir(masterDir);

      for (const [distPath, content] of outputFiles) {
        const relativePath = distPath.slice(normalizePath(`dist/${exportName}/`).length);
        const targetPath = path.join(masterDir, relativePath);
        await fs.ensureDir(path.dirname(targetPath));
        await fs.writeFile(targetPath, content);
        stats.filesWritten += 1;
      }

      if (outputFiles.length === 0) {
        stats.skipped += 1;
      }

      stats.success += 1;
      console.log(`[OK]   ${testCase.case} / ${exportName} (${outputFiles.length} files)`);
    }
  }

  console.log('');
  console.log('Rebuild finished');
  console.log(`Total: ${stats.total}`);
  console.log(`Success: ${stats.success}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Files written: ${stats.filesWritten}`);
  console.log(`Successful exports with 0 files: ${stats.skipped}`);

}

function buildCase(caseName, exportName) {
  const caseDir = path.join(repoDir, 'cases', caseName);
  const previousCwd = process.cwd();
  const files = {};

  try {
    process.chdir(caseDir);

    const declaration = loadDeclaration(caseDir);
    declaration.export = [{ format: exportName }];

    const builder = new Builder(
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
  const jsonPath = path.join(caseDir, 'platform.json');
  const yamlPath = path.join(caseDir, 'platform.yml');

  if (fs.existsSync(jsonPath)) return fs.readJsonSync(jsonPath);
  if (fs.existsSync(yamlPath)) return YAML.load(fs.readFileSync(yamlPath, 'utf8'));

  throw new Error(`No platform declaration in ${caseDir}`);
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});