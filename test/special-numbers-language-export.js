/* global describe, it */
const { expect } = require('chai');
const { Builder } = require('../src');
const { Expression } = require('../src/core/expression');
require('../src/julia-export/expression');
require('../src/matlab-export/expression');
require('../src/mrgsolve-export/expression');
require('../src/dbsolve-export/expression');

describe('Special numbers in language exports', () => {
  it('uses target-language literals in expressions', () => {
    const positive = Expression.fromString('Infinity');
    const negative = Expression.fromString('-Infinity');
    const invalid = Expression.fromString('NaN');

    expect(positive.toJuliaString()).to.equal('Inf');
    expect(negative.toJuliaString()).to.equal('-Inf');
    expect(invalid.toJuliaString()).to.equal('NaN');
    expect(positive.toMatlabString()).to.equal('Inf');
    expect(negative.toMatlabString()).to.equal('-Inf');
    expect(invalid.toMatlabString()).to.equal('NaN');
    expect(positive.toCString()).to.equal('INFINITY');
    expect(negative.toCString()).to.equal('-INFINITY');
    expect(invalid.toCString()).to.equal('NAN');
    expect(positive.toSLVString()).to.equal('1.7976931348623157e+308');
    expect(negative.toSLVString()).to.equal('-1.7976931348623157e+308');
    expect(invalid.toSLVString()).to.equal('1.7976931348623157e+308');
  });

  it('uses target-language literals for constants', () => {
    const builder = new Builder({
      id: 'special-numbers', builderVersion: '*', options: {},
      importModule: { type: 'heta', source: 'unused.heta' }, export: []
    });
    builder.container.loadMany([
      { id: 'positive', class: 'Const', num: Infinity },
      { id: 'negative', class: 'Const', num: -Infinity },
      { id: 'invalid', class: 'Const', num: NaN }
    ]);

    const getText = (format) => new builder.exportClasses[format]().makeText().map((file) => file.content).join('\n');

    expect(getText('julia')).to.include('Inf,-Inf,NaN,');
    expect(getText('matlab')).to.include('p(1) = Inf;').and.include('p(2) = -Inf;').and.include('p(3) = NaN;');
    expect(getText('simbio')).to.include("'Value', Inf").and.include("'Value', -Inf").and.include("'Value', NaN");
    expect(getText('mrgsolve')).to.include('positive : Inf :').and.include('negative : -Inf :').and.include('invalid : NaN :');
    expect(getText('slv')).to.include('positive = 1.7976931348623157e+308;').and.include('negative = -1.7976931348623157e+308;').and.include('invalid = 1.7976931348623157e+308;');
    expect(getText('dbsolve')).to.include('positive = 1.7976931348623157e+308;').and.include('negative = -1.7976931348623157e+308;').and.include('invalid = 1.7976931348623157e+308;');
  });
});
