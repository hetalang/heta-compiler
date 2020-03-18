/*
  Class describing Heta logs
*/

class _HetaLog {
  toString(){
    let errorType = this.type !== undefined
      ? `(${this.type})`
      : '';
    return `[${this.level}]: ${errorType} ${this.message}`;
  }
}

class HetaInfo extends _HetaLog {
  constructor(msg, type){
    super();
    this.message = msg;
    this.type = type;
    this.level = 'info';
  }
}

class HetaWarn extends _HetaLog {
  constructor(msg, type){
    super();
    this.message = msg;
    this.type = type;
    this.level = 'warn';
  }
}

class HetaError extends _HetaLog {
  constructor(msg, type){
    super();
    this.message = msg;
    this.type = type;
    this.level = 'error';
  }
}

class Logger {
  constructor(showLog = true){
    this._showLog = showLog;
    this._logs = [];
  }
  get logs(){
    return this._logs;
  }
  info(msg, type){
    let info = new HetaInfo(msg, type);
    if (this._showLog) console.log(info.toString());
    this._logs.push(info);
  }
  warn(msg, type){
    let warn = new HetaWarn(msg, type);
    if (this._showLog) console.log(warn.toString());
    this._logs.push(warn);
  }
  error(msg, type){
    let error = new HetaError(msg, type);
    if (this._showLog) console.log(error.toString());
    this._logs.push(error);
  }
  get hasErrors(){
    let numberOfErrors = this._logs.filter((log) => log.level === 'error');
    return numberOfErrors.length > 0;
  }
  list(){
    return this._logs.map((log) => log.toString());
  }
  toString(){
    return this.list().join('\n');
  }
  pushMany(logger = {logs: []}){
    this._logs = this._logs.concat(logger.logs);
  }
}

module.exports = Logger;
