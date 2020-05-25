/* global describe, it */

const { expect } = require('chai');
const { Logger, StdoutTransport } = require('../src/logger');

describe('Testing Logger', () => { 
  let logger;
  let x = [];
  let tr1 = (level, msg, opt, levelNum) => {
    let obj = { level, msg, opt, levelNum };
    x.push(obj);
  };
  let tr2 = new StdoutTransport('warn');

  it('Create logger and transport', () => {
    logger = new Logger();
    logger.addTransport(tr1);
    logger.addTransport(tr2);
  });

  it('Add info, warn, error', () => {
    logger.log('info', 'Info log');
    logger.log('warn', 'Warning log');
    logger.log('error', 'Error log');
    expect(x).to.be.lengthOf(3);
  });

  it('Add info, warn, error with short syntax', () => {
    logger.info('Info log 2');
    logger.warn('Warning log 2');
    logger.error('Error log 2');
    expect(x).to.be.lengthOf(6);
  });
});
