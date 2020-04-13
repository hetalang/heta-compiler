
const colors = require('colors/safe');
/*
  Class describing Heta logs
*/

class _HetaLog {
  toString(useColour = true){
    if (useColour) {
      var levelString = this.color
        ? colors[this.color](`[${this.level}]`)
        : `[${this.level}]`;
    } else{
      levelString = `[${this.level}]`;
    }
    let errorType = this.type !== undefined
      ? `(${this.type})`
      : '';
    return `${levelString}: ${errorType} ${this.message}`;
  }
}

class HetaInfo extends _HetaLog {
  constructor(msg, type){
    super();
    this.message = msg;
    this.type = type;
    this.level = 'info';
    this.levelNum = 1;
    this.color = 'blue';
  }
}

class HetaWarn extends _HetaLog {
  constructor(msg, type){
    super();
    this.message = msg;
    this.type = type;
    this.level = 'warn';
    this.levelNum = 2;
    this.color = 'yellow';
  }
}

class HetaError extends _HetaLog {
  constructor(msg, type){
    super();
    this.message = msg;
    this.type = type;
    this.level = 'error';
    this.levelNum = 3;
    this.color = 'red';
  }
}

// XXX: global.showLogLevel is ugly solution but i dont know how to do this
class Logger {
  constructor(showLogLevel = global.showLogLevel || 0){
    this.showLogLevel = showLogLevel;
    this._logs = [];
  }
  get logs(){
    return this._logs;
  }
  info(msg, type){
    let info = new HetaInfo(msg, type);
    if (this.showLogLevel <= 1) console.log(info.toString());
    this._logs.push(info);
  }
  warn(msg, type){
    let warn = new HetaWarn(msg, type);
    if (this.showLogLevel <= 2) console.log(warn.toString());
    this._logs.push(warn);
  }
  error(msg, type){
    let error = new HetaError(msg, type);
    if (this.showLogLevel <= 3) console.log(error.toString());
    this._logs.push(error);
  }
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
}

module.exports = Logger;
