const _Module = require('./_module');
const convertExcel = require('excel-as-json').processFile; // see https://www.npmjs.com/package/excel-as-json
const _ = require('lodash');
const async = require('async');

_Module.prototype.setXLSXModuleAsync = function(callback){
  // TODO: checking arguments is required
  const options = _.defaultsDeep(this.options, {
    sheetNum: [1],
    omitRows: 0,
    waitSec: 10
  });

  // combining several scheets
  async.map(options.sheetNum, (i, cb) => {
    // this part is the way to fix bug in excel-as-json 10 second before callback
    let tableOk = false;
    setTimeout(() => {
      if(!tableOk)
        cb(new Error(`Table #${options.i} is not found in "${this.filename}" or reading table require more than ${options.waitSec} sec.`));
    }, 1000*options.waitSec);

    convertExcel(
      this.filename,
      null,
      // XXX: if scheet is not exist, then callback will not work
      // this is bag of 'excel-as-json' and not best way to repair is used
      // be carefull about sheet number in "platform.json" imports
      {sheet: i, omitEmptyFields: true},
      (err, data) => {
        tableOk = true;
        if(err){
          cb(err);
        }else{
          data.splice(0, options.omitRows); // remove rows
          let dataFiltered = data.filter((x) => x.on).map((x)=>x); // ignore rows
          cb(null, dataFiltered);
        }
      }
    );
  }, (err, dataFilteredArray) => {
    if(err){
      callback(err);
    }else{
      this.parsed = _.flatten(dataFilteredArray);
      callback(null, this);
    }
  });
};
