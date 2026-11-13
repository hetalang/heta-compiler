/*
  Entry file for Node.js
  It does not use compiled templates
*/

const {
  Builder,
  Container,
  coreItems,
  ModuleSystem,
  HetaLevelError
} = require('./entry-common');

const { Logger, Transport, StdoutTransport, StringTransport, JSONTransport } = require('./logger');

Builder._templates = require('./templates').templates;

module.exports = {
  Builder,
  Container,
  coreItems,
  ModuleSystem,
  HetaLevelError,
  
  Logger,
  Transport,
  StdoutTransport,
  StringTransport,
  JSONTransport
};
