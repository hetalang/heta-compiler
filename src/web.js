/*
  Entry file for web applications.
  You must run `npm run precompile` to precompile templates before using this file.
  It does not use specific Node.js features like:
  - StdoutTransport
*/

const {
  Builder,
  Container,
  coreItems,
  ModuleSystem,
  HetaLevelError
} = require('./entry-common');

const { Logger, Transport, StringTransport } = require('./logger');

// always load compiled templates
Builder._templates = require('./compiled-templates').templates;

module.exports = {
  Builder,
  Container,
  coreItems,
  ModuleSystem,
  HetaLevelError,

  Logger,
  Transport,
  StringTransport
};
