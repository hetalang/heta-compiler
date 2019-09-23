const { Container } = require('../src');

let c = new Container();
const { Reaction } = c.classes;

let r = new Reaction({id: 'r', space: 'one'});

console.log(Reaction.requirements())
