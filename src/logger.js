
const colors = require('colors/safe');
/*
  Class describing Heta logs
*/

const levels = [
  'debug', // 0
  'info', // 1
  'warn', // 2
  'error' // 3
];

class Logger {
  constructor(showLogLevel = 'info'){
    this.showLogLevel = showLogLevel;
    this._transports = [];
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

  /*
  get hasErrors(){
    let numberOfErrors = this._logs.filter((log) => log.level === 'error');
    return numberOfErrors.length > 0;
  }
  list(useColour = true){
    return this._logs
      .map((log) => log.toString(useColour));
  }
  toString(useColour = true){
    return this.list(useColour).join('\n');
  }
  pushMany(logger = {logs: []}){
    this._logs = this._logs.concat(logger.logs);
  }
  reset(){
    this._logs = [];
  }
  */
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
  constructor(showLevel = 'info'){
    super(showLevel);
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
      'red'
    ];
    if (levelNum >= this.showLevelNum) {
      let currentColor = levelColors[levelNum];
      let lineStart = colors[currentColor](`[${level}] `);
      console.log(lineStart + msg);
    }
  }
}

module.exports = {
  Logger,
  Transport,
  JSONTransport,
  //stringTransport,
  StdoutTransport
};
