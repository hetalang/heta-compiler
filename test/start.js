const fs = require('fs');
const { _Simple, Scene, Container, Quantity, Numeric, Expression, Species } = require('../src');

let x1 = (new _Simple).merge({
  title: 'This is the title',
  notes: 'This is the notes.',
  tags: ['tag1', 'tag2'],
  aux: {'aaa': 'bbb'}
});

let scn1 = (new Scene).merge({
  title: 'test scene',
  scope: 'one',
  kind: 'kinetic',
  method: {timeRange: [0,120], timeStep: 2, solver: 'lsoda'}
}).merge({
  scope: 'two'
});

let c = new Container();

c._storage.set({id: 'x1'}, x1);
c._storage.set({id: 'scn1'}, scn1);
c._storage.set({id: 'x2'}, new _Simple);

let x2 = c.select({id: 'x2'}).merge({
  title: 'selected simple obj'
});

// from previous version, using new

let num1 = new Numeric(0.2);
let o2 = (new Quantity).merge({
  title: 'Test platform',
  notes: 'This is *test* platform',
  tags: ['a', 'b'],
  aux: {a:1, b:2},
  variable: {
    kind: 'dynamic',
    size: num1,
    units: '1/min'
  }
});
c._storage.set({id: 'k0', space: 'one'}, o2);

let expr1 = new Expression('m*c^2');
let o3 = (new Quantity).merge({
  title: 'Test platform',
  notes: 'This is *test* platform',
  tags: ['a', 'b', 'c'],
  aux: {a:1, b:2, c: 3},
  variable: {
    size: expr1
  }
});
c._storage.set({id: 'f0', space: 'default'}, o3);

let xxx = c.import({
  class: 'Quantity',
  id: 'r1',
  space: 'default',
  title: 'Test platform',
  notes: 'This is *test* platform',
  tags: ['a', 'b', 'c'],
  aux: {a:1, b:2, c: 3},
  variable: {
    kind: 'rule',
    size: expr1
  }
}, 'upsert');

// from previous version, using import

c.import({
  class: 'Quantity',
  id: 'r1',
  space: 'default',
  title: 'Test platform',
  notes: 'This is *test* platform',
  tags: ['a', 'b', 'c'],
  aux: {a:1, b:2, c: 3},
  variable: {
    kind: 'rule',
    size: expr1
  }
}, 'upsert').import({
  id: 'r1',
  space: 'default',
  title: 'updated title',
  variable: {kind: 'dynamic'}
}, 'upsert');

c.import({
  class: 'Compartment',
  id: 'comp1',
  space: 'default',
  title: 'This is compartment',
  notes: 'This is just text. *italic*, **bold**\n\nanother line',
  variable: {
    size: 'x*y',
    units: 'L'
  }
});

c.importMany([
  {
    class: 'Compartment',
    id: 'comp2',
    space: 'default',
    variable: {size: 3.2}
  },
  {
    class: 'Quantity',
    id: 'p2',
    space: 'default',
    variable: {size: 15.223, units: '1/min/fM*nm'}
  },
  {
    class: 'Quantity',
    id: 'p3',
    space: 'default',
    variable: {kind: 'rule', size: 15.223}
  },
  {
    id: 'p3',
    space: 'default',
    variable: {kind: 'rule', size: 'xxx*yyy', units: '1/L/h'}
  },
  {
    class: 'Species',
    id: 's1',
    space: 'default',
    variable: {kind: 'dynamic', size: 1.1},
    compartmentRef: 'comp3'
  },
  {
    class: 'Species',
    id: 's2',
    space: 'default',
    title: 's2 title',
    variable: {kind: 'rule', size: 'x*y'},
    compartmentRef: 'comp1'
  },
  {
    class: 'Reaction',
    id: 'r2',
    space: 'default',
    variable: {kind: 'rule', size: 'p2*comp1*s1'},
    actors: [
      {targetRef: 's4', stoichiometry: -2},
      {targetRef: 's2', stoichiometry: 1}
    ],
    effectors: [
      {targetRef: 's2'}
    ]
  },
  {
    class: 'Reaction',
    id: 'r3',
    space: 'default',
    variable: {kind: 'rule', size: 28, units: 'mole/L'},
    effectors: [
      {targetRef: 's2'}
    ]
  },
  {
    class: 'Scene',
    id: 'scn2',
    scope: 'default'
  }
]);

let scn2 = c.select({id: 'scn2'})
  //.check()
  .populate();

//console.log(scn2.toSBML());
//console.log(c.select({id: 'p3', space: 'default'}).getUnitDefinition()); //
fs.writeFileSync('result.xml', scn2.toSBML());
