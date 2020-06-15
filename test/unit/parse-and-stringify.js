/* global describe, it*/
const { expect } = require('chai');
const { Unit } = require('../../src/core/unit');

const correctUnits = [
  {str0: 'L', str: 'L', hash: '_L', tex: 'L', html: 'L'},
  {str0: 'mg', str: 'mg', hash: '_mg', tex: 'mg', html: 'mg'},
  {str0: 'M', str: 'M', hash: '_M', tex: 'M', html: 'M'},
  {str0: 'nM', str: 'nM', hash: '_nM', tex: 'nM', html: 'nM'},
  {str0: 'nM2', str: 'nM^2', hash: '_nM2', tex: 'nM^{2}', html: 'nM<sup>2</sup>'},
  {str0: 'L/mg', str: 'L/mg', hash: '__mg_L', tex: '\\frac{L}{mg}', html: 'L/mg'},
  {str0: 'L*mg', str: 'L*mg', hash: '_mg_L', tex: 'L \\cdot mg', html: 'L&times;mg'},
  {str0: 'mg^2/L^3', str: 'mg^2/L^3', hash: '_mg2__L3', tex: '\\frac{mg^{2}}{L^{3}}', html: 'mg<sup>2</sup>/L<sup>3</sup>'},
  {str0: 'mg2/L3', str: 'mg^2/L^3', hash: '_mg2__L3', tex: '\\frac{mg^{2}}{L^{3}}', html: 'mg<sup>2</sup>/L<sup>3</sup>'},
  {str0: 'mg/L/s', str: 'mg/L/s', hash: '__s_mg__L', tex: '\\frac{mg}{L \\cdot s}', html: 'mg/L/s'},
  {str0: 'm^1.33/kg^2.2', str: 'm^1.33/kg^2.2', hash: '_m1_33__kg2_2', tex: '\\frac{m^{1.33}}{kg^{2.2}}', html: 'm<sup>1.33</sup>/kg<sup>2.2</sup>'},
  {str0: '1/L', str: '1/L', hash: '__L', tex: '\\frac{1}{L}', html: '1/L'},
  {str0: 'uM*L', str: 'uM*L', hash: '_uM_L', tex: 'uM \\cdot L', html: 'uM&times;L'},
  {str0: 'L/cm^2/ h', str: 'L/cm^2/h', hash: '__h__cm2_L', tex: '\\frac{L}{cm^{2} \\cdot h}', html: 'L/cm<sup>2</sup>/h'}
];

describe('Testing correct units.', () => {
  correctUnits.forEach((x) => {
    describe(`Parsing "${x.str0}"`, () => {
      let unit;

      it('No Errors when parsing.', () => {
        unit = Unit.parse(x.str0);
      });

      it('toString(): equal to initial string: ' + x.str, () => {
        expect(unit.toString()).to.be.equal(x.str);
      });

      it('toHash(): equal to correct hash: ' + x.hash, () => {
        expect(unit.toHash()).to.be.equal(x.hash);
      });

      it('toTex(): equal to correct Tex: ' + x.tex, () => {
        expect(unit.toTex()).equal(x.tex);
      });

      it('toHTML(): equal to correct HTML: ' + x.html, () => {
        expect(unit.toHTML()).equal(x.html);
      });

    });
  });
});
