
// compilation step 4
// error for lost references
class BindingError extends Error {
  constructor(index, diagnostics = [], message, filename, lineNumber){
    let indexedMessage = `(${index}) ${message}`
      + diagnostics.map((x) => '\n\t' + x).join('');
    super(indexedMessage, filename, lineNumber);
    this.index = index;
  }
}
BindingError.prototype.name = 'BindingError';

// compilation error 5
// error in export
class ExportError extends Error {}
ExportError.prototype.name = 'ExportError';

// converts {id: 'k1', space: 'one'} => 'one::k1'
function getIndexFromQ(q = {}){
  if(q.space!==undefined){
    return `${q.space}::${q.id}`;
  }else{
    return q.id;
  }
}

module.exports = {
  BindingError,
  ExportError
};
