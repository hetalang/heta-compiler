const { _Simple, Scene, Container, Quantity, Numeric, Expression } = require('../src');

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
    //id: 'k1',
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
    id: 'r1',
    size: expr1
  }
});
c.insert(o3, 'f0');

// from previous version, using importOne

c.importOne({
  class: 'Quantity',
  id: 'r1',
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

// output

//let arr = c.toJSON();
console.log(c.select('r1', 'default').notesHTML);
//console.log(num1.toQ());
