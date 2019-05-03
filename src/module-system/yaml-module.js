const fs = require('fs');
const _Module = require('./_module');
const jsYAML = require('js-yaml'); // https://www.npmjs.com/package/js-yaml
/*
_Module.prototype.setYAMLModule = function(){
  this.type = 'yml';

  let fileContent = fs.readFileSync(this.filename, 'utf8');
  this.parsed = jsYAML.safeLoad(fileContent);

  return this;
};
*/
_Module.prototype.setYAMLModuleAsync = function(callback){
  fs.readFile(this.filename, 'utf8', (err, fileContent) => {
    if(err){
      callback(err);
    }else{
      try{
        this.parsed = jsYAML.safeLoad(fileContent);
        callback(null, this);
      }catch(e){
        callback(e);
      }
    }
  });
};
