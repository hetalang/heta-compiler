/*
  Class describing Heta logs
*/
const colors = require('colors/safe');

const levels = [
  'debug', // 0
  'info', // 1
  'warn', // 2
  'error', // 3
  'crit' // 4
];

class Logger {
  /**
   * 
   * Minimal logger that forwards events to one or more transports.
   * 
   * @class Logger
   *
   * @property {Transport[]} _transports Registered transports.
   * @property {boolean} _hasErrors `true` after any `error` or `crit` event.
   */
  constructor(){
    this._transports = [];
    this._hasErrors = false;
  }
  /**
   * Adds a transport.
   * 
   * @param {Transport|function} transport Transport instance or callback.
   * 
   * @returns {Logger} Self.
   */
  addTransport(transport = () => {}){
    let checkTransport = (transport instanceof Transport)
      || typeof transport === 'function';
    if (!checkTransport)
      throw new Error('transport argument should be function or Transport instance.');
    this._transports.push(transport);

    return this;
  }
  /**
   * Removes all transports.
   *
   * @returns {void}
   */
  clearTransport(){
    this._transports = [];
  }
  /**
   * Adds a log event and sends it to all transports.
   * 
   * @param {string} level Log level: `debug`, `info`, `warn`, `error`, or `crit`.
   * @param {string} msg Log message.
   * @param {object} opt Options for transport.
   *
   * @returns {void}
   */
  log(level, msg, opt){
    let levelNum = levels.indexOf(level);
    if (levelNum < 0) {
      throw new TypeError(`Unknown logger level: "${level}"`);
    }
    if (levelNum >= 3) { // error and crit
      this._hasErrors = true;
    }

    this._transports.forEach((transport) => {
      if (transport instanceof Transport) {
        transport.analyzer(level, msg, opt, levelNum);
      } else {
        transport(level, msg, opt, levelNum);
      }
    });
  }
  /**
   * Adds a `debug` event.
   *
   * @param {string} msg Log message.
   * @param {object} opt Options for transport.
   *
   * @returns {void}
   */
  debug(msg, opt){
    this.log('debug', msg, opt);
  }
  /**
   * Adds an `info` event.

   * @param {string} msg Log message.
   * @param {object} opt Options for transport.
   *
   * @returns {void}
   */
  info(msg, opt){
    this.log('info', msg, opt);
  }
  /**
   * Adds a `warn` event.

   * @param {string} msg Log message.
   * @param {object} opt Options for transport.
   *
   * @returns {void}
   */
  warn(msg, opt){
    this.log('warn', msg, opt);
  }
  /**
   * Adds an `error` event.

   * @param {string} msg Log message.
   * @param {object} opt Options for transport.
   *
   * @returns {void}
   */
  error(msg, opt){
    this.log('error', msg, opt);
  }
  /**
   * `true` when at least one `error` or `crit` event was logged.
   */
  get hasErrors(){
    return this._hasErrors;
  }
  // should be used only for testing properties
  resetErrors(){
    this._hasErrors = false;
  }
}

class Transport {
  /**
   * Base class for log transports.
   * 
   * @class Transport
   *
   * @param {string} showLevel Minimum level to analyze.
   * 
   * @property {number} showLevelNum Numeric level threshold.
   */
  constructor(showLevel = 'info'){
    let showLevelNum = levels.indexOf(showLevel);
    if (showLevelNum < 0) {
      throw new TypeError(`Unknown logger level: "${showLevelNum}"`);
    }
    this.showLevelNum = showLevelNum;
  }
  /**
   * Handles one log event.
   *
   * @returns {void}
   */
  analyzer(){
    throw new Error('Transport is abstract class');
  }
}

class JSONTransport extends Transport{
  /**
   * Transport that stores log events as objects in an array.
   * 
   * @class JSONTransport
   * @extends Transport
   * 
   * @param {string} showLevel Minimum level to store.
   * @param {object[]} target Array to store logs.
   */
  constructor(showLevel = 'info', target = []){
    super(showLevel);
    this.target = target;
  }
  analyzer(level, msg, opt, levelNum){
    if (levelNum >= this.showLevelNum) {
      let obj = { level, msg, opt, levelNum };
      this.target.push(obj);
    }
  }
}

/**
 * Transport that writes colored log lines to stdout.
 * 
 * @class StdoutTransport
 * @extends Transport
 * 
 * @param {string} showLevel Minimum level to print.
 */
class StdoutTransport extends Transport {
  analyzer(level, msg, opt, levelNum){
    let levelColors = [
      'white',
      'blue',
      'yellow',
      'red',
      'red'
    ];
    if (levelNum >= this.showLevelNum) {
      let currentColor = levelColors[levelNum];
      let lineStart = colors[currentColor](`[${level}] `);
      console.log(lineStart + msg);
    }
  }
}

/**
 * Transport that stores formatted log lines in an array.
 * 
 * @class StringTransport
 * @extends Transport
 * 
 * @param {string} showLevel Minimum level to store.
 * @param {string[]} target Array to store formatted log lines.
 */
class StringTransport extends Transport {
  constructor(showLevel = 'info', target = []){
    super(showLevel);
    this.target = target;
  }
  analyzer(level, msg, opt, levelNum){
    if (levelNum >= this.showLevelNum) {
      let line = `[${level}]\t${msg}`;
      this.target.push(line);
    }
  }
}

module.exports = {
  Logger,
  Transport,
  JSONTransport,
  StringTransport,
  StdoutTransport
};
