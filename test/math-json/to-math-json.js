/* global describe, it */
const { expect } = require("chai");
const { Expression } = require("../../src/core/expression");
require('../../src/dynms/expression');
const list = require('./list.json');

describe("toMathJSON", function() {
  for (const item of list) {
    it(`convert an expression "${item.string}" to MathJSON`, () => {
      const expr = Expression.fromString(item.string);
      const mathJSON = expr.toMathJSON();
      expect(mathJSON).to.deep.equal(item.mathjson);
    });
  }
});
