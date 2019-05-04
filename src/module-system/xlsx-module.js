const _Module = require('./_module');
const convertExcel = require('excel-as-json').processFile; // see https://www.npmjs.com/package/excel-as-json
const _ = require('lodash');

_Module.prototype.setXLSXModuleAsync = function(callback){
  const options = _.defaultsDeep(this.options, {
    sheetNum: 1,
    omitRows: 0
  });
  convertExcel(
    this.filename,
    null,
    // XXX: if scheet is not exist, then callback will not work
    // this is bag of 'excel-as-json' and I have no idea how to repare it
    // be carefull about sheet number in "platform.json" imports
    //{sheet: sheet.sheetNum, omitEmptyFields: true},
    {sheet: options.sheetNum, omitEmptyFields: true},
    (err, data) => {
      console.log(data);
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
