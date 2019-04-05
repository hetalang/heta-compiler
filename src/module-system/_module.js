const path = require('path');

// abstract class for different import types
class _Module{
  constructor(filename){
    this.filename = path.resolve(filename); // get abs path
  }
  getImportElements(){
    return this.parsed
      .filter((simple) => simple.action==='import');
  }
}

module.exports = _Module;
