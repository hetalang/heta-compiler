const ID_REGEXP = /^[a-zA-Z][a-zA-Z0-9_]*$/;

const RESERVED_WORDS = [
  'include', 'block', 'namespace', 'abstract', 'concrete', 'begin', 'end',
  'NaN', 'Infinity', 'exponentiale', 'pi', 'true', 'false', 'null'
];

const RESERVED_WORD_SET = new Set(RESERVED_WORDS);

function isValidId(value) {
  return typeof value === 'string' && ID_REGEXP.test(value);
}

function isReservedWord(value) {
  return RESERVED_WORD_SET.has(value);
}

module.exports = { ID_REGEXP, RESERVED_WORDS, isValidId, isReservedWord };
