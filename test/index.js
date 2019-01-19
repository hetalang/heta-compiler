const fs = require('fs');
const { Scene, Container, Quantity, Numeric, Expression, Species } = require('../src');

let c = new Container;

c.import({
  class: 'Quantity',
  id: 'k1',
  space: 'default'
}).import({
  class : 'Compartment',
  id: 'cmp1',
  space: 'default',
  variable: {kind: 'dynamic'}
}).import({
  class: 'Species',
  id: 's1',
  space: 'default',
  compartmentRef: 'cmp1',
  variable: {kind: 'dynamic'}
}).import({
  class: 'Scene',
  id: 'scn1',
  scope: 'default'
});

let out = c.select({id: 'scn1'}).populate();

c.importMany([
  {
    class: 'Process',
    id: 'v_cmp1_growth',
    space: 'default',
    variable: {kind: 'rule', size: 'k1'},
    actors: [
      {targetRef: 'cmp1', stoichiometry: 2}
    ]
  },
  {
    class: 'Reaction',
    id: 'r1',
    space: 'default',
    variable: {kind: 'rule', size: 's1*cmp1*k1'},
    actors: [
      {targetRef: 's1', stoichiometry: -1}
    ]
  }
]);

console.log(c.select({id: 'scn1'}).listOfProcesses);
fs.writeFileSync('result.xml', c.select({id: 'scn1'}).toSBML());
//console.log(c.storage[4]);
