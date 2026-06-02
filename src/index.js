/*
  Entry file for Node.js applications.
  Other variants are: web.js, browser.js (deprecated).
*/

const { Builder } = require('./builder');
const Container = require('./container');
const coreItems = require('./container/core-items');
const ModuleSystem = require('./module-system');
const { Transport, StdoutTransport, StringTransport } = require('./logger');
const HetaLevelError = require('./heta-level-error');

// XXX: maybe this is bad solution because pkg will load both raw and compiled templates, 
// but it is not required
const { HETA_TEMPLATES_MODE } = process.env;
let templatesPath = HETA_TEMPLATES_MODE && HETA_TEMPLATES_MODE.toLowerCase() === 'raw'
  ? './templates'           // raw templates
  : './compiled-templates'; // compiled templates

// load templates, display errors
try {
  Builder._templates = require(templatesPath).templates;
} catch (error) {
  throw new Error(`Failed to load templates from "${templatesPath}". Possibly the templates are not compiled. Compile them with \`npm run precompile\` or set the environment variable \`HETA_TEMPLATES_MODE=raw\`. Original error: ${error.message}`);
}

// case-insensitive export names
Builder._exportClasses = {
  dbsolve: require('./dbsolve-export'),
  yaml: require('./yaml-export'),
  json: require('./json-export'),
  canonical: require('./canonical-export'),
  hetacode: require('./heta-code-export'),
  sbml: require('./sbml-export'),
  slv: require('./slv-export'),
  mrgsolve: require('./mrgsolve-export'),
  simbio: require('./simbio-export'),
  table: require('./table-export'),
  xlsx: require('./xlsx-export'),
  anotherxlsx: require('./another-xlsx-export'),
  matlab: require('./matlab-export'),
  julia: require('./julia-export'),
  dot: require('./dot-export'),
  summary: require('./summary-export'),
  mt: require('./mt-export'),
  dynms: require('./dynms-export'),
};

module.exports = {
  Builder,
  Container,
  coreItems,
  ModuleSystem,
  Transport,
  HetaLevelError,
  StdoutTransport,
  StringTransport,
};
