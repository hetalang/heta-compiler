class HetaLevelError extends Error {
  constructor(message) {
    super(message);
    this.name = 'HetaLevelError';
  }
}

module.exports = HetaLevelError;
