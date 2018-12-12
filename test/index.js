
const fs = require('fs');
const { Platform } = require('../meta');

function pjs(o){
  return JSON.stringify(o, null, 2);
}

const platform = new Platform({
  id: 'testPlatform',
  title: 'Test platform',
  notes: 'This is *test* platform'
});

// scene

let scn1 = new platform.Scene({
  title: 'title 1',
  xxx: 'sss',
  _id: 'eee'
}).update({
  title: 'title 2'
}).update({
  notes: 'added notes'
}).addTo(platform);

platform.import({
  class: 'Scene',
  _id: 'i1',
  title: 'title 1',
  xxx: 'sss'
});

platform.import({
  class: 'Scene',
  _id: 'i1',
  title: 'title 2'
});

platform.import({
  class: 'Scene',
  _id: 'i1',
  notes: 'added notes'
});

// numeric

let num1 = new platform.Numeric({
  title: 'ttt',
  num: 1.2
}).update({
  title: 'lll',
  num: 1.3
}).update(
  1.4
);

platform.import({
  class: 'Numeric',
  _id: 'i2',
  title: 'ttt',
  num: 1.2
});

platform.import({
  class: 'Numeric',
  _id: 'i2',
  title: 'lll',
  num: 1.3
});

platform.import({
  class: 'Numeric',
  _id: 'i2',
  num: 1.4
});

// quantity

let quant1 = new platform.Quantity({
  variable: {
    id: 'p1',
    size: 1.4
  }
}).update({
  title: 'quantity 1'
}).update({
  variable: {
    id: 'p2',
    kind: 'Rule',
    size: {expr: 'x*y*z'}
  }
}).update({
  variable: {
    size: num1.addTo(platform)
  }
}).addTo(platform);

platform.import({
  _id: 'i3',
  class: 'Quantity',
  variable: {
    id: 'p1',
    size: 1.4
  }
});

platform.import({
  _id: 'i3',
  class: 'Quantity',
  title: 'quantity 1'
});

platform.import({
  _id: 'i3',
  class: 'Quantity',
  variable: {
    id: 'p2',
    kind: 'Rule',
    size: {expr: 'x*y*z', _id: 'j111', title: 'hello'}
  }
});

platform.import({
  _id: 'i3',
  class: 'Quantity',
  variable: {
    id: 'p2',
    kind: 'Rule',
    size: {expr: 'x*y', _id: 'j112'}
  }
});

// other

let comp1 = new platform.Compartment({
  variable: {
    id: 'comp1',
    size: 'g-h'
  }
});

let react1 = new platform.Reaction({
  notes: 'Hello *World*!',
  variable: {
    id: 'comp1',
    size: 'j^k'
  },
  effectors: [{targetRef: 's'}]
});

let json = pjs(platform);
//console.log(json);

fs.writeFileSync('./result.json', json);
