// preparation of Ajv

const Ajv = require('ajv/dist/2020');

// strictSchema: false — allows legacy `definitions` keyword used in component schemas;
// strictTypes stays true (default) — Infinity/NaN are rejected for type:"number"
const ajv = new Ajv({ allErrors: true, useDefaults: true, strictSchema: false });
require('ajv-errors')(ajv);
ajv.addKeyword({ keyword: 'example' });

module.exports = { ajv };
