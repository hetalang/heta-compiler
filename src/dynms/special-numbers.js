function toMathJSONNumber(value) {
  if (Number.isNaN(value)) return { num: 'NaN' };
  if (value === Infinity) return { num: '+Infinity' };
  if (value === -Infinity) return { num: '-Infinity' };
  return value;
}

module.exports = { toMathJSONNumber };
