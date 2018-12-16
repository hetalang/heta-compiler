const fs = require('fs');
const clss = require('../src');

function pjs(o){
  return JSON.stringify(o, null, 2);
}

let o2 = new clss.Quantity({
  title: 'Test platform',
  notes: 'This is *test* platform',
  tags: ['a', 'b'],
  aux: {a:1, b:2},
  variable: {
    id: 'k1',
    size: 0.2,
    units: '1/min'
  }
});

let o3 = new clss.Quantity({
  title: 'Test platform',
  notes: 'This is *test* platform',
  tags: ['a', 'b', 'c'],
  aux: {a:1, b:2, c: 3},
  variable: {
    id: 'r1',
    size: 'm*a'
  }
});

let container = new clss.Container();
let q1 = container.importOne({
  class: 'Quantity',
  title: 'Test platform',
  notes: 'This is *test* platform',
  tags: ['a', 'b', 'c'],
  aux: {a:1, b:2, c: 3},
  variable: {
    id: 'r1',
    kind: 'rule',
    size: 'm*a'
  }
});

let comp1 = container.importOne({
  class: 'Compartment',
  title: 'This is compartment',
  notes: 'This is just text. *italic*, **bold**\n\nanother line',
  variable: {
    id: 'comp1',
    size: 5.2,
    units: 'L'
  }
});

container.importMany([
  {
    class: 'Compartment',
    variable: {id: 'comp2', size: 3.2}
  },
  {
    class: 'Quantity',
    variable: {id: 'p2', size: 15.223, units: '1/min/fM*nm'}
  },
  {
    class: 'Quantity',
    variable: {id: 'p3', kind: 'rule', size: 15.223}
  },
  {
    class: 'Species',
    variable: {id: 's1', kind: 'dynamic', size: 1.1},
    compartmentRef: 'comp1'
  },
  {
    class: 'Species',
    title: 's2 title',
    variable: {id: 's2', kind: 'rule', size: 'x*y'},
    compartmentRef: 'comp1'
  },
  {
    class: 'Reaction',
    variable: {id: 'r2', kind: 'rule', size: 'p2*comp1*s1'},
    actors: [
      {targetRef: 's1', stoichiometry: -2},
      {targetRef: 's2', stoichiometry: 1}
    ],
    effectors: [
      {targetRef: 's2'}
    ]
  },
  {
    class: 'Reaction',
    variable: {id: 'r3', kind: 'rule', size: 28, units: 'mole/L'},
    effectors: [
      {targetRef: 's2'}
    ]
  }
]);

let scene = container.importOne({
  class: 'Scene',
  filter: {}
});
scene.populate();
scene.checkReferences();

console.log(scene.getUniqueUnits()[1].getUnitDefinition());
fs.writeFileSync('result.xml', scene.toSBML());
//console.log(container._storage[0].variable.size.exprCMathML);
