function jsonSpecialNumberReplacer(key, value) {
  if (key !== 'num') return value;
  if (value === Infinity) return 'Infinity';
  if (value === -Infinity) return '-Infinity';
  if (Number.isNaN(value)) return 'NaN';
  return value;
}

module.exports = { jsonSpecialNumberReplacer };
