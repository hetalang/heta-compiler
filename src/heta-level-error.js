class HetaLevelError extends Error {
  constructor(message, options = {}) {
    super(message);
    if (typeof options?.diagnosticCode !== 'string' || !options.diagnosticCode.trim()) {
      throw new TypeError('HetaLevelError requires a non-empty diagnosticCode.');
    }
    this.name = 'HetaLevelError';
    this.opt = options;
  }
}

module.exports = HetaLevelError;
