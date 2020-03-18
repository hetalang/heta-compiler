
// compilation step 3
// error for matching heta schema
class ValidationError extends Error {
  constructor(q, diagnostics = [], message, filename, lineNumber){
    let index = getIndexFromQ(q);
    let indexedMessage = `(${index}) ${message}\n`
      + diagnostics
        .map((x, i) => `\t${i+1}. ${x.dataPath} ${x.message}`)
        .join('\n');
    super(indexedMessage, filename, lineNumber);
    this.index = index;
  }
}
ValidationError.prototype.name = 'ValidationError';

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
  ValidationError,
  BindingError,
  ExportError
};
