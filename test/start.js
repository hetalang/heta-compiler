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
    size: 0.2
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
container.importOne({
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

container.importOne({
  class: 'Compartment',
  title: 'This is compartment',
  variable: {
    id: 'comp1',
    size: 5.2
  }
});

container.importMany([
  {
    class: 'Compartment',
    variable: {id: 'comp2', size: 3.2}
  },
  {
    class: 'Quantity',
    variable: {id: 'p2', size: 15.223}
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
    variable: {id: 'r3', kind: 'rule', size: 28},
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

//console.log(scene._components)
// console.log(scene.listOfSpecies())
console.log(scene);
fs.writeFileSync('result.xml', scene.toSBML());
