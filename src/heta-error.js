
// compilation error 5
// error in export
class ExportError extends Error {}
ExportError.prototype.name = 'ExportError';

module.exports = {
  ExportError
};
