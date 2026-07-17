'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const esbuild = require('esbuild');

const projectDir = path.resolve(__dirname, '..');
const distDir = path.join(projectDir, 'dist');
const workDir = path.join(distDir, '.sea');
const bundlePath = path.join(workDir, 'heta.cjs');
const configPath = path.join(workDir, 'sea-config.json');
const executablePath = path.join(distDir, process.platform === 'win32' ? 'heta-compiler.exe' : 'heta-compiler');
const minimumNodeMajor = 26;

const initAssetNames = [
  'index.json',
  'index.yml',
  'index0.heta',
  'index1.heta',
  'qsp-functions.heta',
  'qsp-units.heta',
  'table-ext.xlsx',
  'table.xlsx',
  'template.gitattributes',
  'template.gitignore'
];

function run(command, args) {
  const result = childProcess.spawnSync(command, args, {
    cwd: projectDir,
    stdio: 'inherit'
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${path.basename(command)} exited with code ${result.status}`);
  }
}

function smokeTest() {
  const smokeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'heta-sea-smoke-'));

  try {
    console.log('Running standalone executable smoke test...');
    run(executablePath, ['--version']);
    run(executablePath, ['help', 'build']);
    run(executablePath, ['init', '--silent', '--force', smokeDir]);
    run(executablePath, [
      'build',
      '--skip-updates',
      '--log-level=error',
      '--log-mode=never',
      smokeDir
    ]);
  } finally {
    fs.rmSync(smokeDir, { recursive: true, force: true });
  }
}

async function main() {
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor < minimumNodeMajor) {
    throw new Error(`Building the standalone executable requires Node.js ${minimumNodeMajor} or newer (current: ${process.version}).`);
  }

  fs.rmSync(workDir, { recursive: true, force: true });
  fs.mkdirSync(workDir, { recursive: true });

  await esbuild.build({
    entryPoints: [path.join(projectDir, 'bin', 'heta.js')],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node26',
    outfile: bundlePath,
    logLevel: 'info'
  });

  const assets = Object.fromEntries(initAssetNames.map((name) => [
    `init/${name}`,
    path.join(projectDir, 'bin', 'init', name)
  ]));
  const seaConfig = {
    main: bundlePath,
    mainFormat: 'commonjs',
    output: executablePath,
    disableExperimentalSEAWarning: true,
    useSnapshot: false,
    useCodeCache: false,
    assets
  };
  fs.writeFileSync(configPath, JSON.stringify(seaConfig, null, 2));

  fs.rmSync(executablePath, { force: true });
  run(process.execPath, ['--build-sea', configPath]);

  if (process.platform === 'darwin') {
    run('codesign', ['--sign', '-', executablePath]);
  }

  if (process.platform !== 'win32') {
    fs.chmodSync(executablePath, 0o755);
  }

  smokeTest();

  console.log(`Standalone executable created: ${path.relative(projectDir, executablePath)}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
}).finally(() => {
  fs.rmSync(workDir, { recursive: true, force: true });
});
