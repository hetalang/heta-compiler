/*global describe, it*/
const { expect } = require('chai');
const { Expression } = require('../../src/core/expression');

describe('Expression constructor.', () => {
  it('No argument throws.', () => {
    expect(() => {
      let expr = new Expression();
    }).throw(TypeError);
  });
  it('Empty argument throws', () => {
    expect(() => {
      let expr = new Expression({});
    }).throw(TypeError);
  });
  it('mc^2', () => {
    let expr = new Expression('m*c^2');
    expect(expr.expr).to.be.equal('m * c ^ 2');
    expect(expr.toQ()).to.be.deep.equal({
      expr: 'm * c ^ 2'
    });
  });
  it('Bad expression string throws.', () => {
    expect(() => {
      let expr = new Expression('e*(m');
    }).throw(TypeError);
  });
});

try{
  let expr = new Expression('m*(c^2');
}catch(e){
  console.log(JSON.stringify(e, null, 2))
  console.log(e.name)
  console.log(e.message)
}
