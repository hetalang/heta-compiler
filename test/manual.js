const Declaration = require('../src/declaration');
const declarationArg = require('./declaration/test-platform');

let coreDirname = './declaration';

let d = new Declaration(declarationArg, coreDirname);

console.log(d);
