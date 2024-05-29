/* global describe, it*/
const { expect } = require('chai');
const { Unit } = require('../../src/core/unit');

const correctUnits = [
  {str0: 1, str: 'dimensionless', hash: '_dimensionless', tex: '1', html: '1'},
  {str0: '1*1', str: 'dimensionless', hash: '_dimensionless', tex: '1', html: '1'},
  {str0: '1/1', str: 'dimensionless', hash: '_dimensionless', tex: '1', html: '1'},
  {str0: '1^2', str: 'dimensionless', hash: '_dimensionless', tex: '1', html: '1'},
  {str0: '(1e-3)', str: '(1e-3 dimensionless)', hash: '_1n3dimensionless', tex: '(1e-3)', html: '(1e-3)'},
  {str0: '1/(1e-3)', str: '1/(1e-3 dimensionless)', hash: '__1n3dimensionless', tex: '\\frac{1}{(1e-3)}', html: '1/(1e-3)'},
  {str0: 'L', str: 'L', hash: '_L', tex: 'L', html: 'L'},
  {str0: '1*mg', str: 'mg', hash: '_mg', tex: 'mg', html: 'mg'},
  {str0: 'M', str: 'M', hash: '_M', tex: 'M', html: 'M'},
  {str0: 'nM', str: 'nM', hash: '_nM', tex: 'nM', html: 'nM'},
  {str0: 'nM^2', str: 'nM^2', hash: '_nM2', tex: 'nM^{2}', html: 'nM<sup>2</sup>'},
  {str0: 'L/mg', str: 'L/mg', hash: '__mg_L', tex: '\\frac{L}{mg}', html: 'L/mg'},
  {str0: 'L*mg', str: 'L*mg', hash: '_mg_L', tex: 'L \\cdot mg', html: 'L&times;mg'},
  {str0: 'mg^2/L^3', str: 'mg^2/L^3', hash: '_mg2__L3', tex: '\\frac{mg^{2}}{L^{3}}', html: 'mg<sup>2</sup>/L<sup>3</sup>'},
  {str0: 'mg/L/s', str: 'mg/L/s', hash: '__s_mg__L', tex: '\\frac{mg}{L \\cdot s}', html: 'mg/L/s'},
  {str0: 'm^1.33/kg^2.2', str: 'm^1.33/kg^2.2', hash: '_m1_33__kg2_2', tex: '\\frac{m^{1.33}}{kg^{2.2}}', html: 'm<sup>1.33</sup>/kg<sup>2.2</sup>'},
  {str0: '1/L', str: '1/L', hash: '__L', tex: '\\frac{1}{L}', html: '1/L'},
  {str0: 'uM*L', str: 'uM*L', hash: '_uM_L', tex: 'uM \\cdot L', html: 'uM&times;L'},
  {str0: 'L/cm^2/ h', str: 'L/cm^2/h', hash: '__h__cm2_L', tex: '\\frac{L}{cm^{2} \\cdot h}', html: 'L/cm<sup>2</sup>/h'},
  // 
  {str0: 'xxx_yyy', str: 'xxx_yyy', hash: '_xxx_yyy', tex: 'xxx\\_yyy', html: 'xxx_yyy'},
  {str0: 'xxx_yyy*aaa_bbb^2', str: 'xxx_yyy*aaa_bbb^2', hash: '_xxx_yyy_aaa_bbb2', tex: 'xxx\\_yyy \\cdot aaa\\_bbb^{2}', html: 'xxx_yyy&times;aaa_bbb<sup>2</sup>'},
  {str0: 'u12x', str: 'u12x', hash: '_u12x', tex: 'u12x', html: 'u12x'},
  {str0: '(L)', str: 'L', hash: '_L', tex: 'L', html: 'L'},
  {str0: '(metre)^2', str: 'metre^2', hash: '_metre2', tex: 'metre^{2}', html: 'metre<sup>2</sup>'},
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
