/*
  Entry file to use precompiled templates.
*/

const {
  Builder,
  Container,
  coreItems,
  ModuleSystem,
  HetaLevelError
} = require('./entry-common');

const { Transport, StdoutTransport, StringTransport } = require('./logger');

Builder._templates = require('./compiled-templates').templates;

module.exports = {
  Builder,
  Container,
  coreItems,
  ModuleSystem,
  HetaLevelError,
  
  Transport,
  StdoutTransport,
  StringTransport
};
