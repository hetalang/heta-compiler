const _Module = require('./_module');
const convertExcel = require('excel-as-json').processFile; // see https://www.npmjs.com/package/excel-as-json
const _ = require('lodash');

_Module.prototype.setXLSXModuleAsync = function(callback){
  const options = _.defaultsDeep(this.options, {
    sheetNum: 1,
    omitRows: 0
  });
  // this part is the way to fix bug in excel-as-json 10 second before callback
  let tableOk = false;
  let waitSec = 10;
  setTimeout(() => {
    if(!tableOk)
      callback(new Error(`Table #${options.sheetNum} is not found in "${this.filename}" or reading table require more than ${waitSec} sec.`));
  }, 1000*waitSec);
  convertExcel(
    this.filename,
    null,
    // XXX: if scheet is not exist, then callback will not work
    // this is bag of 'excel-as-json' and not best way to repair is used
    // be carefull about sheet number in "platform.json" imports
    {sheet: options.sheetNum, omitEmptyFields: true},
    (err, data) => {
      tableOk = true;
      if(err){
        callback(err);
      }else{
        data.splice(0, options.omitRows); // remove rows
        let dataFiltered = data
          .filter((x) => x.on) // ignore rows
          .map((x) => x);

        this.parsed = dataFiltered;
        callback(null, this);
      }
    }
  );
};
