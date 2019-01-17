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

let c = new Container()
  .insert(x1, 'x1')
  .insert(scn1, 'scn1')
  .insert(new _Simple, 'x2');

let x2 = c.select('x2').merge({
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
c.insert(o2, 'k0', 'one');

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
c.insert(o3, 'f0');

// from previous version, using importOne

c.importOne({
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
}, 'upsert').importOne({
  id: 'r1',
  space: 'default',
  title: 'updated title',
  variable: {kind: 'dynamic'}
}, 'upsert');

c.importOne({
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

c.select('scn2')
  //.check()
  .populate();

  //console.log(scn1.listOfInitialAssignments);
  //fs.writeFileSync('result.xml', scene.toSBML());
