/*
  Class describing Heta logs
*/
const colors = require('colors/safe');

const levels = [
  'debug', // 0
  'info', // 1
  'warn', // 2
  'error', // 3
  'panic' // 4
];

class Logger {
  /**
   * 
   * Object to work with several logging transports simultaneously.
   * This class was inspired by <https://github.com/winstonjs/winston> package but much simpler.
   * 
   * @property {Transport[]} _transports storage for different log transports.
   * @property {boolean} _hasErrors Value is equal to `true` if there is at least one log of level 'error' or higher.
   */
  constructor(){
    this._transports = [];
    this._hasErrors = false;
  }
  /**
   * To attach another transport to a logger.
   * 
   * @param {Transport} transport=() => {} `Transport` instance of function.
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
   * Remove all transports from a logger.
   */
  clearTransport(){
    this._transports = [];
  }
  /**
   * To add a new log event to logger.
   * This event will be then sent to all transports.
   * 
   * @param {string} level Log level: 'debug', 'info', 'warn', 'error', 'panic'
   * @param {string} msg Log message.
   * @param {object} opt Options for transport.
   */
  log(level, msg, opt){
    let levelNum = levels.indexOf(level);
    if (levelNum < 0) {
      throw new TypeError(`Unknown logger level: "${level}"`);
    }
    if (levelNum >= 3) { // error and panic
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
   * To add a 'debug' level message to logger.
   * This is just a shortened version of the general log interface:
   * ```js
   * logger.debug('Something happens.')
   * ```
   * 
   * which is the same as 
   * ```js
   * logger.log('debug', 'Something happens.')
   * ```
   * @param {string} msg Log message.
   * @param {object} opt Options for transport.
   */
  debug(msg, opt){
    this.log('debug', msg, opt);
  }
  /**
   * To add a 'info' level message to logger.
   * This is just a shortened version of the general log interface:

   * @param {string} msg Log message.
   * @param {object} opt Options for transport.
   */
  info(msg, opt){
    this.log('info', msg, opt);
  }
  /**
   * To add a 'warn' level message to logger.
   * This is just a shortened version of the general log interface:

   * @param {string} msg Log message.
   * @param {object} opt Options for transport.
   */
  warn(msg, opt){
    this.log('warn', msg, opt);
  }
  /**
   * To add a 'error' level message to logger.
   * This is just a shortened version of the general log interface:

   * @param {string} msg Log message.
   * @param {object} opt Options for transport.
   */
  error(msg, opt){
    this.log('error', msg, opt);
  }
  /**
   * To check if there is a log event of level 'error' or higher.
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
   * Ways to analyze log events. Each transport does something with log event: prints to console, store in file, etc.
   * See also {@link Logger}.
   * 
   * @param {string} showLevel If level is equal or higher than the value it will be analyzed.
   *    Possible values: 'debug', 'info', 'warn', 'error', 'panic'
   * 
   * @property {number} showLevelNum Numeric identifier of showLevel value: 0, 1, 2, 3, 4.
   */
  constructor(showLevel = 'info'){
    let showLevelNum = levels.indexOf(showLevel);
    if (showLevelNum < 0) {
      throw new TypeError(`Unknown logger level: "${showLevelNum}"`);
    }
    this.showLevelNum = showLevelNum;
  }
  /**
   * Actions to perform when call log in parent `Logger`.
   */
  analyzer(){
    throw new Error('Transport is abstract class');
  }
}

class JSONTransport extends Transport{
  /**
   * Transport type storing everything in a JS array.
   * 
   * @extends Transport
   * 
   * @param {string} showLevel If level is equal or higher than the value it will be analyzed.
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
 * Transport type sending colored messages into console.
 * 
 * @extends Transport
 * 
 * @param {string} showLevel If level is equal or higher than the value it will be analyzed.
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
 * Transport type sending strings into array.
 * 
 * @extends Transport
 * 
 * @param {string} showLevel If level is equal or higher than the value it will be analyzed.
 * @param {object[]} target Array to store logs.
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
