// submodel 1 without structures
let c = new Container();

c.insert(new Scene(), 'scn1').merge({
  scope: 'one',
  type: 'kinetic',
  method: {timeRange: [0,120], timeStep: 2, solver: 'lsoda'}
});

c.insert(new Compartment(), 'comp1', 'one');
c.insert(new Compartment(), 'comp2', 'one');

c.insert(new Species(), 'A', 'one').merge({in: 'comp1'});
c.insert(new Species(), 'B', 'one').merge({in: 'comp1'});
c.insert(new Species(), 'C', 'one').merge({in: 'comp2'});

c.insert(new Reaction(), 'r1', 'one').merge({reactants: 'A -> B'});
c.insert(new Reaction(), 'r2').merge({reactants: 'B -> C'});

c.insert(new Quantity(), 'k1', 'one');
c.insert(new Quantity(), 'k2', 'one');

c.select('comp1', 'one').merge({
  variable: {kind: 'static', size: 0.5}
});
c.select('comp2', 'one').merge({
  variable: {kind: 'static', size: 0.3}
});
c.select('A', 'one').merge({
  variable: {kind: 'dynamic', size: 10}
});
c.select('B', 'one').merge({
  variable: {kind: 'dynamic', size: 1}
});
c.select('C', 'one').merge({
  variable: {kind: 'dynamic', size: 0}
});
c.select('r1', 'one').merge({
  variable: {kind: 'rule', size: 'comp1*k1*A'}
});
c.select('r2', 'one').merge({
  variable: {kind: 'rule', size: 'comp1*k2*B'}
});
c.select('k1', 'one').merge({
  variable: {kind: 'static', size: 0.01}
});
c.select('k2', 'one').merge({
  variable: {kind: 'static', size: 0.02}
});

// submodel 2 with structures

// TODO
