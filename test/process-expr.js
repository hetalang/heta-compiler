/* global describe, it */
const { rct2actors } = require('../src/core/process');

const { expect } = require('chai');

describe('Tesing parsing of ProcessExpr', () => {
  it('A->B', () => {
    let res = rct2actors('A->B');
    expect(res.isReversible).to.be.false;
    expect(res.targetArray).to.be.lengthOf(2);
  });
  it('A-B', () => {
    let res = rct2actors('A-B');
    expect(res.isReversible).to.be.undefined;
    expect(res.targetArray).to.be.lengthOf(2);
  });
  it('A<->B', () => {
    let res = rct2actors('A<->B');
    expect(res.isReversible).to.be.true;
    expect(res.targetArray).to.be.lengthOf(2);
  });
  
  it('A=>B', () => {
    let res = rct2actors('A=>B');
    expect(res.isReversible).to.be.false;
    expect(res.targetArray).to.be.lengthOf(2);
  });
  it('A=B', () => {
    let res = rct2actors('A=B');
    expect(res.isReversible).to.be.undefined;
    expect(res.targetArray).to.be.lengthOf(2);
  });
  it('A<=>B', () => {
    let res = rct2actors('A<=>B');
    expect(res.isReversible).to.be.true;
    expect(res.targetArray).to.be.lengthOf(2);
  });
  
  it(' A -> B ', () => {
    let res = rct2actors(' A -> B ');
    expect(res.targetArray).to.be.lengthOf(2);
  });
  it('2A->3B+4C', () => {
    let res = rct2actors('2A->3B+4C');
    expect(res.targetArray).to.be.lengthOf(3);
  });
  it(' 2 A -> 3 B + 4 C ', () => {
    let res = rct2actors(' 2 A -> 3 B + 4 C ');
    expect(res.targetArray).to.be.lengthOf(3);
  });
  it('2*A -> 3*B + 4*C', () => {
    let res = rct2actors('2*A -> 3*B + 4*C');
    expect(res.targetArray).to.be.lengthOf(3);
  });
  it(' 2 * A -> 3 * B + 4 * C ', () => {
    let res = rct2actors(' 2 * A -> 3 * B + 4 * C ');
    expect(res.targetArray).to.be.lengthOf(3);
  });
  it(' 44ff..c', () => {
    expect(() => rct2actors(' 44ff..c')).to.throw();
  });
});
