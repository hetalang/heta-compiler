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
  constructor(showLogLevel = 'info'){
    this.showLogLevel = showLogLevel;
    this._transports = [];
    this._hasErrors = false;
  }
  addTransport(transport = () => {}){
    let checkTransport = (transport instanceof Transport)
      || typeof transport === 'function';
    if (!checkTransport)
      throw new Error('transport argument should be function or Transport instance.');
    this._transports.push(transport);

    return this;
  }
  clearTransport(){
    this._transports = [];
  }
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
  debug(msg, opt){
    this.log('debug', msg, opt);
  }
  info(msg, opt){
    this.log('info', msg, opt);
  }
  warn(msg, opt){
    this.log('warn', msg, opt);
  }
  error(msg, opt){
    this.log('error', msg, opt);
  }
  get hasErrors(){
    return this._hasErrors;
  }
  resetErrors(){ // should be used only for testing properties
    this._hasErrors = false;
  }
}

class Transport {
  constructor(showLevel = 'info'){
    let showLevelNum = levels.indexOf(showLevel);
    if (showLevelNum < 0) {
      throw new TypeError(`Unknown logger level: "${showLevelNum}"`);
    }
    this.showLevelNum = showLevelNum;
  }
  analyzer(){
    throw new Error('Transport is abstract class');
  }
}

class JSONTransport extends Transport{
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
